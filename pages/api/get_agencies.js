import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const agencies = await prisma.$queryRaw`
        EXEC [dbo].[Get_External_Training_Agencies]
      `;
      return res.status(200).json({ agencies });
    } catch (error) {
      console.error("Error executing stored procedure:", error);
      return res.status(500).json({ error: "An error occurred while fetching the agencies" });
    } finally {
      await prisma.$disconnect();
    }
  }

  // 🟡 This now correctly runs for non-GET methods
  return res.status(405).json({ error: "Method Not Allowed" });
}
