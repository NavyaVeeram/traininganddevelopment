import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

function validateEmailFormat(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, department, section, employeeId } = req.body;

    if (!email || !validateEmailFormat(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Read the email_message.html content
    const emailHtmlPath = path.join(process.cwd(), 'public', 'email_message.html');
    const message = await fs.readFile(emailHtmlPath, 'utf-8');

    // Compose the email content with department and employeeId included
    const fullMessage = `
      ${message}<br/><br/>
      Department: ${department || 'N/A'}<br/>
      Section: ${section || 'N/A'}<br/>
      Employee ID: ${employeeId || 'N/A'}<br/><br/>
      Best Regards,<br/>
      Your Team
    `;

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

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: `Message from ${employeeId}`,
      html: fullMessage,
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
