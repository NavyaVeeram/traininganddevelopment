import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public/EmpCertificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'tempfile' + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

function getFormData(req) {
  return new Promise((resolve, reject) => {
    const multerUpload = upload.any();
    multerUpload(req, {}, (err) => {
      if (err) return reject(err);
      resolve(req);
    });
  });
}

export default async function handler(req, res) {
  try {
    await getFormData(req);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const file = req.files[0];
    const programId = req.body.program_id;

    if (!programId) {
      return res.status(400).json({ message: 'program_id is required' });
    }

    const newFileName = `${programId}${path.extname(file.originalname)}`;
    const oldPath = file.path;
    const newPath = path.join(uploadDir, newFileName);

    fs.renameSync(oldPath, newPath);

    const filePath = `/EmpCertificates/${newFileName}`;

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: filePath,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Upload error', error: err.message });
  }
}
