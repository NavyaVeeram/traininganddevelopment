import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const trainers = await prisma.$queryRaw`
      EXEC dbo.Get_Trainers_Dropdown
    `;

    const formatted = trainers.map(item => ({
      value: item.Value,
      label: item.Text
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Trainer dropdown error:", error);
    res.status(500).json({ message: "Failed to fetch trainers" });
  }
}
