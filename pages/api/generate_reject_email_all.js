// pages/api/reject-email-all.js
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { employeeId } = req.body;
const htmlFilePath = path.join(process.cwd(), 'public', 'reject_email_message.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

  try {
    // Run stored procedure
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Rejection_Email_All @Employee_Id = '${employeeId}'
    `);

    if (!result || result.length === 0) {
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

    // Send rejection emails to all recipients in the result
    for (const row of result) {
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

    return res.status(200).json({ message: 'Rejection emails sent', count: result.length });
  } catch (error) {
    console.error('Error sending rejection emails:', error);
    return res.status(500).json({ message: 'Error sending emails' });
  }
}
