

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default async function handler(req, res) {
  console.log('DELETE API called with method:', req.method);
  console.log('Query params:', req.query);
  
  if (req.method === 'POST') {
    const { Program_Id } = req.query;
    console.log('Program_Id received:', Program_Id);

    if (!Program_Id) {
      console.log('Program_Id missing');
      return res.status(400).json({ message: 'Program_Id is required for deletion' });
    }

    const programIdInt = parseInt(Program_Id, 10);
    if (isNaN(programIdInt)) {
      console.log('Program_Id is not a valid number:', Program_Id);
      return res.status(400).json({ message: 'Program_Id must be a valid number' });
    }

    try {
      console.log('Attempting to delete Program_Id:', programIdInt);
      
      // Test database connection first
      await prisma.$connect();
      console.log('Database connected successfully');

      const result = await prisma.$queryRaw`
        EXEC dbo.Delete_Training_Data_Requirement @Program_Id = ${programIdInt}
      `;
      
      console.log('Stored procedure executed, result:', result);
      
      await prisma.$disconnect();
      return res.status(200).json({ message: 'Record deleted successfully' });
      
    } catch (error) {
      console.error('Database error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      await prisma.$disconnect();
      return res.status(500).json({ 
        message: 'Failed to delete record', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}