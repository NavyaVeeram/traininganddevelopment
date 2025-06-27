// pages/api/trainingAttendance.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "Year number is required" });
    }
    try {
      // Call the stored procedure
      const trainingData = await prisma.$queryRaw`
        EXEC dbo.Training_Attendance_Dropdown @Month_No=${parseInt(month)}, @Year_No=${parseInt(year)}
      `;
      res.status(200).json(trainingData);
    } catch (error) {
      console.error("Error executing stored procedure", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}