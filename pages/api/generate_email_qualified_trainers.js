import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { employeeId } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: 'EmployeeId is required' });
  }

  try {
    // Call the stored procedure using prisma.$queryRaw
    const result = await prisma.$queryRaw`
      EXEC Generate_Email_Qualified_Trainers @EmployeeId=${employeeId}
    `;

    // result is an array of records, take the first record's Email property if exists
    const email = result && result.length > 0 ? result[0].Email : null;

    return res.status(200).json({ email });
  } catch (error) {
    console.error('Error executing stored procedure:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
