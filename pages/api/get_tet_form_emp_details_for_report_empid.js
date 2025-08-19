import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { programId, employeeId } = req.query; // Get parameters from the query string

    if (!programId || !employeeId) {
      return res
        .status(400)
        .json({ error: "ProgramId and EmployeeId are required" });
    }

    try {
      // Pass programId as VARCHAR (comma-separated if needed)
      const result = await prisma.$queryRawUnsafe(
        `EXEC [dbo].[Get_TET_Form_Emp_Details_For_Report_Empid] @Program_Ids = '${programId}', @EmployeeId = '${employeeId}'`
      );

      // Convert rating fields to numbers before returning
      const transformedResult = result.map((item) => {
        const transformedItem = { ...item };
        for (let i = 1; i <= 10; i++) {
          const key = `Q_${i}`;
          transformedItem[key] =
            item[key] !== null && item[key] !== undefined
              ? Number(item[key])
              : null;
        }
        transformedItem.Overall =
          item.Overall !== null && item.Overall !== undefined
            ? Number(item.Overall)
            : null;
        transformedItem.Percentage =
          item.Percentage !== null && item.Percentage !== undefined
            ? Number(item.Percentage)
            : null;
        return transformedItem;
      });

      res.status(200).json(transformedResult);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching data." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
