import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === "GET") {
    try {
      const { employeeId } = req.query;

      if (!employeeId) {
        return res.status(400).json({ message: "Missing employeeId query parameter" });
      }

      const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[View_Qualifier_List] @EmployeeId=${employeeId}
      `;

      if (employeeDetails.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json(employeeDetails);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else if (req.method === "POST") {
    const { Qual_Id, Status } = req.body;

    if (typeof Qual_Id !== "number" || typeof Status !== "boolean") {
      return res.status(400).json({ message: "Invalid input parameters" });
    }

    try {
      await prisma.$queryRaw`
        EXEC [dbo].[Update_Active_Status_To_Remove_Trainers] @Qual_Id=${Qual_Id}, @Status=${Status ? 1 : 0}
      `;

      return res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating status", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
