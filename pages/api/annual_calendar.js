import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  // Add CORS headers to allow all origins for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const year = parseInt(req.query.year) || 2025;
  const trainingName = req.query.trainingName || "";

  try {
    const result = await prisma.$queryRaw`
      EXEC [dbo].[Get_Annual_Training_Calendar] @Year_No = ${year}, @Training_Name = ${trainingName};
    `;

    res.status(200).json(result);
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
}
