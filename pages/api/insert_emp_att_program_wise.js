import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { Program_Id, EmployeeIds, CreatedBy } = req.body;

    if (typeof Program_Id !== 'number' || Program_Id <= 0) {
      return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
    }
    if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
      return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
    }
    if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
    }
    
    const employeeCsv = EmployeeIds.join(',');

    try {
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Insert_Emp_Att_Program_Wise]
        @Program_Id = ${Program_Id},
        @EmployeeIds = ${employeeCsv},
        @CreatedBy = ${CreatedBy}
      `;

      console.log("SP Result:", result);
      res.status(200).json({ message: result[0]?.Result || 'Success, but no message returned.' });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Database error.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
