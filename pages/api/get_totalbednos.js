import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    console.warn("⚠️ Invalid method:", req.method);
    return res.status(405).json({ error: 'Only GET method is allowed' });
  }

  const { DormNames, FloorList, RoomNos } = req.query;

  try {
    let results;


    console.log("📥 Received query params:", { DormNames, FloorList, RoomNos });

    if (DormNames && FloorList && RoomNos) {
      results = await prisma.$queryRaw`
        EXEC [dbo].[Get_TotalBedNos] 
          @DormNames = ${DormNames}, 
          @FloorList = ${FloorList}, 
          @RoomNos = ${RoomNos}
      `;
      console.log("✅ Executed Get_TotalBedNos with parameters.");
      console.table(results); // Display results in a table format
    } else {
      results = await prisma.$queryRaw`
        EXEC [dbo].[Get_TotalBedNos]
      `;
      console.log("⚠️ Executed Get_TotalBedNos without parameters (returns all).");
      console.table(results); 
    }

    return res.status(200).json({ missingBeds: results });
  } catch (error) {
    console.error("❌ Stored procedure execution error:", error.message);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}