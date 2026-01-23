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
  let responseSent = false;

  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      return res.status(statusCode).json(data);
    }
  };

  if (req.method !== "POST") {
    return sendResponse(405, { message: "Method Not Allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public/certificates");
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
        return sendResponse(500, { message: "Form parsing error", error: err.message });
      }

      try {
        const Employee_Id = Number(
          Array.isArray(fields.Employee_Id) ? fields.Employee_Id[0] : fields.Employee_Id
        );
        const CreatedBy = Array.isArray(fields.CreatedBy)
          ? fields.CreatedBy[0]
          : fields.CreatedBy;

        // ✅ Extract retained files from frontend
        const retainedFiles = fields.retainedFiles
          ? JSON.parse(
              Array.isArray(fields.retainedFiles)
                ? fields.retainedFiles[0]
                : fields.retainedFiles
            )
          : [];

        if (!Employee_Id || !CreatedBy) {
          return sendResponse(400, { message: "Employee_Id and CreatedBy are required" });
        }

        // Process new uploads
        const uploadedFiles = Array.isArray(files.file)
          ? files.file
          : files.file ? [files.file] : [];

        const savedFilenames = [];

        // Save new uploaded files
        for (const file of uploadedFiles) {
          if (!file || !file.filepath) continue;

          const originalName = file.originalFilename;
          const extension = path.extname(originalName);

          if (!extension) continue;

          let finalName = originalName;
          let counter = 1;

          while (fs.existsSync(path.join(uploadDir, finalName))) {
            finalName = `${path.basename(originalName, extension)}_${counter}${extension}`;
            counter++;
          }

          const finalPath = path.join(uploadDir, finalName);
          await fs.promises.rename(file.filepath, finalPath);

          savedFilenames.push(finalName);
        }

        // ✅ COMBINE: existing (retained) + new uploads
        const allFiles = [...retainedFiles, ...savedFilenames];
        
        // Handle case where no files exist at all
        if (allFiles.length === 0) {
          return sendResponse(400, { message: "No files to save" });
        }

        const finalFilenameString = allFiles.join(",");

        // ✅ Send combined list to database
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Upload_Emp_Certificate
            @Employee_Id = ${Employee_Id},
            @IsUpload = ${1},
            @CreatedBy = ${CreatedBy},
            @FinalFilenames = ${finalFilenameString}
        `;

        const message = result?.[0]?.Result || "Certificates updated successfully.";

        return sendResponse(200, {
          message,
          files: allFiles.map((f) => ({
            fileName: f,
            fileUrl: `/certificates/${f}`,
          })),
          retainedCount: retainedFiles.length,
          newCount: savedFilenames.length,
          totalCount: allFiles.length,
        });
      } catch (dbError) {
        console.error("Database or file operation error:", dbError);
        return sendResponse(500, {
          message: "Upload or database error",
          error: dbError.message,
        });
      }
    });
  } catch (error) {
    console.error("Fatal API error:", error);
    return sendResponse(500, { message: "Server error", error: error.message });
  }
}