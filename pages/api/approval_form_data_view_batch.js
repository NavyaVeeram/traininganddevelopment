import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { programIds } = req.body;

  if (!Array.isArray(programIds) || programIds.length === 0) {
    return res.status(400).json({ message: 'programIds must be a non-empty array' });
  }

  try {
    // Prepare a results object to hold counts for each programId
    const counts = {};

    // Use Promise.all to execute all stored procedure calls concurrently
    await Promise.all(
      programIds.map(async (programId) => {
        // Ensure programId is an integer
        const id = parseInt(programId, 10);
        if (isNaN(id)) {
          counts[programId] = 0;
          return;
        }

        try {
          const result = await prisma.$queryRawUnsafe(`
            EXEC dbo.Approval_Form_Report_View @ProgramId = ${id}
          `);
          counts[programId] = Array.isArray(result) ? result.length : 0;
        } catch (error) {
          console.error(`Error fetching count for programId ${programId}:`, error);
          counts[programId] = 0;
        }
      })
    );

    res.status(200).json(counts);
  } catch (error) {
    console.error('Error in batch approval form data view:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
