import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {

  try {
    const result = await prisma.$queryRawUnsafe(
      `EXEC Get_Data_By_Department_Dropdown_Head_Count`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}