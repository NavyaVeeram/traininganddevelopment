import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { employeeId } = req.query;
      if (!employeeId) {
        return res.status(400).json({ error: "Missing employeeId query parameter" });
      }
      const result = await prisma.$queryRaw`
        EXEC dbo.Update_TL_Dropdown @EmployeeId = ${employeeId}
      `;
      res.status(200).json(result);
    } catch (error) {
      console.error("Error executing Update_TL_Dropdown stored procedure", error);
      res.status(500).json({ error: "Failed to fetch TL dropdown data" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
