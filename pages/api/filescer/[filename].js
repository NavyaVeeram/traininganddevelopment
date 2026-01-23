import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public/certificates");

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024,
      allowEmptyFiles: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      try {
        /* =====================================
           BASIC DATA
        ===================================== */
        const Employee_Id = Number(
          Array.isArray(fields.Employee_Id)
            ? fields.Employee_Id[0]
            : fields.Employee_Id
        );

        const CreatedBy = Array.isArray(fields.CreatedBy)
          ? fields.CreatedBy[0]
          : fields.CreatedBy;
  // ✅ ADD THIS - Extract retained files from frontend
    const retainedFiles = fields.retainedFiles
      ? JSON.parse(
          Array.isArray(fields.retainedFiles)
            ? fields.retainedFiles[0]
            : fields.retainedFiles
        )
      : [];

        if (!Employee_Id || !CreatedBy) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const uploadedFiles = Array.isArray(files.file)
           ? files.file
      : files.file ? [files.file] : [];


        /* =====================================
           STEP 1: GET EXISTING DB FILES
        ===================================== */
        const existing = await prisma.$queryRaw`
          SELECT Filename
          FROM Upload_Emp_Certificate
          WHERE Employee_Id = ${Employee_Id}
        `;

        const existingFiles = existing.map((r) => r.Filename);

        /* =====================================
           STEP 2: DELETE REMOVED FILES (DB + DISK)
        ===================================== */
        const removedFiles = existingFiles.filter(
          (f) => !retainedFiles.includes(f)
        );

        for (const file of removedFiles) {
          const filePath = path.join(uploadDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
/* =====================================
   STEP 3: BUILD FINAL FILE LIST (SAFE)
===================================== */

const finalFiles = [...existingFiles];

const removedSet = new Set(removedFiles);
const safeFiles = finalFiles.filter(f => !removedSet.has(f));

for (const file of uploadedFiles) {
  const fileName = file.originalFilename;
  if (!safeFiles.includes(fileName)) {
    safeFiles.push(fileName);
  }
}

const finalFileString = safeFiles.join(",");


        /* =====================================
           STEP 4: UPDATE DATABASE (SINGLE CALL)
        ===================================== */
        await prisma.$executeRaw`
          EXEC dbo.Insert_Upload_Emp_Certificate
            @Employee_Id = ${Employee_Id},
            @IsUpload = ${1},
            @CreatedBy = ${CreatedBy},
            @FinalFilenames = ${finalFileString}
        `;

        return res.status(200).json({
          message: "Certificates updated successfully",
          files: safeFiles,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          message: "Certificate processing failed",
          error: error.message,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
