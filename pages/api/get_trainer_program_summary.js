import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { trainerId } = req.body;

    if (!trainerId) {
      return res.status(400).json({ error: "Trainer Id is required" });
    }

    const query = `
      EXEC dbo.Get_Trainer_Program_Summary 
      @Trainer = '${trainerId}'
    `;

    const data = await prisma.$queryRawUnsafe(query);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Trainer summary API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
