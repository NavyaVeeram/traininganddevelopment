import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const result = await prisma.$queryRawUnsafe(`
      EXEC [dbo].[View_Employee_Access_SP];
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch access data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
