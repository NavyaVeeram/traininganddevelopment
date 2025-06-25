import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { ProgramId, Employee_Id } = req.query;

  if (!ProgramId || !Employee_Id) {
    return res.status(400).json({ message: "Missing ProgramId or Employee_Id" });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[Get_Emp_Certificate_Status]
        @ProgramId = ${parseInt(ProgramId)},
        @Employee_Id = ${Employee_Id}
    `);

    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    console.error("❌ Error executing stored procedure:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
