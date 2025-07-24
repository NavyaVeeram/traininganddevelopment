import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ message: 'EmployeeId is required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC Approval_Form_Data @EmployeeId = '${employeeId}'
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
