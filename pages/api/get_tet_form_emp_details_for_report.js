import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { programId } = req.query; // Get the programId from the query string

    if (!programId) {
      return res.status(400).json({ error: 'ProgramId is required' });
    }

    try {
      // Execute the stored procedure using Prisma's $queryRaw
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Get_TET_Form_Emp_Details_For_Report] 
        ${programId};
      `;

      // Convert rating fields to numbers before returning
      const transformedResult = result.map(item => {
        const transformedItem = { ...item };
        for (let i = 1; i <= 10; i++) {
          const key = "Q_" + i;
          transformedItem[key] = item[key] !== null && item[key] !== undefined ? Number(item[key]) : null;
        }
        transformedItem.Overall = item.Overall !== null && item.Overall !== undefined ? Number(item.Overall) : null;
        transformedItem.Percentage = item.Percentage !== null && item.Percentage !== undefined ? Number(item.Percentage) : null;
        return transformedItem;
      });
      res.status(200).json(transformedResult);
      console.log("Employee details for report fetched successfully.");
      console.log(result)
    } catch (error) {
      console.error("Error fetching employee details for report:", error);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
