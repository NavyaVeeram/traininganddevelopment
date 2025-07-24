import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { ProgramId, Employee_Id } = req.query;

      if (!ProgramId || !Employee_Id) {
        return res.status(400).json({ status: "error", message: "Missing ProgramId or Employee_Id" });
      }
      let materials = [];
      try {
        materials = await prisma.$queryRaw`EXEC [dbo].[Get_Emp_Certificate_Status] @ProgramId = ${parseInt(ProgramId)}, @Employee_Id = ${parseInt(Employee_Id)}`;
      } catch (dbError) {
        console.error("Database query error:", dbError);
        return res.status(500).json({ status: "error", message: "Database query failed" });
      }


      const filesDir = path.join(process.cwd(), "public/empcertificates");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

      const materialsWithFiles = materials.map((item) => {
        const matchedFile = fileList.find((f) =>
          f.startsWith(`${item.Program_Id}.`)
        );
        return {
          ...item,
          fileUrl: matchedFile ? `/empcertificates/${matchedFile}` : null
        };
      });

      return res.status(200).json({ status: "success", data: materialsWithFiles });
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }
}
