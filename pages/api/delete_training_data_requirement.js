
// pages/api/delete_training_data.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { Program_Id } = req.query;

    // Validate Program_Id
    if (!Program_Id) {
      return res.status(400).json({ message: 'Program_Id is required for deletion' });
    }

    // Ensure Program_Id is a valid number
    const programIdInt = parseInt(Program_Id, 10);
    if (isNaN(programIdInt)) {
      return res.status(400).json({ message: 'Program_Id must be a valid number' });
    }

    try {
      // Execute the stored procedure to delete the record
      const result = await prisma.$queryRaw`
        EXEC dbo.Delete_Training_Data_Requirement @Program_Id = ${programIdInt}
      `;

      // Check if the deletion was successful
      if (result) {
        return res.status(200).json({ message: 'Record deleted successfully' });
      } else {
        return res.status(404).json({ message: 'Record not found' });
      }
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      return res.status(500).json({ message: 'Failed to delete record', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
