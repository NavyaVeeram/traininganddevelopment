import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { year} = req.query;

  if (!year ) {
    res.status(400).json({ error: 'Year parameter is required' });
    return;
  }

  try {
    const result = await prisma.$queryRawUnsafe(
      `EXEC Get_Data_By_Dept_Wise_MnthsVSHrs @Year_No = ${parseInt(year, 10)}`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}