import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'Missing employeeId parameter' });
  }

  try {
    // Call the stored procedure using prisma.$queryRaw with parameter substitution
    const result = await prisma.$queryRaw`EXEC Generate_Rejection_Email_For_Trainers @Employee_Id=${employeeId}`;

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
