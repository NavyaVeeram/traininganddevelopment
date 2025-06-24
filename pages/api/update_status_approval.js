import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
if (req.method !== 'PATCH') {
return res.status(405).json({ message: 'Method Not Allowed' });
}

// Get the programId and newStatus from the request body
const { programId, newStatus } = req.body;

// Check if programId or newStatus are missing
if (!programId || newStatus === undefined) {
return res.status(400).json({ message: 'ProgramId and newStatus are required' });
}

try {
// Execute the stored procedure to update the IsActive status
const result = await prisma.$queryRaw`EXEC Update_User_Active_Status @Program_Id = ${programId}, @IsActive = ${newStatus}`;

// Return a success response
res.status(200).json({ message: 'Status updated successfully', result });
} catch (error) {
console.error('Error updating program status:', error);
res.status(500).json({ message: 'Internal Server Error' });
}
}