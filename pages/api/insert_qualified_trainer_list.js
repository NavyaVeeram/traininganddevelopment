import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { Training_Name, EmployeeId, Certified, Cert_Des = "", Exp_5_Yr, Exp_3_Yr, HOD_Rec, Qualified, IsActive = 1, CreatedBy } = req.body;

    try {
         console.log('Calling stored procedure with parameters:', {
      Training_Name,
      EmployeeId,
      Certified,
      Cert_Des,
      Exp_5_Yr,
      Exp_3_Yr,
      HOD_Rec,
      Qualified,
      IsActive,
      CreatedBy
      })
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Qualified_Trainer_List 
          @Training_Name = ${Training_Name},
          @EmployeeId = ${EmployeeId},
          @Certified = ${Certified},
          @Cert_Des = ${Cert_Des},
          @Exp_5_Yr = ${Exp_5_Yr},
          @Exp_3_Yr = ${Exp_3_Yr},
          @HOD_Rec = ${HOD_Rec},        
          @Qualified = ${Qualified},
          @IsActive = ${IsActive},
          @CreatedBy = ${CreatedBy}
        `;
        console.log(result);
        res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
