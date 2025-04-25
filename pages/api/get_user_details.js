import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { EmployeeId } = req.query;

    if (!EmployeeId) {
      return res.status(400).json({ message: "EmployeeId is required" });
    }

    try {
      const employeeDetails = await prisma.$queryRaw`
        EXEC dbo.Get_User_Details @EmployeeId = ${EmployeeId}
      `;
      
      if (employeeDetails.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
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
