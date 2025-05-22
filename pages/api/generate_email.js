import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  try {
    const result = await prisma.$queryRawUnsafe(
      "EXEC [HRModule].[dbo].[Generate_Email_All] @EmployeeId = '" + employeeId + "'"
    );

    console.log('Stored procedure result:', result);

    if (!Array.isArray(result) || result.length === 0 || !result[0].Email) {
      return res.status(404).json({ message: 'No email found for given Employee ID' });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
