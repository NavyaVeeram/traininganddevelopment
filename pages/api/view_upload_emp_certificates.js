import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { Employee_Id, ProgramId } = req.query;
      if (!Employee_Id || !ProgramId) {
        return res.status(400).json({ message: "Missing Employee_Id or ProgramId query parameter" });
      }
      const materials = await prisma.$queryRaw`
        EXEC [dbo].[View_Upload_Emp_Certificates] @ProgramId=${parseInt(ProgramId)}, @EmployeeId=${parseInt(Employee_Id)}
      `;

      const filesDir = path.join(process.cwd(), "public/EmpCertificates");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

      const materialsWithFiles = materials.map((item) => {
        const matchedFile = fileList.find((f) =>
          f.startsWith(`${item.Program_Id}&${item.EmployeeId}.`)
        );
        return {
          ...item,
          fileUrl: matchedFile ? `/EmpCertificates/${matchedFile}` : null,
          IsUpload: item.IsUpload
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