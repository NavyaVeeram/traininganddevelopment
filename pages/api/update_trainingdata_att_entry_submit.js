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
      CreatedBy
    } = req.body;

    try {
      // Format the Training_Date and Training_Status before sending to SQL Server
      const formattedTrainingDate = (Training_Date === '' || Training_Date === null) ? null : Training_Date;
      const formattedTrainingStatus = (Training_Status === '' || Training_Status === null) ? null : Training_Status;
//console.log(req.body);
      // Execute the raw SQL query with the formatted date and status
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
        @CreatedBy = ${CreatedBy}
      `;
         console.log('Calling stored procedure with parameters:', {
  Program_Id,
  Persons,
  No_Hrs,
  Training_Date,
  Training_Status,
  Schedule_Type,
  Trainer,
  Venue,
  Actual_Budget,
  CreatedBy
      })
      console.log(result);
      res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error occurred while updating the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}