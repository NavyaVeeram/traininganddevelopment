import { prisma } from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { department, section } = req.body;

  try {
    const result = await prisma.$queryRaw`
      EXEC [dbo].[Generate_Email_HOS] @Department=${department}, @Section=${section}
    `;

    if (!Array.isArray(result) || result.length === 0 || !result[0].Email) {
      return res.status(404).json({ message: 'No email found for given parameters' });
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
