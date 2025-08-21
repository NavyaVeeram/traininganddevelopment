// import fs from 'fs';
// import multer from 'multer';
// import path from 'path';

// const uploadDir = path.join(process.cwd(), 'public/docs');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, 'tempfile' + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default function handler(req, res) {
//   upload.any()(req, res, function (err) {
//     if (err) {
//       return res.status(500).json({ message: 'Upload error', error: err.message });
//     }

//     const file = req.files[0];
//     const programId = req.body.program_id;
//     const newFileName = `${programId}${path.extname(file.originalname)}`;
//     const oldPath = file.path;
//     const newPath = path.join(uploadDir, newFileName);

//     fs.renameSync(oldPath, newPath);

//     const filePath = `/docs/${newFileName}`;

//     return res.status(200).json({
//       message: 'File uploaded successfully',
//       fileUrl: filePath,
//     });
//   });
// }
import fs from 'fs';
import multer from 'multer';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public/docs1');
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

export default function handler(req, res) {
  upload.any()(req, res, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Upload error', error: err.message });
    }

    const file = req.files[0];
    const programId = req.body.program_id;
    const newFileName = `${programId}${path.extname(file.originalname)}`;
    const oldPath = file.path;
    const newPath = path.join(uploadDir, newFileName);

    fs.renameSync(oldPath, newPath);

    // Use the API route instead of direct static file path
    const fileUrl = `/api/files1/${newFileName}`;

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
    });
  });
}