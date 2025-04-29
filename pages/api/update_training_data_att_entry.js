import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      Program_Id,
      Persons,
      No_Hrs,
      Training_Date,
      Training_Status,
      Schedule_Type,
      Trainer,
      Venue,
      Training_Budget,
      CreatedBy
    } = req.body;
    try {
      // Execute your stored procedure via Prisma or raw SQL query.
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Update_TrainingData_Att_Entry]
          @Program_Id = ${Program_Id},
          @Persons = ${Persons},
          @No_Hrs = ${No_Hrs},
          @Training_Date = ${Training_Date},
          @Training_Status = ${Training_Status},
          @Schedule_Type = ${Schedule_Type},
          @Trainer = ${Trainer},
          @Venue = ${Venue},
          @Training_Budget = ${Training_Budget},
          @CreatedBy = ${CreatedBy}
      `;

      res.status(200).json({ message: result });
      console.log(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
