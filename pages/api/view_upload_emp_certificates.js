// import { PrismaClient } from "@prisma/client";
// import fs from "fs";
// import path from "path";

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === "GET") {
//     try {
//       const { Employee_Id, ProgramId } = req.query;
//       if (!Employee_Id || !ProgramId) {
//         return res.status(400).json({ message: "Missing Employee_Id or ProgramId query parameter" });
//       }
//       const materials = await prisma.$queryRaw`
//         EXEC [dbo].[View_Upload_Emp_Certificates] @ProgramId=${parseInt(ProgramId)}, @EmployeeId=${parseInt(Employee_Id)}
//       `;

//       const filesDir = path.join(process.cwd(), "public/docs2");
//       const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

//       const materialsWithFiles = materials.map((item) => {
//         const matchedFile = fileList.find((f) =>
//           f.startsWith(`${item.Program_Id}&${item.EmployeeId}.`)
//         );
//         return {
//           ...item,
//           fileUrl: matchedFile ? `/api/filesemp/${matchedFile}` : null,
//           IsUpload: item.IsUpload
//         };
//       });

//       return res.status(200).json(materialsWithFiles);
//     } catch (error) {
//       console.error("Error fetching employee details", error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     return res.status(405).json({ message: "Method not allowed" });
//   }
// }
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { Employee_Id, ProgramId } = req.query;
      if (!Employee_Id || !ProgramId) {
        return res.status(400).json({ 
          message: "Missing Employee_Id or ProgramId query parameter" 
        });
      }

      const materials = await prisma.$queryRaw`
        EXEC [dbo].[View_Upload_Emp_Certificates] 
        @ProgramId=${parseInt(ProgramId)}, 
        @EmployeeId=${parseInt(Employee_Id)}
      `;

      const filesDir = path.join(process.cwd(), "public/docs2");
      const fileList = fs.existsSync(filesDir) ? fs.readdirSync(filesDir) : [];

      console.log("Available files:", fileList);
      console.log("Materials from DB:", materials);

      const materialsWithFiles = materials.map((item) => {
        // Look for files with multiple possible patterns:
        // 1. ProgramId_EmployeeId_YEAR.extension (your frontend pattern)
        // 2. ProgramId&EmployeeId.extension (your backend pattern)
        const matchedFile = fileList.find((f) => {
          const baseName = f.substring(0, f.lastIndexOf('.')) || f;
          
          // Pattern 1: ProgramId_EmployeeId_YEAR
          const pattern1 = `${item.Program_Id}_${item.EmployeeId}_`;
          if (baseName.startsWith(pattern1)) {
            return true;
          }
          
          // Pattern 2: ProgramId&EmployeeId
          const pattern2 = `${item.Program_Id}&${item.EmployeeId}`;
          if (baseName === pattern2) {
            return true;
          }
          
          return false;
        });

        console.log(`Looking for Program_Id: ${item.Program_Id}, EmployeeId: ${item.EmployeeId}, Found: ${matchedFile}`);

        return {
          ...item,
          fileUrl: matchedFile ? `/api/filesemp/${matchedFile}` : null,
          IsUpload: item.IsUpload,
          fileName: matchedFile || null
        };
      });

      console.log("Materials with files:", materialsWithFiles);

      return res.status(200).json(materialsWithFiles);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}