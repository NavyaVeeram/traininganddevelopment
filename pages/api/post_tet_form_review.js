// pages/api/postTetFormReview.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Make sure only POST requests are handled
  if (req.method === 'POST') {
    const {
      Program_Id,
      EmployeeId,
      Q_1,
      Q_2,
      Q_3,
      Q_4,
      Q_5,
      Q_6,
      Q_7,
      Q_8,
      Q_9,
      Q_10,
      Overall,
      Percentage,
      Remarks,
      CreatedBy
    } = req.body;

    try {
      // Calling the stored procedure (or executing a query) via Prisma
      const result = await prisma.$executeRaw`
        EXEC dbo.sp_Post_Tet_Form_Review 
          ${Program_Id}, 
          ${EmployeeId}, 
          ${Q_1}, 
          ${Q_2}, 
          ${Q_3}, 
          ${Q_4}, 
          ${Q_5}, 
          ${Q_6}, 
          ${Q_7}, 
          ${Q_8}, 
          ${Q_9}, 
          ${Q_10}, 
          ${Overall}, 
          ${Percentage},
          ${Remarks}, 
          ${CreatedBy};
      `;
      
      
      // Return success or failure based on result
      res.status(200).json({ message: 'Data added successfully', result });
    } catch (error) {
      console.error("Error in post_tet_form_review API:", error);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    // Method Not Allowed
    res.status(405).json({ error: 'Method not allowed' });
  }
}
