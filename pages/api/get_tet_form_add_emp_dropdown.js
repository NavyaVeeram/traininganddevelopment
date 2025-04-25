import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { id: programId } = req.query;

    if (!programId) {
      return res.status(400).json({ message: "ProgramId is required" });
    }

    try {
        const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[TET_Form_Add_Emp_Dropdown] @ProgramId = ${programId}
      `;
      if (employeeDetails.length === 0) {
        return res.status(404).json({ message: "No employee details found" });
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