import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { Qual_Id } = req.body;

    if (!Qual_Id) {
      return res.status(400).json({ error: 'Qual_Id is required' });
    }

    // Call the stored procedure directly
    await prisma.$queryRaw`
      EXEC [dbo].[Update_Qualified_Trainer] @Qual_Id = ${parseInt(Qual_Id)}
    `;

    return res.status(200).json({ 
      success: true,
      message: 'Record ready to edit' 
    });

  } catch (error) {
    console.error('Reset trainer error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to reset record',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}