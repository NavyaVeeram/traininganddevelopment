import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ message: 'Missing employeeId parameter' });
  }

  try {
    // Call the stored procedure using prisma.$queryRaw
    const result = await prisma.$queryRaw`
      EXEC Approval_Form_Data_For_Trainers @EmployeeId=${employeeId}
    `;

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
