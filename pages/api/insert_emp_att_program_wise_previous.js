// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { Program_Id, EmployeeIds, CreatedBy } = req.body;

//     if (typeof Program_Id !== 'number' || Program_Id <= 0) {
//       return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
//     }
//     if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
//       return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
//     }
//     if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
//       return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
//     }
    
//     const employeeCsv = EmployeeIds.join(',');

//     try {
//       const result = await prisma.$queryRaw`
//         EXEC [dbo].[Insert_Emp_Att_Program_Wise]
//         @Program_Id = ${Program_Id},
//         @EmployeeIds = ${employeeCsv},
//         @CreatedBy = ${CreatedBy}
//       `;

//       console.log("SP Result:", result);
//       res.status(200).json({ message: result[0]?.Result || 'Success, but no message returned.' });

//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ message: 'Database error.', error: error.message });
//     }
//   } else {
//     res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log("API received:", req.body);
    console.log("Program_Id:", req.body.Program_Id, typeof req.body.Program_Id);
    
    const { Program_Id, EmployeeIds, CreatedBy } = req.body;
    
    // Keep Program_Id as string for comma-separated values
    if (!Program_Id || typeof Program_Id !== 'string' || Program_Id.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
    }
    
    if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
      return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
    }
    
    if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
    }
    
    // Clean up Program_Id - remove spaces around commas
    const cleanProgramId = Program_Id.replace(/\s*,\s*/g, ',').trim();
    
    // Join employee IDs into comma-separated string
    const employeeCsv = EmployeeIds.join(',');
    
    console.log("Cleaned Program_Id:", cleanProgramId);
    console.log("Employee CSV:", employeeCsv);
    
    try {
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Insert_Emp_Att_Program_Wise]
        @Program_Id = ${cleanProgramId},
        @EmployeeIds = ${employeeCsv},
        @CreatedBy = ${CreatedBy}
      `;
      
      console.log("SP Result:", result);
      res.status(200).json({ message: result[0]?.Result || 'Success, but no message returned.' });
      
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({ message: 'Database error.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}