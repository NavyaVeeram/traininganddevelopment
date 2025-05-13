import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Extract the data from the request body
      const {
        Training_Name,
        Year_No,
        Department,
        Program_Name,
        Train_Mode,
        Train_Purpose,
        Persons,
        No_Hrs,
        No_Times,
        Req_Months,
        Evaluation_Period,
        CreatedBy,
        UpdatedBy
      } = req.body;

      // Prepare the SQL query to call the stored procedure
      const query = `
        EXEC [dbo].[Insert_TrainingData] 
          @Training_Name = N'${Training_Name}', 
          @Year_No = ${Year_No}, 
          @Department = N'${Department}', 
          @Program_Name = N'${Program_Name}', 
          @Train_Mode = N'${Train_Mode}', 
          @Train_Purpose = N'${Train_Purpose}', 
          @Persons = N'${Persons}', 
          @No_Hrs = ${No_Hrs}, 
          @No_Times = ${No_Times}, 
          @Req_Months = N'${Req_Months}', 
          @Evaluation_Period = ${Evaluation_Period}, 
          @CreatedBy = N'${CreatedBy}',
          @UpdatedBy = N'${UpdatedBy}'
      `;

      // Execute the query
      const result = await prisma.$queryRawUnsafe(query);
   console.log('Calling stored procedure with parameters:', {
      Training_Name,
      Year_No,
      Department,
      Program_Name,
      Train_Mode,
      Train_Purpose,
      Persons,
      No_Hrs,
      No_Times,
      Req_Months,
      Evaluation_Period,
      CreatedBy,
      UpdatedBy
      })
      // Return a success response
      res.status(200).json({ message: 'Data inserted successfully', result });
      console.log(result);
    } catch (error) {
      console.error('Error executing stored procedure:', error);
      res.status(500).json({ message: 'Failed to insert data', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
