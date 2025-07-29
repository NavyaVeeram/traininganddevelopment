import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method allowed' });
  }

  const {
    Training_Name,
    EmployeeId,
    Certified,
    Cert_Des,
    Exp_5_Yr,
    Exp_3_Yr,
    HOD_Rec,
    Qualified,
    IsActive,
    Status,
    CreatedBy,
  } = req.body;

  console.log('Received parameters:', {
    Training_Name,
    EmployeeId,
    Certified,
    Cert_Des,
    Exp_5_Yr,
    Exp_3_Yr,
    HOD_Rec,
    Qualified,
    IsActive,
    Status,
    CreatedBy,
  });

  try {
    const result = await prisma.$queryRaw`
      EXEC [Insert_Qualified_Trainer_List]
        @Training_Name=${Training_Name},
        @EmployeeId=${EmployeeId},
        @Certified=${Certified},
        @Cert_Des=${Cert_Des},
        @Exp_5_Yr=${Exp_5_Yr},
        @Exp_3_Yr=${Exp_3_Yr},
        @HOD_Rec=${HOD_Rec},
        @Qualified=${Qualified},
        @IsActive=${IsActive},
        @Status=${Status},
        @CreatedBy=${CreatedBy};
    `;

    console.log('Stored procedure result:', result);

    res.status(200).json({ message: 'data submitted successfully.', result });
  } catch (error) {
    console.error('Error calling stored procedure:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
