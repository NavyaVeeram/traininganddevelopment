import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handler(req, res) {
  if (req.method === "GET") {
    const { program_id } = req.query;

    if (!program_id) {
      return res.status(400).json({ error: "Program ID is required" });
    }

    try {
      // Call the stored procedure to get the training entry details by Program_Id
      const trainingDetails = await prisma.$queryRaw`
        EXEC dbo.Get_Training_Att_Entry @Program_Id = ${program_id}
      `;
      
      if (trainingDetails.length === 0) {
        return res.status(404).json({ error: "No details found for the provided Program ID" });
      }

      res.status(200).json(trainingDetails);
    } catch (error) {
      console.error("Error executing stored procedure", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}