import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId, approve, programId, } = req.body;

  console.log('Received employeeId:', employeeId);

  // Normalize programId to array for consistent processing
  let programIdsArray = [];
  if (Array.isArray(programId)) {
    programIdsArray = programId;
  } else if (typeof programId === 'string') {
    programIdsArray = programId.split(',').map(id => id.trim());
  }
  console.log('Received programIds:', programIdsArray);

  // Fetch Program_Names for all programIds
  let programNames = [];
  if (programIdsArray.length > 0) {
    try {
      const programNamesResults = await Promise.all(
        programIdsArray.map(id =>
          prisma.$queryRawUnsafe("EXEC [dbo].[Get_TET_Form_Program_Name] @Program_Id = '" + id + "'")
        )
      );
      programNames = programNamesResults.flat().map(p => p.Program_Name || '').filter(name => name);
    } catch (error) {
      console.error('Error fetching program names:', error);
    }
  }
  console.log('Program_Names:', programNames);

  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    console.error('Missing EMAIL or APP_PASSWORD environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // Call the stored procedure to fetch email and lastSubmission flag
    const result = await prisma.$queryRawUnsafe(
      "EXEC Generate_Email_All '" + employeeId + "', '" + (programId || '') + "'"
    );
    if (!result || result.length === 0) {
      // Maybe it's the last submission, but no email is needed
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    const { Email, IsLastSubmission } = result[0];

    if (!Email && IsLastSubmission) {
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    if (!Email) {
      return res.status(400).json({ message: 'No valid email found in result' });
    }

    if (approve) {
      if (IsLastSubmission) {
        // Last submission: do not send email, just return success message
        return res.status(200).json({ message: 'Last submission successful', email: null });
      }

      // Prepare email content
      const emailHtmlPath = path.resolve('./public/email_message.html');
      let emailHtmlContent;
      try {
        emailHtmlContent = fs.readFileSync(emailHtmlPath, 'utf-8');
      } catch (fileError) {
        console.error('Failed to read email template:', fileError);
        return res.status(500).json({ message: 'Failed to load email template' });
      }

      // Inject all Program_Names into email content as comma separated string
      if (programNames.length > 0) {
        const programNamesStr = programNames.join(', ');
        emailHtmlContent = emailHtmlContent.replace(/{{Program_Name}}/g, programNamesStr);
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: '10.40.10.250',
        port: 25,
        secure: false,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASSWORD,
        },
        authMethod: 'LOGIN',
      });

      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: Email,
        subject: 'Training Approval',
        html: emailHtmlContent,
      });
    }

    return res.status(200).json({ email: Email });

  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Error executing procedure' });
  }
}
