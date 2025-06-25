import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { Program_Id, Employee_Id, IsUpload, CreatedBy } = req.body;

  // ✅ Validate required fields
  if (
    Program_Id == null ||
    Employee_Id == null ||
    IsUpload == null ||
    typeof CreatedBy !== "string" ||
    CreatedBy.trim() === ""
  ) {
    return res.status(400).json({ message: "Missing or invalid required fields" });
  }

  const uploadFlag = typeof IsUpload === "boolean" ? (IsUpload ? 1 : 0) : Number(IsUpload);

  try {
    console.log("Calling stored procedure with:", {
      Program_Id,
      Employee_Id,
      IsUpload: uploadFlag,
      CreatedBy,
    });

    // ✅ Execute the updated stored procedure with Employee_Id
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[Insert_Emp_Certificate_Status]
        @Program_Id = ${Program_Id},
        @Employee_Id = ${Employee_Id},
        @IsUpload = ${uploadFlag},
        @CreatedBy = '${CreatedBy}'
    `);

    const message = Array.isArray(result) ? result[0]?.Result : null;

    return res.status(200).json({ message: message || "Operation completed successfully" });
  } catch (error) {
    console.error("Stored procedure execution error:", error);
    return res.status(500).json({
      message: "Internal server error while inserting certificate status",
    });
  } finally {
    await prisma.$disconnect();
  }
}
