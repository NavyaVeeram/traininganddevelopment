import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Destructure request body
    const {
      Train_Mode,
      Train_Purpose,
      Persons,
      No_Hrs,
      Req_Months,
      Evaluation_Period,
      Training_Date,
      CreatedBy,
    } = req.body;

    // Extract Program_Id from query parameters
    const { Program_Id } = req.query; 

    // Debug: log Program_Id and request body to check if everything is being passed correctly
    console.log('Received Program_Id:', Program_Id);
    console.log('Request Body:', req.body);

    // Validation checks for required fields
    if (!Train_Mode || !Train_Purpose || !Persons || !No_Hrs || !Req_Months || !Evaluation_Period || !Training_Date ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ensure Program_Id is a valid integer update training data
    const programIdInt = parseInt(Program_Id, 10);
    if (isNaN(programIdInt)) {
      return res.status(400).json({ message: 'Program_Id must be a valid number' });
    }

    try {
      // Execute the stored procedure using Prisma's raw query
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Update_TrainingData_Master] 
          @Program_Id = ${programIdInt}, 
          @Train_Mode = ${Train_Mode}, 
          @Train_Purpose = ${Train_Purpose}, 
          @Persons = ${Persons}, 
          @No_Hrs = ${No_Hrs}, 
          @Req_Months = ${Req_Months}, 
          @Evaluation_Period = ${Evaluation_Period}, 
          @Training_Date = ${Training_Date},
          @CreatedBy = ${CreatedBy}
      `;
         console.log('Calling stored procedure with parameters:', {
      Program_Id: programIdInt,
      Train_Mode: Train_Mode,
      Train_Purpose: Train_Purpose,
      Persons: Persons,
      No_Hrs: No_Hrs,
      Req_Months: Req_Months,
      Evaluation_Period: Evaluation_Period,
      Training_Date: Training_Date,
      CreatedBy: CreatedBy
      })
      // Log the raw result to see what is being returned from the stored procedure
      console.log('Stored Procedure Result:', result);

      // Extract the Result message from the stored procedure's output
      const message = result?.[0]?.Result || 'Unknown error occurred';

      // Respond with the message from the stored procedure
      return res.status(200).json({ message });
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      return res.status(500).json({ message: 'Error updating the record', error: error.message });
    }
  } else {
    // Handle other methods (not allowed)
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}