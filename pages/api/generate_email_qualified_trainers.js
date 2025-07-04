// import { prisma } from '../../lib/prisma';

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const { employeeId } = req.body;

//   if (!employeeId) {
//     return res.status(400).json({ message: 'EmployeeId is required' });
//   }

//   try {
//     // Call the stored procedure using prisma.$queryRaw
//     const result = await prisma.$queryRaw`
//       EXEC Generate_Email_Qualified_Trainers @EmployeeId=${employeeId}
//     `;

//     // result is an array of records, take the first record's Email property if exists
//     const email = result && result.length > 0 ? result[0].Email : null;

//     return res.status(200).json({ email });
//   } catch (error) {
//     console.error('Error executing stored procedure:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }
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
    // Call the stored procedure to fetch email and lastSubmission flag
    const result = await prisma.$queryRawUnsafe(`
      EXEC Generate_Email_Qualified_Trainers '${employeeId}'
    `);
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

