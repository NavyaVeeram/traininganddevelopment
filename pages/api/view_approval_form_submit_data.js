import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { employeeId, year_No } = req.body;  // note underscore to match frontend

  if (!employeeId || !year_No) {
    return res.status(400).json({ message: 'EmployeeId and Year_No are required.' });
  }

  try {
    const result = await prisma.$queryRaw`
      EXEC Approval_Form_Submit_Data @EmployeeId = ${employeeId}, @Year_No = ${year_No}
    `;
    console.log('Sending:', { employeeId, year_No });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
