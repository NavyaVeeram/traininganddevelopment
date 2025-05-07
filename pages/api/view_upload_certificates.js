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

      const filesDir = path.join(process.cwd(), "public/Certificates");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

      const materialsWithFiles = materials.map((item) => {
        const matchedFile = fileList.find((f) =>
          f.startsWith(`${item.Program_Id}.`)
        );
console.log(matchedFile);
        return {
          ...item,
          fileUrl: matchedFile ? `/Certificates/${matchedFile}` : null,
        };
      });

      return res.status(200).json(materialsWithFiles);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}