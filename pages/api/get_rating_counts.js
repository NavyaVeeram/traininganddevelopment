import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    // Execute stored procedure dbo.Get_Rating_Counts
    const result = await prisma.$queryRaw`EXEC dbo.Get_Rating_Counts`;

    // Result is expected to be an array of objects with Rating and RatingCount properties
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching rating counts:', error);
    res.status(500).json({ error: 'Failed to fetch rating counts' });
  }
}
