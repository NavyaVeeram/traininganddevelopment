import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { Program_Id } = req.query;

  if (!Program_Id) {
    return res.status(400).json({ error: 'Program_Id is required' });
  }

  try {
    const programIdInt = parseInt(Program_Id, 10);
    if (isNaN(programIdInt)) {
      return res.status(400).json({ error: 'Program_Id must be a valid number' });
    }

    const result = await prisma.$queryRaw`
      EXEC dbo.Get_Program_Details @Program_Id = ${programIdInt}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Program details not found' });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('Error fetching program details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
