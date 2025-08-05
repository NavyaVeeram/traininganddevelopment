import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  try {
    const { Year_No, Month, Training_Name, Program_Id } = req.query;

    // Validate and parse parameters
    const yearNo = Year_No ? parseInt(Year_No, 10) : null;
    const month = Month || null;
    const trainingName = Training_Name || null;
    const programId = Program_Id ? parseInt(Program_Id, 10) : null;
    if (!yearNo || !month || !trainingName || !programId) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // Execute stored procedure dbo.Get_Rating_Counts with parameters
    const result = await prisma.$queryRaw`
      EXEC dbo.Get_Rating_Counts 
        @Year_No = ${yearNo}, 
        @Month = ${month},
        @Training_Name = ${trainingName}, 
        @Program_Id = ${programId}
    `;

    // Result is expected to be an array of objects with Rating, RatingCount, and Program_Name properties
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching rating counts:', error);
    res.status(500).json({ error: 'Failed to fetch rating counts' });
  }
}
