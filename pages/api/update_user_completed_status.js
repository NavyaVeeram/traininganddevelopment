import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log('Incoming request body:', req.body); // Log the incoming request body
    const { Program_Id, Training_Status } = req.body;

    // Ensure that both Program_Id and Training_Status are provided
    if (!Program_Id || !Training_Status) {
      return res.status(400).json({ error: 'Both Program_Id and Training_Status are required' });
    }

    try {
      // Execute the stored procedure with raw query
      await prisma.$queryRaw`
        EXEC [dbo].[Update_User_Status_Completed] 
        @Program_Id = ${Program_Id}, 
        @Training_Status = ${Training_Status}
      `;

      // Respond with a success message after the update
      res.status(200).json({ message: 'User status updated successfully' });
      console.log(`User status for Program_Id ${Program_Id} updated to ${Training_Status}`);

    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    } finally {
      await prisma.$disconnect(); // Ensure the Prisma client disconnects
    }
  } else {
    // Handle methods other than POST (optional)
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
