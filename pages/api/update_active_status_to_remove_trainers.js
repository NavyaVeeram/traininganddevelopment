import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Qual_Id, Status } = req.body;

  console.log('Received Qual_Id:', Qual_Id, 'Status:', Status); // Added logging

  if (Qual_Id === undefined || Status === undefined) {
    return res.status(400).json({ message: 'Qual_Id and IsActive are required' });
  }

    try {
    // Call the stored procedure to update IsActive status
    const result = await prisma.$queryRaw`
      EXEC Update_Active_Status_To_Remove_Trainers @Qual_Id = ${Qual_Id}, @Status = ${Status}
    `;

    // The result is an array with the message from the stored procedure
    const message = result && result.length > 0 && result[0].message ? result[0].message : 'Status updated successfully';

    console.log('Stored procedure result:', message); // Added logging

    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error updating active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
