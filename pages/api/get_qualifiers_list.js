import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    // Query to get the data from the stored procedure
    const result = await prisma.$queryRaw`
      EXEC [dbo].[View_Qualifier_List]
    `
    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred' })
  }
}
