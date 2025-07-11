import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { Qual_Id, IsActive } = req.body;

  if (Qual_Id === undefined || IsActive === undefined) {
    return res.status(400).json({ message: 'Qual_Id and IsActive are required' });
  }

  try {
    // Call the stored procedure to update IsActive status
    const result = await prisma.$queryRaw`
      EXEC Update_Active_Status_To_Remove_Trainers @Qual_Id = ${Qual_Id}, @IsActive = ${IsActive}
    `;

    return res.status(200).json({ message: 'Status updated successfully', result });
  } catch (error) {
    console.error('Error updating active status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
