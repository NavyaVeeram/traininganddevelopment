// pages/api/update-approval-form.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    Program_Id,
    Train_Mode,
    Train_Purpose,
    Persons,
    No_Hrs,
    Req_Months,
    Evaluation_Period,
    CreatedBy,
  } = req.body;

  if (!Program_Id) {
    return res.status(400).json({ message: 'Program_Id is required in the request body' });
  }

  console.log('Received update parameters:', {
    Program_Id,
    Train_Mode,
    Train_Purpose,
    Persons,
    No_Hrs,
    Req_Months,
    Evaluation_Period,
    CreatedBy,
  });

  try {
    const result = await prisma.$queryRaw`
      DECLARE @Result VARCHAR(MAX);
      EXEC [dbo].[Update_Approval_Form]
        @Program_Id = ${Program_Id},
        @Train_Mode = ${Train_Mode},
        @Train_Purpose = ${Train_Purpose},
        @Persons = ${Persons},
        @No_Hrs = ${No_Hrs},
        @Req_Months = ${Req_Months},
        @Evaluation_Period = ${Evaluation_Period},
        @CreatedBy = ${CreatedBy};
    `;

    // result is an array of objects with Result property
    const message = Array.isArray(result) && result.length > 0 ? result[0].Result : 'Update executed.';

    res.status(200).json({ message, dbResult: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}
