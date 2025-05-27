import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const Data = await prisma.$queryRaw`
        EXEC [dbo].[Get_Designation_Dropdown]
      `;

      if (Data.length === 0) {
        return res.status(404).json({ message: "No Data" });
      }

      return res.status(200).json(Data);
    } catch (error) {
      console.error("Error fetching Designation", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}