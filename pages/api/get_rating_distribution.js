import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { Year_No, Training_Name, Program_Id } = req.query;

  if (!Year_No || !Training_Name || !Program_Id) {
    return res.status(400).json({ error: 'Year_No, Training_Name and Program_Id are required' });
  }

  try {
    const programIdInt = parseInt(Program_Id);

    // Execute stored procedure dbo.Get_Rating_Distribution with parameters
    const result = await prisma.$queryRaw`
      EXEC dbo.Get_Rating_Distribution
      @Year_No = ${parseInt(Year_No)},
      @Training_Name = ${Training_Name},
      @Program_Id = ${programIdInt}
    `;

    // Return the result as JSON
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching rating distribution:', error);
    res.status(500).json({ error: 'Failed to fetch rating distribution' });
  }
}
