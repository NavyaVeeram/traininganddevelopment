import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
if (req.method === 'POST') {
    const { Program_Id, EmployeeIds, CreatedBy } = req.body;

    if (!Program_Id || !Array.isArray(EmployeeIds) || EmployeeIds.length === 0 || !CreatedBy) {
        return res.status(400).json({ message: 'Missing or invalid input.' });
      }

    try{
        const employeeCsv = EmployeeIds.join(',');
        console.log("Inserting Employees:", employeeCsv);

        const result = await prisma.$queryRaw`
        EXEC [dbo].[Insert_Emp_Att_Program_Wise]
        @Program_Id = ${Program_Id},
        @EmployeeIds = ${employeeCsv},
        @CreatedBy = ${CreatedBy}`;

        res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while updating the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}