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
        EXEC [dbo].[Get_Employee_History_Table] @EmployeeId = ${EmployeeId}, @Year_No = ${Year_No}
      `;

      if (!Array.isArray(employeeDetails) || employeeDetails.length === 0) {
        return res.status(404).json({ message: "No data found for the given employee and year" });
      }

      return res.status(200).json(employeeDetails);
    } catch (error) {
      console.error("Error fetching employee history table:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
