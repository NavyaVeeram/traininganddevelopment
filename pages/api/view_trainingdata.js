import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ message: 'Month and Year are required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(
      `EXEC [dbo].[View_TrainingData_Master] @Month_No = ${parseInt(month)}, @Year_No = ${parseInt(year)}`
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
