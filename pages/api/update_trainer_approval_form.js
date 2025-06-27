import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    Qual_Id,
    Training_Name,
    Department,
    Section,
    Qualified,
    Certified,
    Exp_5_Yr,
    Exp_3_Yr,
    HOD_Rec,
    CreatedBy,
  } = req.body;

  if (!Qual_Id) {
    return res.status(400).json({ message: 'Qual_Id is required in the request body' });
  }

  try {
    const result = await prisma.$queryRaw`
      DECLARE @Result VARCHAR(MAX);
      EXEC [dbo].[Update_Trainer_Approval_Form]
        @Qual_Id = ${Qual_Id},
        @Training_Name = ${Training_Name},
        @Department = ${Department},
        @Section = ${Section},
        @Qualified = ${Qualified},
        @Certified = ${Certified},
        @Exp_5_Yr = ${Exp_5_Yr},
        @Exp_3_Yr = ${Exp_3_Yr},
        @HOD_Rec = ${HOD_Rec},
        @CreatedBy = ${CreatedBy};
    `;

    const message = Array.isArray(result) && result.length > 0 ? result[0].Result : 'Update executed.';

    res.status(200).json({ message, dbResult: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}
