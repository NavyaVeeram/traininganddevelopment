import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    // Execute stored procedure dbo.Get_Rating_Distribution
    const result = await prisma.$queryRaw`EXEC dbo.Get_Rating_Distribution`;

    // Return the result as JSON
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching rating distribution:', error);
    res.status(500).json({ error: 'Failed to fetch rating distribution' });
  }
}
