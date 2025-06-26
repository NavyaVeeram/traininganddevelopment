import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Training_Name } = req.query;

  if (!Training_Name) {
    return res.status(400).json({ message: 'Training_Name is required' });
  }

  try {
    const result = await prisma.$queryRaw`
      EXEC [dbo].[Standard_Program_Dropdown] ${Training_Name}
    `;

    // Optional: Rename keys to match frontend expectations, if needed
    const formattedResult = result.map(item => ({
      text: item.Text,
      value: item.Value
    }));

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Error fetching data from stored procedure' });
  }
}
