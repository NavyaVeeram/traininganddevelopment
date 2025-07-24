import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable"; // ✅ fixed
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new IncomingForm(); // ✅ fixed
  const uploadDir = path.join(process.cwd(), "/public/Emp_Certificates");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  form.uploadDir = uploadDir;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ message: "Parsing error" });
    }

    try {
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const filename = Array.isArray(fields.filename)
        ? fields.filename[0]
        : fields.filename;
      const Program_Id = Array.isArray(fields.Program_Id)
        ? fields.Program_Id[0]
        : fields.Program_Id;
      const Employee_Id = Array.isArray(fields.Employee_Id)
        ? fields.Employee_Id[0]
        : fields.Employee_Id;
      const CreatedBy = Array.isArray(fields.CreatedBy)
        ? fields.CreatedBy[0]
        : fields.CreatedBy;

      if (!file || !filename || !Program_Id || !Employee_Id || !CreatedBy) {
        return res.status(400).json({ message: "Missing required data." });
      }

      const newPath = path.join(uploadDir, filename);
      await fs.promises.rename(file.filepath, newPath);

      const result = await prisma.$queryRaw`
        EXEC dbo.Insert_Upload_Emp_Certificate_Status
        @Program_Id = ${Program_Id},
        @Employee_Id = ${Employee_Id},
        @IsUpload = ${1},
        @CreatedBy = ${CreatedBy}
      `;

      const message = result?.[0]?.Result || "File uploaded and status saved.";
      res.status(200).json({ message });
    } catch (error) {
      console.error("Fatal API error:", error);
      res.status(500).json({
        message: "Upload or DB error",
        error: error.message,
        stack: error.stack,
      });
    }
  });
}