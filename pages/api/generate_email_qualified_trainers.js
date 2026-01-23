import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';

const generateEmailHTML = (employeeId, usernames) => {
  const usernameRows = usernames.map(({ empCode, empName }) => `
    <tr>
      <td style="border: 1px solid #ccc; padding: 8px;">${empCode}</td>
      <td style="border: 1px solid #ccc; padding: 8px;">${empName}</td>
    </tr>
  `).join('');

  return `
<div style="max-width: 650px; margin: auto;margin-top:100px;  font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff;">
  <!-- Header -->
  <div style="background-color: #0566c7ff; padding: 20px; color: white; text-align: center;">
    <h2 style="margin: 0;">Trainer Approval Notification</h2>
  </div>

  <!-- Body Content -->
  <div style="padding: 20px; font-size: 14px; color: #333;">
    <p>Dear Sir/Madam,</p>
    <p>
      <strong>You have a pending approval request. To proceed, please click the button below to review the request in detail and take action as necessary.</strong>
    </p>
  <div class="text-center" >
        <a
          href="http://10.40.20.93:8070/quatrainlist"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold text-base sm:text-lg py-6 my-3 mx-6 px-6 rounded-full shadow-md transition duration-300"
      >
          View Request
        </a>
    <div style=" overflow-x: auto; padding-left: 0; margin-left: 0;">
      <table style="border-collapse: collapse; font-size: 14px; table-layout: auto; padding-left: 0; margin-left: 0;width: 100%;">
        <thead>
          <tr style="background-color: #e6ecff; color: #003366;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">EmployeeId</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Username</th>
          </tr>
        </thead>
        <tbody style="margin:2px;">
          ${usernameRows}
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

  let { employeeId, approve, QualId } = req.body;
  console.log('Received employeeId:', employeeId);
  console.log('Received QualId:', QualId);
  console.log('Received request with approve flag:', approve);

  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    console.error('Missing EMAIL or APP_PASSWORD environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Ensure QualId is an array for multiple values support
  if (!Array.isArray(QualId)) {
    QualId = QualId ? [QualId] : [];
  }

  const firstQualId = QualId.length > 0 ? QualId[0] : null;

  try {
    if (!approve) {
      console.log('Approve flag not set or false, skipping email sending.');
      return res.status(200).json({ message: 'Approve flag not set or false, no emails sent.' });
    }

    // Call stored procedure once for all QualIds to get Email and IsLastSubmission
    if (QualId.length === 0) {
      return res.status(400).json({ message: 'No QualId provided' });
    }

    const qualIdString = QualId.join(',');

    const spResult = await prisma.$queryRawUnsafe(
      `EXEC Generate_Email_Qualified_Trainers '${employeeId}', '${qualIdString}'`
    );

    if (!spResult || spResult.length === 0) {
      console.log(`No result returned from stored procedure for QualId ${firstQualId}, possibly last submission with no email needed.`);
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    const { Email, IsLastSubmission } = spResult[0];

    if (!Email && IsLastSubmission) {
      console.log(`Last submission detected with no email to send for QualId ${firstQualId}.`);
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    if (!Email) {
      console.log(`No valid email found in stored procedure result for QualId ${firstQualId}.`);
      return res.status(200).json({ message: 'No valid email found in result' });
    }

    console.log('EmployeeId for user query:', employeeId);
    console.log('Selected QualIds for user query:', QualId);

    // Prepare email content
    // Removed reading email template file and placeholder replacements

    // Construct Username list HTML from request body Usernames array
    let usernames = [];
    console.log('Received Usernames:', req.body.Usernames);
    if (Array.isArray(req.body.Usernames) && req.body.Usernames.length > 0) {
      usernames = req.body.Usernames.map(username => {
        const parts = username.split(' | ');
        return {
          empCode: parts[0] || '',
          empName: parts[1] || ''
        };
      });
      console.log('Parsed usernames:', usernames);
    } else {
      usernames = [{ empCode: 'N/A', empName: 'Usernames not provided' }];
    }

    // Replace placeholders with actual values globally
    // Removed placeholder replacements on emailHtmlContent

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
      console.log(`Sending email to ${Email} for QualIds ${QualId.join(', ')}...`);
      // Send the email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: Email,
        subject: 'Trainer Approval',
        html: generateEmailHTML(employeeId, usernames),
      });
      console.log('Email sent successfully.');
      return res.status(200).json({ message: 'Email sent', email: Email });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ message: 'Failed to send email' });
    }

  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({ message: 'Error executing query' });
  }
}