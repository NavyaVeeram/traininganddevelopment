import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    // Call the stored procedure [dbo].[User_Dropdown]
    const users = await prisma.$queryRaw`
      EXEC [dbo].[User_Dropdown]
    `;

    // Check if the result is an array and map it
    const dropdownData = users.map(user => ({
      value: user.Value.toString(),
      text: user.Text,
    }));

    res.status(200).json(dropdownData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
}
