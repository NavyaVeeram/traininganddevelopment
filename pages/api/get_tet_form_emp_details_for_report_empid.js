import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { programId, employeeId } = req.query; // Get the parameters from the query string

    if (!programId || !employeeId) {
      return res.status(400).json({ error: 'ProgramId and EmployeeId are required' });
    }

    try {
      // Execute the stored procedure using Prisma's $queryRaw
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Get_TET_Form_Emp_Details_For_Report_Empid] 
        ${programId}, ${employeeId};
      `;

      // Return the result as JSON
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

