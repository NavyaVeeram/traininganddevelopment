import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
if (req.method === 'GET') {
try {
// Execute the stored procedure
const trainers = await prisma.$queryRaw`
EXEC [dbo].[Qualified_Trainer_Dropdown]
`;

res.status(200).json(trainers);
} catch (error) {
console.error('Error fetching trainers:', error);
res.status(500).json({ message: 'Failed to fetch trainer list.' });
}
} else {
res.status(405).json({ message: 'Method Not Allowed' });
}
}