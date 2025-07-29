import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  let { employeeId, QualId } = req.body;
  console.log('Received employeeId:', employeeId);
  console.log('Received QualId:', QualId);

  // If QualId is an array, convert to comma-separated string
  let qualIdArray = [];
  if (Array.isArray(QualId)) {
    qualIdArray = QualId;
    QualId = QualId.join(',');
  } else if (typeof QualId === 'string') {
    qualIdArray = QualId.split(',').map(id => id.trim());
  }

  const htmlFilePath = path.join(process.cwd(), 'public', 'reject_email_qualified_trainer.html');
  let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

  try {
    // Run stored procedure
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Rejection_Email_For_Trainers @Employee_Id = '${employeeId}', @QualId = '${QualId}'
    `);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No emails found to send' });
    }

    // Query usernames and EmployeeIds for the selected Qual_Id values
    const usernamesData = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT U.Username, U.EmployeeId
      FROM Qualified_Trainer_List Q
      INNER JOIN UserMaster_HR U ON Q.EmployeeId = U.EmployeeId
      WHERE Q.Qual_Id IN (${qualIdArray.map(id => parseInt(id)).join(',')})
    `);

    // Log usernames and EmployeeIds to console
    console.log('Usernames and EmployeeIds for selected Qual_Id:', usernamesData.map(row => ({ Username: row.Username, EmployeeId: row.EmployeeId })));

    // Generate HTML list of usernames and EmployeeIds
    let usernamesHtml = '<p><strong>Rejected trainers:</strong></p><ul>';
    for (const row of usernamesData) {
      usernamesHtml += `<li>${row.Username} (EmployeeId: ${row.EmployeeId})</li>`;
    }
    usernamesHtml += '</ul>';

    // Replace placeholder in email template with usernames HTML
    htmlContent = htmlContent.replace('<!-- PROGRAM_NAMES_PLACEHOLDER -->', usernamesHtml);

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
          subject: 'Trainer Rejection',
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
