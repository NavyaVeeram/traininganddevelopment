import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { employeeId, programIds, programNames } = req.body; // Added programNames destructuring

  console.log('Received employeeId:', employeeId);
  console.log('Received programIds:', programIds);

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

    if (aggregatedResults.length === 0) {
      return res.status(404).json({ message: 'No emails found to send' });
    }

    // Generate email HTML content dynamically
    const htmlContent = `
    <div style="max-width: 650px;margin:auto; margin-top:100px; font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff;">
  <!-- Header -->
  <div style="background-color: #0566c7ff; padding: 20px; color: white; text-align: center;">
    <h2 style="margin: 0;">Training Rejection Notification</h2>
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
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Rejected Program</th>
                 </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${programNamesList}</td>
          </tr>
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
