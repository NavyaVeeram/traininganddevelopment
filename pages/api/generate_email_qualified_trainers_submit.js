import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';

const generateEmailHTML = (username, employeeId) => `
 <div style="max-width: 650px; margin:auto;margin-top:100px;  font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background-color: #fff;">
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
      <div class="text-center">
        <a
          href="http://10.40.20.93:8070/quatrainlist"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold text-base sm:text-lg py-3 px-6 rounded-full shadow-md transition duration-300"
         style="margin-bottom: 10px;">
          View Request
        </a>
</div>
    <div style="margin: 20px 0; overflow-x: auto;">
      <table style="border-collapse: collapse; font-size: 14px; table-layout: auto;">
        <thead>
          <tr style="background-color: #e6ecff; color: #003366;">
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Username</th>
            <th style="border: 1px solid #ccc; padding: 8px; text-align: left; white-space: nowrap;">Employee ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${username}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${employeeId}</td>
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { localEmployeeId, trainingEmployeeId, username, approve } = req.body;

  console.log('Received request with approve flag:', approve);
  console.log('Received fields:', { localEmployeeId, trainingEmployeeId, username, approve });

  if (!process.env.EMAIL || !process.env.APP_PASSWORD) {
    console.error('Missing EMAIL or APP_PASSWORD environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  } 

  try {
    // Call the stored procedure to fetch email and lastSubmission flag
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Email_Qualified_Trainers_Submit '${localEmployeeId}'
    `
  );
    if (!result || result.length === 0) {
      console.log(localEmployeeId)
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


      // Generate email content inline
      const emailHtmlContent = generateEmailHTML(username, trainingEmployeeId);

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

