import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { year } = req.query;
  const yearInt = parseInt(year, 10);

  if (!year || isNaN(yearInt)) {
    return res.status(400).json({ message: "Missing or invalid year" });
  }

  try {
    const data = await prisma.$queryRaw`
      EXEC [dbo].[Month_Wise_Budget] ${yearInt}
    `;
    res.status(200).json(data);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
