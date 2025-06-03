import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const {  year } = req.query;

    if ( !year) {
      return res.status(400).json({ message: " Year is required" });
    }

    try {
      const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[Get_TET_Form_Data] @Year_No=${parseInt(year)}
      `;

      if (!employeeDetails || employeeDetails.length === 0) {
        return res.status(404).json({ message: "Details not found" });
      }

      return res.status(200).json(employeeDetails);

    } catch (error) {
      console.error("Error fetching details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}