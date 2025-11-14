import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';

const generateEmailHTML = (programNames) => {
  // Generate table rows for each program name
  const programNamesRows = programNames.length > 0
    ? programNames.map(name => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">${name}</td>
      </tr>
    `).join('')
    : '';

  return `
  <div style="max-width: 650px; margin: auto; margin-top:100px; font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff;">
    <!-- Header -->
    <div style="background-color: #0566c7ff; padding: 20px; color: white; text-align: center;">
      <h2 style="margin: 0;">Training Approval Notification</h2>
    </div>

    <!-- Body Content -->
    <div style="padding: 20px; font-size: 14px; color: #333;">
      <p>Dear Sir/Madam,</p>
       <p>
      <strong>You have a pending approval request. To proceed, please click the button below to review the request in detail and take action as necessary.</strong>
    </p> 
      <div class="text-center">
        <a
          href="http://10.40.20.5:100"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold text-base sm:text-lg py-3 px-6 rounded-full shadow-md transition duration-300"
        >
          View Request
        </a>  

      <div style="margin: 20px 0; overflow-x: auto;">
        <table style="border-collapse: collapse; font-size: 14px; table-layout: auto;">
          <thead>
            <tr style="background-color: #e6ecff; color: #003366;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Program Name</th>
            </tr>
          </thead>
          <tbody>
            ${programNamesRows}
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
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId, approve, programId } = req.body;

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
          prisma.$queryRawUnsafe("EXEC [dbo].[Get_TET_Form_Program_Name] @Program_Ids = '" + id + "'")
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

      // Generate email content inline
      const emailHtmlContent = generateEmailHTML(programNames);

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
