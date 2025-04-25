import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      Training_Name,
      Program_Name,
      CreatedBy,
    } = req.body;

    try {
 

      const result = await prisma.$queryRaw`
      EXEC dbo.Insert_Standard_Program 
        @Training_Name = ${Training_Name},
        @Program_Name = ${Program_Name},
        @CreatedBy = ${CreatedBy}
    `;
    
      console.log({
        Training_Name,
        Program_Name,
        CreatedBy
      });
      
      res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the program.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}