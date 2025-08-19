// pages/api/get_training_attendance_dropdown_test.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { month, year, Training_Name } = req.query;

    if (!month || !year || !Training_Name) {
      return res.status(400).json({ 
        error: "Month, year, and training name are required" 
      });
    }

    try {
      // Call the stored procedure
      const trainingData = await prisma.$queryRaw`
        EXEC dbo.Training_Attendance_Dropdown 
        @Month_No=${parseInt(month)}, 
        @Year_No=${parseInt(year)}, 
        @Training_Name = ${Training_Name}
      `;
      res.status(200).json(trainingData);
    } catch (error) {
      console.error("Error executing stored procedure", error);
      res.status(500).json({ 
        error: "Failed to fetch data",
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
