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
    // Only pass year now
    const data = await prisma.$queryRaw`
      EXEC [dbo].[Approval_Form_MonthCount] ${yearInt}
    `;

    console.log("Data returned from stored procedure:", data);

    if (data.length === 0) {
      // Return all 12 months with 0 count if no data found
      const zeroMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const zeroData = zeroMonths.map((month) => ({
        Month: month,
        MonthCount: 0,
        HSE_Count: 0,
        IATF_Count: 0,
        Training_name: null
      }));

      return res.status(200).json(zeroData);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching month count:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}