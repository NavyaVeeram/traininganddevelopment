import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { Program_Id, EmployeeId, Status, CreatedBy } = req.body;

    if (!Program_Id || !EmployeeId || typeof Status === 'undefined' || !CreatedBy) {
      console.error("Missing required fields:", { Program_Id, EmployeeId, Status, CreatedBy });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Update_Emp_Att_Program_Wise_Status]
          @Program_Id = ${Program_Id},
          @EmployeeId = ${EmployeeId},
          @Status = ${Status},
          @CreatedBy = ${CreatedBy}
      `;
   console.log('Calling stored procedure with parameters:', {
       Program_Id,
       EmployeeId,
       Status,
       CreatedBy
      })
      console.log("Result from stored procedure:", Program_Id, EmployeeId, Status, CreatedBy);

      if (result && result[0] && result[0].Result) {
        res.status(200).json({ success: true, message: result[0].Result });
      } else {
        console.error("Unexpected result format:", result);
        res.status(500).json({ success: false, message: 'Unexpected result format from stored procedure' });
      }
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ success: false, message: 'Error occurred while updating the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}