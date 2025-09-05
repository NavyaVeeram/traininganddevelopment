import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let {
      Program_Id,      // comma-separated values like "981,982,983"
      Persons,
      No_Hrs,
      Train_Mode,
      Training_Date,
      Training_Status,
      Schedule_Type,
      Trainer, // <-- could be array from frontend
      External_Trainer, // Assuming this is the same as Trainer
      Venue,
      Actual_Budget,
      Cancel,
      CreatedBy
    } = req.body;

    try {
      // Ensure Program_Id is a comma-separated string
      const programIds = String(Program_Id).trim();

      // Convert Trainer array to comma-separated string
      if (Array.isArray(Trainer)) {
        Trainer = Trainer.join(',');
      }

      // Convert numeric values safely
      const persons = Number(Persons);
      const noHrs = Number(No_Hrs);
      const actualBudget = Actual_Budget ? Number(Actual_Budget) : null;
      const cancel = Cancel ? Number(Cancel) : 0;

      // Handle null/empty date/status
      const formattedTrainingDate = (Training_Date === '' || Training_Date === null) ? null : Training_Date;
      const formattedTrainingStatus = (Training_Status === '' || Training_Status === null) ? null : Training_Status;
 console.log('🚀 Submitting Training Data:');
      console.log({
        programIds,
        persons,
        noHrs,
        Train_Mode,
        formattedTrainingDate,
        formattedTrainingStatus,
        Schedule_Type,
        Trainer,
        External_Trainer,
        Venue,
        actualBudget,
        cancel,
        CreatedBy,
      });
      // Call stored procedure
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Update_TrainingData_Att_Entry_Submit]
          @Program_Id = ${programIds},
          @Persons = ${persons},
          @No_Hrs = ${noHrs},
          @Train_Mode = ${Train_Mode},
          @Training_Date = ${formattedTrainingDate},
          @Training_Status = ${formattedTrainingStatus},
          @Schedule_Type = ${Schedule_Type},
          @Trainer = ${Trainer},
          @External_Trainer = ${External_Trainer},
          @Venue = ${Venue},
          @Actual_Budget = ${actualBudget},
          @Cancel = ${cancel},
          @CreatedBy = ${CreatedBy}
      `;
console.log('Stored procedure result:', result);
      res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({ message: 'Error occurred while updating the program.' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
