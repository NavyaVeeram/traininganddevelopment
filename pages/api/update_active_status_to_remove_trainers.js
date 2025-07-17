import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { Qual_Id, Status } = req.body;

      const result = await prisma.$queryRawUnsafe(`
        EXEC [dbo].[Update_Active_Status_To_Remove_Trainers] @Qual_Id = ${Qual_Id}, @Status = ${Status};
      `);

      return res.status(200).json({ message: "Status updated successfully", result });
    } catch (error) {
      console.error("Error updating status", error);
      return res.status(500).json({ error: "Failed to update status" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
