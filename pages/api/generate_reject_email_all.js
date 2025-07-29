import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { employeeId, programIds, programNames } = req.body; // Added programNames destructuring

  console.log('Received employeeId:', employeeId);
  console.log('Received programIds:', programIds);

  const htmlFilePath = path.join(process.cwd(), 'public', 'reject_email_message.html');
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

  if (!employeeId || !programIds || !Array.isArray(programIds) || programIds.length === 0) {
    return res.status(400).json({ message: 'Invalid employeeId or programIds' });
  }

  try {
    // Run stored procedure for each programId and aggregate results
    let aggregatedResults = [];
    for (const programId of programIds) {
      const result = await prisma.$queryRawUnsafe(
        `EXEC Generate_Rejection_Email_All @Employee_Id = '${employeeId}', @ProgramId = '${programId}'`
      );
      if (result && result.length > 0) {
        aggregatedResults = aggregatedResults.concat(result);
      }
    }

    console.log('Aggregated Results:', aggregatedResults);

    // Use programNames passed from frontend if available, else extract from aggregatedResults
    let programNamesList = '';
    if (programNames && Array.isArray(programNames) && programNames.length > 0) {
      programNamesList = programNames.join(', ');
    } else {
      const programNamesSet = new Set();
      aggregatedResults.forEach(row => {
        if (row.Program_Name) {
          programNamesSet.add(row.Program_Name);
        }
      });
      programNamesList = Array.from(programNamesSet).join(', ');
    }

    // Inject program names into the email content
    htmlContent = htmlContent.replace('<!-- PROGRAM_NAMES_PLACEHOLDER -->', `<p><strong>Programs:</strong> ${programNamesList}</p>`);

    if (aggregatedResults.length === 0) {
      return res.status(404).json({ message: 'No emails found to send' });
    }

    // Setup email transport (example with SMTP)
    const transporter = nodemailer.createTransport({
      host: '10.40.10.250',       // Internal SMTP server IP
      port: 25,                   // Default non-secure SMTP port
      secure: false,              // false for port 25 or 587
      auth: {
        user: process.env.EMAIL,         // e.g., you@nws.cn
        pass: process.env.APP_PASSWORD,  // App password or actual SMTP password
      },
      authMethod: 'LOGIN',        // Explicitly use LOGIN method
    });

    // Send rejection emails to all recipients in the aggregated results
    for (const row of aggregatedResults) {
      const recipientEmail = row.Email || row.email; // Adjust property name if needed
      if (recipientEmail) {
        await transporter.sendMail({
          from: process.env.EMAIL,
          to: recipientEmail,
          subject: 'Training Rejection',
          html: htmlContent,
        });
      }
    }

    return res.status(200).json({ message: 'Rejection emails sent', count: aggregatedResults.length });
  } catch (error) {
    console.error('Error sending rejection emails:', error);
    return res.status(500).json({ message: 'Error sending emails' });
  }
}
