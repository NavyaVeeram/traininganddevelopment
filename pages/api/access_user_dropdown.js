import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[Access_User_Dropdown]
      `;

      if (employeeDetails.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json(employeeDetails);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
