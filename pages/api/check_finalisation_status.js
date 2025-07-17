// ✅ API: /api/check_finalisation_status.js — rewritten using Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ message: 'Year parameter is required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[Get_Finalisation_Status] @Year_No = ${parseInt(year)}
    `);

    // Handle both boolean true and numeric 1 for IsFinalised field
    const isFinalized = result.length > 0 && (result[0].IsFinalised === 1 || result[0].IsFinalised === true);

    return res.status(200).json({
      isFinalized,
      year: parseInt(year),
      recordFound: result.length > 0,
      rawData: result.length > 0 ? result[0] : null
    });
  } catch (error) {
    console.error('Prisma error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
}