import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { EmployeeId, Access, CreatedBy } = req.body;

  if (!EmployeeId || !Access || !CreatedBy) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      DECLARE @Result VARCHAR(MAX);
      EXEC [dbo].[Employee_Access_SP]
        @EmployeeId = '${EmployeeId}',
        @Access = '${Access}',
        @CreatedBy = '${CreatedBy}';
    `);

    
console.log(result); // Optional
res.status(200).json({ message: result[0]?.Result || "Success" });
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
