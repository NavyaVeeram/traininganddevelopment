import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      Actual_Budget,
      Cancel,
      CreatedBy
    } = req.body;

    try {
      // Handle empty or null date/status
      const formattedTrainingDate = (Training_Date === '' || Training_Date === null) ? null : Training_Date;
      const formattedTrainingStatus = (Training_Status === '' || Training_Status === null) ? null : Training_Status;

      // Call stored procedure using Prisma
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Update_TrainingData_Att_Entry_Submit]
        @Program_Id = ${Program_Id},
        @Persons = ${Persons},
        @No_Hrs = ${No_Hrs},
        @Training_Date = ${formattedTrainingDate},
        @Training_Status = ${formattedTrainingStatus},
        @Schedule_Type = ${Schedule_Type},
        @Trainer = ${Trainer},
        @Venue = ${Venue},
        @Actual_Budget = ${Actual_Budget},
        @Cancel = ${Cancel},
        @CreatedBy = ${CreatedBy}
      `;

      console.log('Stored procedure executed with:', {
        Program_Id,
        Persons,
        No_Hrs,
        Training_Date,
        Training_Status,
        Schedule_Type,
        Trainer,
        Venue,
        Actual_Budget,
        Cancel,
        CreatedBy
      });

      res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({ message: 'Error occurred while updating the program.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
