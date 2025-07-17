import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { year, Department } = req.query;

  if (!year || !Department) {
    res.status(400).json({ error: 'Year and Department parameters are required' });
    return;
  }

  try {
    const result = await prisma.$queryRawUnsafe(
      `EXEC Get_Data_By_Department_Head_Count @Year_No = ${parseInt(year, 10)}, @Department = '${Department}'`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
