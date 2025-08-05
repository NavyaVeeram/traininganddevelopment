// pages/api/trainingAttendance.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") 
    try {
      // Call the stored procedure
      const trainingData = await prisma.$queryRaw`
        EXEC dbo.Get_Venue_Dropdown 
      `;
      res.status(200).json(trainingData);
    } catch (error) {
      console.error("Error executing stored procedure", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } 
  