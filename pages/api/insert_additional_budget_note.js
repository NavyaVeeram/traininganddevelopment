import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Year_No, Program_Id, Note_text, createdBy } = req.body;

  console.log('Received insert_budget_note request body:', req.body);

  if (!Year_No || !Program_Id || !Note_text || !createdBy) {
    console.log('Missing required fields:', { Year_No, Program_Id, Note_text, createdBy });
    return res.status(400).json({ message: 'Year_No, Program_Id, Note_text and createdBy are required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[Insert_Budget_Note] @Year_No = ${Year_No}, @Program_Id = ${Program_Id}, @Note_text = '${Note_text}', @CreatedBy = '${createdBy}'
    `);

    res.status(200).json({ message: result[0]?.Result || 'Budget note saved successfully' });
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}