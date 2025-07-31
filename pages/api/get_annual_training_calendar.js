// pages/api/getAnnualTrainingCalendar.js
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { year, trainingName } = req.query;

  if (!year) return res.status(400).json({ error: 'Year is required' });
  if (!trainingName) return res.status(400).json({ error: 'Category is required' });

  try {
    const data = await prisma.$queryRawUnsafe(
      `EXEC [dbo].[Get_Annual_Training_Calendar] ${parseInt(year)}, '${trainingName}'`
    );

    res.status(200).json(data);
  } catch (error) {
    console.error('Stored procedure error:', error);
    res.status(500).json({ error: 'Failed to load training calendar.' });
  }
}
