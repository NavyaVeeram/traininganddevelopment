// import { PrismaClient } from "@prisma/client";
// import { IncomingForm } from "formidable"; // ✅ fixed
// import fs from "fs";
// import path from "path";

// export const config = {
//   api: { bodyParser: false },
// };

// const prisma = global.prisma || new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const form = new IncomingForm(); // ✅ fixed
//   const uploadDir = path.join(process.cwd(), "/public/docs2");
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   form.uploadDir = uploadDir;

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       console.error("Form parsing error:", err);
//       return res.status(500).json({ message: "Parsing error" });
//     }

//     try {
//       const file = Array.isArray(files.file) ? files.file[0] : files.file;
//       const filename = Array.isArray(fields.filename)
//         ? fields.filename[0]
//         : fields.filename;
//       const Program_Id = Array.isArray(fields.Program_Id)
//         ? fields.Program_Id[0]
//         : fields.Program_Id;
//       const Employee_Id = Array.isArray(fields.Employee_Id)
//         ? fields.Employee_Id[0]
//         : fields.Employee_Id;
//       const CreatedBy = Array.isArray(fields.CreatedBy)
//         ? fields.CreatedBy[0]
//         : fields.CreatedBy;

//       if (!file || !filename || !Program_Id || !Employee_Id || !CreatedBy) {
//         return res.status(400).json({ message: "Missing required data." });
//       }

//       const newPath = path.join(uploadDir, filename);
//       await fs.promises.rename(file.filepath, newPath);

//       const result = await prisma.$queryRaw`
//         EXEC dbo.Insert_Upload_Emp_Certificate_Status
//         @Program_Id = ${Program_Id},
//         @Employee_Id = ${Employee_Id},
//         @IsUpload = ${1},
//         @CreatedBy = ${CreatedBy}
//       `;

//       const message = result?.[0]?.Result || "File uploaded and status saved.";
//       res.status(200).json({ message });
//     } catch (error) {
//       console.error("Fatal API error:", error);
//       res.status(500).json({
//         message: "Upload or DB error",
//         error: error.message,
//         stack: error.stack,
//       });
//     }
//   });
// }
import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { 
    bodyParser: false,
    responseLimit: false, // Disable response size limit
  },
};

const prisma = global.prisma || new PrismaClient();

export default async function handler(req, res) {
  // Ensure we always send a response
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
    const uploadDir = path.join(process.cwd(), "public/docs2");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // Increased to 50MB
      maxTotalFileSize: 50 * 1024 * 1024, // Increased to 50MB
      maxFields: 1000,
      maxFieldsSize: 20 * 1024 * 1024, // 20MB for form data
      allowEmptyFiles: false,
      minFileSize: 1, // At least 1 byte
    });

    // Handle form parsing errors
    form.on('error', (err) => {
      console.error("Form error:", err);
      if (!responseSent) {
        if (err.code === 1009) {
          return sendResponse(413, { 
            message: "File too large. Maximum file size is 50MB.",
            error: "FILE_TOO_LARGE"
          });
        } else if (err.code === 1006) {
          return sendResponse(400, { 
            message: "No file uploaded or file is empty.",
            error: "NO_FILE"
          });
        } else {
          return sendResponse(500, { 
            message: "File upload error",
            error: err.message 
          });
        }
      }
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        if (!responseSent) {
          if (err.code === 1009) {
            return sendResponse(413, { 
              message: "File too large. Maximum file size is 50MB.",
              error: "FILE_TOO_LARGE"
            });
          } else {
            return sendResponse(500, { 
              message: "File parsing error",
              error: err.message 
            });
          }
        }
        return;
      }

      try {
        console.log("Received files:", files);
        console.log("Received fields:", fields);

        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const Program_Id = Array.isArray(fields.Program_Id)
          ? fields.Program_Id[0]
          : fields.Program_Id;
        const Employee_Id = Array.isArray(fields.Employee_Id)
          ? fields.Employee_Id[0]
          : fields.Employee_Id;
        const CreatedBy = Array.isArray(fields.CreatedBy)
          ? fields.CreatedBy[0]
          : fields.CreatedBy;

        // Validation
        if (!file) {
          return sendResponse(400, { message: "No file uploaded." });
        }

        if (!Program_Id || !Employee_Id || !CreatedBy) {
          return sendResponse(400, { 
            message: "Missing required fields: Program_Id, Employee_Id, or CreatedBy." 
          });
        }

        // Check if file exists and has content
        if (!fs.existsSync(file.filepath) || fs.statSync(file.filepath).size === 0) {
          return sendResponse(400, { message: "Uploaded file is empty or corrupted." });
        }

        // Use the filename provided by frontend if available, otherwise create one
        const providedFilename = Array.isArray(fields.filename) 
          ? fields.filename[0] 
          : fields.filename;
        
        let newFileName;
        if (providedFilename) {
          newFileName = providedFilename;
        } else {
          // Fallback to original method
          const originalName = file.originalFilename || file.name || 'file';
          const fileExtension = path.extname(originalName);
          
          if (!fileExtension) {
            return sendResponse(400, { 
              message: "File must have a valid extension." 
            });
          }
          newFileName = `${Program_Id}&${Employee_Id}${fileExtension}`;
        }
        const newPath = path.join(uploadDir, newFileName);

        // Remove existing file if it exists
        if (fs.existsSync(newPath)) {
          try {
            fs.unlinkSync(newPath);
          } catch (unlinkError) {
            console.warn("Could not remove existing file:", unlinkError);
          }
        }

        // Move the uploaded file to the correct location with correct name
        await fs.promises.rename(file.filepath, newPath);
        
        console.log(`File moved from ${file.filepath} to ${newPath}`);

        // Verify the file was moved successfully
        if (!fs.existsSync(newPath)) {
          return sendResponse(500, { 
            message: "File upload failed - could not save file." 
          });
        }

        // Update database
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Upload_Emp_Certificate_Status
          @Program_Id = ${parseInt(Program_Id)},
          @Employee_Id = ${parseInt(Employee_Id)},
          @IsUpload = ${1},
          @CreatedBy = ${CreatedBy}
        `;

        const message = result?.[0]?.Result || "File uploaded and status saved.";
        
        return sendResponse(200, { 
          message,
          fileName: newFileName,
          fileUrl: `/api/filesemp/${newFileName}`,
          fileSize: fs.statSync(newPath).size,
          uploadedAt: new Date().toISOString()
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
    return sendResponse(500, {
      message: "Server error",
      error: error.message,
    });
  }
}