import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { Training_Name, EmployeeId, Certified, Exp_5_Yr, Exp_3_Yr, HOD_Rec, Qualified, CreatedBy } = req.body;

    try {
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Qualified_Trainer_List 
          @Training_Name = ${Training_Name},
          @EmployeeId = ${EmployeeId},
          @Certified = ${Certified},
          @Exp_5_Yr = ${Exp_5_Yr},
          @Exp_3_Yr = ${Exp_3_Yr},
          @HOD_Rec = ${HOD_Rec},        
          @Qualified = ${Qualified},
          @CreatedBy = ${CreatedBy}
        `;
        res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
