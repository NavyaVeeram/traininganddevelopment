import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Request body:', req.body)
    const { Agency_name, Contact_person, Location, Contact_1, Contact_2, Mailid, Website, CreatedBy } = req.body
    try {
      // console.log('Calling stored procedure with parameters:', {
      //   Agency_name,
      //   Contact_person,
      //   Location,
      //   Contact_1,
      //   Contact_2,
      //   Mailid,
      //   CreatedBy,
      // })
      const result = await prisma.$queryRaw`
        EXEC [dbo].[External_Training_Agencies_Upload] 
          @Agency_name = ${Agency_name},
          @Contact_person = ${Contact_person},
          @Location = ${Location},
          @Contact_1 = ${Contact_1},
          @Contact_2 = ${Contact_2},
          @Mailid = ${Mailid},
          @Website = ${Website},
          @CreatedBy = ${CreatedBy}
      `
      if (!result || (Array.isArray(result) && result.length === 0)) {
        console.log('Stored procedure returned empty result')
      } else {
        console.log('Stored procedure result:', result)
      }
      return res.status(200).json(result)
    } catch (error) {
      console.error('Error executing stored procedure:', error)
      return res.status(500).json({ error: 'An error occurred while uploading the agency' })
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' })
  }
}
