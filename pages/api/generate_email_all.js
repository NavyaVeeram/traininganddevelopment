// pages/api/generate-email.js
import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId, approve } = req.body;

  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    console.error('Missing EMAIL or APP_PASSWORD environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    // Call the stored procedure to fetch email
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Email_All '${employeeId}'
    `);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No email generated' });
    }

    const { Email } = result[0];
    if (!Email) {
      return res.status(400).json({ message: 'No valid email found in result' });
    }

    if (approve) {
      // Prepare email content
      const emailHtmlPath = path.resolve('./public/email_message.html');
      let emailHtmlContent;
      try {
        emailHtmlContent = fs.readFileSync(emailHtmlPath, 'utf-8');
      } catch (fileError) {
        console.error('Failed to read email template:', fileError);
        return res.status(500).json({ message: 'Failed to load email template' });
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
