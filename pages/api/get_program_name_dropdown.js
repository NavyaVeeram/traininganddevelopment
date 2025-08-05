import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { Year_No, Training_Name ,Month } = req.query;

  if (!Year_No || !Training_Name ||!Month) {
    return res.status(400).json({ error: 'Year_No and Training_Name are required' });
  }

  try {
    // Call stored procedure Dropdown_Review_By_Year_And_Training
    const result = await prisma.$queryRaw`
      EXEC [dbo].[Dropdown_Review_By_Year_And_Training] @Year_No = ${parseInt(Year_No)}, @Training_Name = ${Training_Name},@Month = ${Month}
    `;

    // Map result to array of objects with id and name
    const programList = result.map(row => ({
      id: row.Program_Id,
      name: row.Program_Name,
    }));

    res.status(200).json(programList);
  } catch (error) {
    console.error('Error fetching program names:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
