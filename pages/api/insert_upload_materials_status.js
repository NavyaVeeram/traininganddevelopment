import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { Program_Id,IsUpload, CreatedBy } = req.body;

    try {
        const result = await prisma.$queryRaw`
          EXEC dbo.Insert_Upload_Materials_Status
          @Program_Id = ${Program_Id},
          @IsUpload = ${IsUpload},
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