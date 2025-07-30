
import { prisma } from '../../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

  // For single QualId, use the first one
  const selectedQualId = QualId.length > 0 ? parseInt(QualId[0], 10) : null;

  try {
    // Call stored procedure to get Email and IsLastSubmission
    const spResult = await prisma.$queryRawUnsafe(
      `EXEC Generate_Email_Qualified_Trainers '${employeeId}', '${selectedQualId || ''}'`
    );

    if (!spResult || spResult.length === 0) {
      console.log('No result returned from stored procedure, possibly last submission with no email needed.');
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    const { Email, IsLastSubmission } = spResult[0];

    if (!Email && IsLastSubmission) {
      console.log('Last submission detected with no email to send.');
      return res.status(200).json({ message: 'Last submission successful', email: null });
    }

    if (!Email) {
      console.log('No valid email found in stored procedure result.');
      return res.status(400).json({ message: 'No valid email found in result' });
    }

    console.log('EmployeeId for user query:', employeeId);
    console.log('Selected QualId for user query:', selectedQualId);

    // Query to get Username and EmployeeId for the selected QualIds
    const userResult = await prisma.$queryRawUnsafe(
      `SELECT qtl.Qual_Id, umh.Username, umh.EmployeeId
       FROM Qualified_Trainer_List qtl
       INNER JOIN UserMaster_HR umh ON qtl.EmployeeId = umh.EmployeeId
       WHERE qtl.Qual_Id IN (${QualId.join(',')})`
    );

    console.log('User query result:', userResult);

    // Format list of usernames and employee IDs
    const qualUserList = userResult && userResult.length > 0
      ? userResult.map(u => `<li>${u.Username ? u.Username : 'Unknown'} (EmployeeId: ${u.EmployeeId})</li>`).join('')
      : '';

    console.log('Formatted qualUserList:', qualUserList);

    if (approve) {
      // Prepare email content
      const emailHtmlPath = path.resolve('./public/email_message_qualified_trainer.html');
      let emailHtmlContent;
      try {
        emailHtmlContent = fs.readFileSync(emailHtmlPath, 'utf-8');
      } catch (fileError) {
        console.error('Failed to read email template:', fileError);
        return res.status(500).json({ message: 'Failed to load email template' });
      }

      // Replace placeholders with actual values globally
      emailHtmlContent = emailHtmlContent.replace(/{{Username}}/g, `<ul>${qualUserList}</ul>`);
      emailHtmlContent = emailHtmlContent.replace(/{{Qual_Id}}/g, ''); // Clear single Qual_Id placeholder
  

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
    console.error('Error executing query:', error);
    return res.status(500).json({ message: 'Error executing query' });
  }
}
