import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Call the updated procedure
      const materials = await prisma.$queryRawUnsafe(`
        EXEC [dbo].[View_Upload_Materials]
      `);

      // Get the directory path for files
      const filesDir = path.join(process.cwd(), "public/Files");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

      // Keep output shape the same for frontend
  
const materialsWithFiles = materials.map((item) => {
  const matchedFile = fileList.find((f) => {
    const fileNameWithoutExt = f.substring(0, f.lastIndexOf(".")); // "984,985,986"
    const fileIds = fileNameWithoutExt.split(","); // ["984", "985", "986"]

    const programIds = item.Program_Ids.split(","); // e.g. ["984","985","986"]

    // Check if ANY ProgramId matches the file’s IDs
    return programIds.some((id) => fileIds.includes(id));
  });

  return {
    ...item,
    fileUrl: matchedFile ? `/Files/${matchedFile}` : null,
  };
});

      return res.status(200).json(materialsWithFiles);
    } catch (error) {
      console.error("Error fetching materials", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
