import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { Training_Name } = req.query;

    if (!Training_Name) {
      return res.status(400).json({ message: 'Training_Name is required' });
    }

    try {
      // Query Prisma to fetch programs based on the provided Training_Name
      const programs = await prisma.standard_Program_Master.findMany({
        where: {
          Training_Name: Training_Name,
        },
        orderBy: {
          Program_Name: 'asc',
        },
        select: {
          Program_Name: true,
        },
      });

      res.status(200).json(programs);
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ message: 'An error occurred while fetching programs' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
