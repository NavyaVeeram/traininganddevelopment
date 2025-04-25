import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { employeeId, department } = req.query;

  try {
    const trainingData = await prisma.$queryRaw`
      EXEC View_TrainingData_By_Employee ${employeeId}, ${department}
    `;

    res.status(200).json(trainingData);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
