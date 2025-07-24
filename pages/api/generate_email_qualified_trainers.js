import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId, approve } = req.body;

  console.log('Received request with approve flag:', approve);

  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    console.error('Missing EMAIL or APP_PASSWORD environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // Call the stored procedure to fetch email and lastSubmission flag
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Email_Qualified_Trainers '${employeeId}'
    `);
    if (!result || result.length === 0) {
      console.log('No result returned from stored procedure, possibly last submission with no email needed.');
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    const { Email, IsLastSubmission } = result[0];

    if (!Email && IsLastSubmission) {
      console.log('Last submission detected with no email to send.');
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    if (!Email) {
      console.log('No valid email found in stored procedure result.');
      return res.status(400).json({ message: 'No valid email found in result' });
    }

    if (approve) {
      if (IsLastSubmission) {
        console.log('Approve flag set but last submission, no email sent.');
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

      let transporter;
      try {
        // Create transporter
        transporter = nodemailer.createTransport({
          host: '10.40.10.250',
          port: 25,
          secure: false,
          auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD,
          },
          authMethod: 'LOGIN',
        });
      } catch (transporterError) {
        console.error('Error creating transporter:', transporterError);
        return res.status(500).json({ message: 'Failed to create email transporter' });
      }

      try {
      console.log(`Sending email to ${Email}...`);
      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: Email,
        subject: 'Trainer Approval',
        html: emailHtmlContent,
      });
      console.log('Email sent successfully.');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return res.status(500).json({ message: 'Failed to send email' });
      }
    } else {
      console.log('Approve flag not set or false, skipping email sending.');
    }

    return res.status(200).json({ email: Email });

  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Error executing procedure' });
  }
}
