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
      EXEC [dbo].[Approval_Form_MonthCount] ${yearInt}
    `;

    if (!data || data.length === 0) {
      // If no data found, return 0s for all combinations
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      const modes = ["Internal", "External", "Overseas"];
      const types = ["HSE", "IATF"];

      const zeroData = [];

      months.forEach((month) => {
        types.forEach((type) => {
          modes.forEach((mode) => {
            zeroData.push({
              Month: month,
              Training_name: type,
              Train_Mode: mode,
              MonthCount: 0,
              HSE_Count: type === "HSE" ? 0 : 0,
              IATF_Count: type === "IATF" ? 0 : 0,
            });
          });
        });
      });

      return res.status(200).json(zeroData);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
