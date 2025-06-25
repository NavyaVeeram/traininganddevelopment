import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public/empcertificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  upload.any()(req, res, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Upload error', error: err.message });
    }

    const file = req.files?.[0];
    const { program_id, EmployeeId, Year } = req.body;

    if (!file || !program_id || !EmployeeId || !Year) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    const newFileName = `${program_id}_${EmployeeId}_${Year}${path.extname(file.originalname)}`;
    const oldPath = file.path;
    const newPath = path.join(uploadDir, newFileName);

    // Check if file already exists
    if (fs.existsSync(newPath)) {
      return res.status(409).json({ message: 'File already exists' });
    }

    try {
      fs.renameSync(oldPath, newPath);
    } catch (renameErr) {
      return res.status(500).json({ message: 'Failed to rename file', error: renameErr.message });
    }

    const filePath = `/empcertificates/${newFileName}`;

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: filePath,
    });
  });
}
