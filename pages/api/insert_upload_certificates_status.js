import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { Program_Id, IsUpload, CreatedBy } = req.body;

    try {
      // Convert Program_Id to comma-separated string if it's an array
      const programIdsString = Array.isArray(Program_Id)
        ? Program_Id.join(",")
        : String(Program_Id);

      const result = await prisma.$queryRawUnsafe(`
        EXEC dbo.Insert_Upload_Certificates_Status
        @Program_Ids = '${programIdsString}',
        @IsUpload = ${IsUpload},
        @CreatedBy = '${CreatedBy}'
      `);

      console.log("Calling stored procedure with parameters:", {
        Program_Ids: programIdsString,
        IsUpload,
        CreatedBy,
      });

      res.status(200).json({ message: result[0]?.Result || "Unknown error" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Error occurred while adding the program." });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
