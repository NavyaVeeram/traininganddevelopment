import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const filesDir = path.join(process.cwd(), 'public/Files');
  const files = fs.readdirSync(filesDir);

  const matchedFile = files.find(file => file.startsWith(`${id}.`));

  if (matchedFile) {
    return res.status(200).json({ file: `/Files/${matchedFile}` });
  } else {
    return res.status(404).json({ error: 'File not found' });
  }
}