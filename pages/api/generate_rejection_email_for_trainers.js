import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';


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

  console.log('QualId array for SQL query:', qualIdArray);

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
       SELECT DISTINCT EM.EmpName AS Username, Q.EmployeeId
      FROM Qualified_Trainer_List Q
      LEFT JOIN MISQA..Employee_Master em ON EM.EmpCode = Q.EmployeeId
      WHERE Q.Qual_Id IN (${qualIdArray.map(id => parseInt(id)).join(',')})
    `);

    // Log usernames and EmployeeIds to console
    console.log('Usernames and EmployeeIds for selected Qual_Id:', usernamesData.map(row => ({ Username: row.Username, EmployeeId: row.EmployeeId })));

    // Generate HTML table rows of usernames and EmployeeIds
    let tableRowsHtml = '';
    for (const row of usernamesData) {
      tableRowsHtml += `
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px;">${row.Username}</td>
          <td style="border: 1px solid #ccc; padding: 8px;">${row.EmployeeId}</td>
        </tr>
      `;
    }

    // Replace placeholder in email template with table rows HTML
       // Generate email HTML content dynamically
    const htmlContent = `
    <div style="max-width: 650px; margin: auto; margin-top:100px; font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff;">
  <!-- Header -->
  <div style="background-color: #0566c7ff; padding: 20px; color: white; text-align: center;">
    <h2 style="margin: 0;">Trainer Rejection Notification</h2>
  </div>

  <!-- Body Content -->
  <div style="padding: 20px; font-size: 14px; color: #333;">
    <p>Dear Sir/Madam,</p>
     <p>
      <strong>  You have a rejection email. </strong>
    </p>
    <div style="margin: 20px 0; overflow-x: auto;">
      <table style="border-collapse: collapse; font-size: 14px; table-layout: auto;">
        <thead>
          <tr style="background-color: #e6ecff; color: #003366;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Username</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">EmployeeId</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </div>
<p>If you believe this email was sent in error, please ignore it or contact support for assistance.</p>
      <p>Thanks & Regards</p>
  </div>

  <!-- Footer -->
  <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777;">
    © QA-MIS | Greentech Industries
  </div>
</div>

    `;
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
