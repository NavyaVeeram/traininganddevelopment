import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Year_No, Add_Budget, createdBy } = req.body;

  console.log('Received insert_additional_budget request body:', req.body);

  if (!Year_No || !Add_Budget || !createdBy) {
    console.log('Missing required fields:', { Year_No, Add_Budget, createdBy });
    return res.status(400).json({ message: 'Year_No, Add_Budget and createdBy are required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[Insert_Additional_Budget] @Year_No = ${Year_No}, @Add_Budget = ${Add_Budget}, @CreatedBy = '${createdBy}'
    `);

    res.status(200).json({ message: result[0]?.Result || 'No response from stored procedure' });
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
