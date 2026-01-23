import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { trainingName } = req.body;

  if (!trainingName) {
    return res.status(400).json({ message: "Training name is required" });
  }

  try {
    const programs = await prisma.$queryRaw`
      EXEC dbo.Get_Programs_By_Training @Training_Name = ${trainingName}
    `;

    return res.status(200).json(programs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}
