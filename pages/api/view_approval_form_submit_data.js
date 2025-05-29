// pages/api/approval-data.js
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { employeeId } = req.body;

  if (!employeeId) return res.status(400).json({ message: 'EmployeeId is required' });

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC Approval_Form_Submit_Data @EmployeeId = '${employeeId}'
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
