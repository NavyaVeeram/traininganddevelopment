import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Year_No, UpdatedBy } = req.body;

  console.log('Received finalise_additional_budget request body:', req.body);

  if (!Year_No || !UpdatedBy) {
    console.log('Missing required fields:', { Year_No, UpdatedBy });
    return res.status(400).json({ message: 'Year_No and UpdatedBy are required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [HRModule].[dbo].[Finalise_Additional_Budget] @Year_No = ${Year_No}, @UpdatedBy = '${UpdatedBy}'
    `);

    res.status(200).json({ message: result[0]?.Result || 'Finalised successfully' });
  } catch (error) {
    console.error('Error executing finalise stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
