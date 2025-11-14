// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     console.log("API received:", req.body);
//     console.log("Program_Id:", req.body.Program_Id, typeof req.body.Program_Id);
    
//     const { Program_Id, EmployeeIds, CreatedBy } = req.body;
    
//     // Keep Program_Id as string for comma-separated values
//     if (!Program_Id || typeof Program_Id !== 'string' || Program_Id.trim() === '') {
//       return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
//     }
    
//     if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
//       return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
//     }
    
//     if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
//       return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
//     }
    
//     // Clean up Program_Id - remove spaces around commas
//     const cleanProgramId = Program_Id.replace(/\s*,\s*/g, ',').trim();
    
//     // Join employee IDs into comma-separated string
//     const employeeCsv = EmployeeIds.join(',');
    
//     console.log("Cleaned Program_Id:", cleanProgramId);
//     console.log("Employee CSV:", employeeCsv);
    
//     try {
//       const result = await prisma.$queryRaw`
//         EXEC [dbo].[Insert_Emp_Att_Program_Wise]
//         @Program_Id = ${cleanProgramId},
//         @EmployeeIds = ${employeeCsv},
//         @CreatedBy = ${CreatedBy}
//       `;
      
//       console.log("SP Result:", result);
//       res.status(200).json({ message: result[0]?.Result || 'Success, but no message returned.' });
      
//     } catch (error) {
//       console.error('Error executing stored procedure:', error);
//       res.status(500).json({ message: 'Database error.', error: error.message });
//     }
//   } else {
//     res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { Program_Id, EmployeeIds, CreatedBy } = req.body;

//     if (!Program_Id || typeof Program_Id !== 'string' || Program_Id.trim() === '') {
//       return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
//     }
//     if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
//       return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
//     }
//     if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
//       return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
//     }

//     // Convert Program_Id string to array of integers
//     const programIds = Program_Id.split(',')
//       .map(id => parseInt(id.trim(), 10))
//       .filter(id => !isNaN(id));

//     // Convert EmployeeIds array to integers
//     const employeeIntIds = EmployeeIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

//     try {
//       let results = [];
//       // Call stored procedure for each Program_Id integer
//       for (const programId of programIds) {
//         // If your stored procedure expects a CSV string for EmployeeIds,
//         // join them back as string, otherwise adapt as per your SP definition.
//         const employeeCsv = employeeIntIds.join(',');

//         const result = await prisma.$queryRaw`
//           EXEC [dbo].[Insert_Emp_Att_Program_Wise]
//           @Program_Id = ${programId},
//           @EmployeeIds = ${employeeCsv},
//           @CreatedBy = ${CreatedBy}
//         `;
//         results.push(result);
//       }

//       res.status(200).json({ message: 'Stored procedure executed successfully.', results });
//     } catch (error) {
//       console.error('Error executing stored procedure:', error);
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
    const { Program_Id, EmployeeIds, CreatedBy } = req.body;

    // Validate inputs
    if (!Program_Id || typeof Program_Id !== 'string' || Program_Id.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing Program_Id.' });
    }
    if (!Array.isArray(EmployeeIds) || EmployeeIds.length === 0) {
      return res.status(400).json({ message: 'EmployeeIds must be a non-empty array.' });
    }
    if (typeof CreatedBy !== 'string' || CreatedBy.trim() === '') {
      return res.status(400).json({ message: 'Invalid or missing CreatedBy.' });
    }

    try {
      // Convert Program_Id string to array of integers (supports CSV like '1412,1413')
      const programIds = Program_Id.split(',')
        .map(id => id.trim())
        .filter(id => id !== '');

      // Convert EmployeeIds array to CSV string for SP
      const employeeCsv = EmployeeIds.join(',');

      let results = [];

      // Call stored procedure for each Program_Id
      for (const programId of programIds) {
        const result = await prisma.$queryRaw`
          EXEC [dbo].[Insert_Emp_Att_Program_Wise]
          @Program_Ids = ${programId},   -- Keep parameter name in SP same as before
          @EmployeeIds = ${employeeCsv},
          @CreatedBy = ${CreatedBy}
        `;
        results.push(result);
      }

      res.status(200).json({ message: 'Stored procedure executed successfully.', results });
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({ message: 'Database error.', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
