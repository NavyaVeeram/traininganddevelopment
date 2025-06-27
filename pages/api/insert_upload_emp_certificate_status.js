import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { Program_Id, Employee_Id, IsUpload, CreatedBy } = req.body;

    try {
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Upload_Emp_Certificate_Status
          @Program_Id = ${Program_Id},
          @Employee_Id = ${Employee_Id},
          @IsUpload = ${IsUpload},
          @CreatedBy = ${CreatedBy}
        `;
        console.log('Calling stored procedure with parameters:', {
          Program_Id,
          Employee_Id,
          IsUpload,
          CreatedBy,
        });
        const message = result[0]?.Result;
        if (!message) {
          // If no message returned, assume file already exists
          res.status(409).json({ message: 'File already exists.' });
        } else {
          res.status(200).json({ message });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while adding the program.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
