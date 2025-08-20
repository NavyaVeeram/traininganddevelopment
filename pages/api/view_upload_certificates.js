import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const materials = await prisma.$queryRaw`
        EXEC [dbo].[View_Upload_Certificates]
      `;

      const filesDir = path.join(process.cwd(), "public/docs");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];
const materialsWithFiles = materials.map((item) => {
  const matchedFile = fileList.find((f) => {
    const fileNameWithoutExt = f.substring(0, f.lastIndexOf(".")); // e.g. "843,844"
    const fileIds = fileNameWithoutExt.split(",").map((id) => id.trim());

    // Handle both Program_Id (single) and Program_Ids (comma-separated)
    const programIds = (item.Program_Id || item.Program_Ids || "")
      .toString()
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    return programIds.some((id) => fileIds.includes(id));
  });

  return {
    ...item,
    fileUrl: matchedFile ? `/docs/${matchedFile}` : null,
  };
});

console.log("materialsWithFiles:", materialsWithFiles);


      return res.status(200).json(materialsWithFiles);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}