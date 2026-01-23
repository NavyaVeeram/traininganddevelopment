import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/training-calendar
// Calls: EXEC Training_Calendar_Details @Year_No, @Month

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { Year_No, Month } = req.query;

    if (!Year_No) {
      return res.status(400).json({ message: "Year_No is required" });
    }

    const year = parseInt(Year_No, 10);
    const month = Month && Month !== "" ? Month : null;

    // Prisma raw stored procedure execution
    const data = await prisma.$queryRawUnsafe(
      `EXEC Training_Calendar_Details @Year_No = ${year}, @Month = ${month ? `'${month}'` : "NULL"}`
    );

    return res.status(200).json(data);
  } catch (error) {
    console.error("Training Calendar API Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
