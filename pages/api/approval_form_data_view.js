import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let { programId } = req.query;

  if (!programId) {
    return res.status(400).json({ message: 'programId is required' });
  }

  // Ensure programId is an integer
  programId = parseInt(programId, 10);
  if (isNaN(programId)) {
    return res.status(400).json({ message: 'programId must be a valid integer' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC dbo.Approval_Form_Report_View @ProgramId = ${programId}
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}