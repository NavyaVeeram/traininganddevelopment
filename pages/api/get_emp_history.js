import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { EmployeeId, Year_No } = req.query;

    if (!EmployeeId || !Year_No) {
      return res.status(400).json({ message: "EmployeeId and Year_No are required" });
    }

    try {
      const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[Get_Employee_History] @EmployeeId = ${EmployeeId}, @Year_No = ${Year_No}
      `;

      if (employeeDetails.length === 0) {
        // Return 200 with empty array instead of 404 when no data found
        return res.status(200).json([]);
      }

      return res.status(200).json(employeeDetails[0]);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}