import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { trainer } = req.query;

    if (!trainer) {
      return res.status(400).json({
        message: "Trainer parameter is required",
      });
    }

    try {
      const trainerHistory = await prisma.$queryRaw`
        EXEC [dbo].[Get_Trainer_History_Table] @Trainer = ${trainer}
      `;

      if (!Array.isArray(trainerHistory) || trainerHistory.length === 0) {
        return res.status(404).json({
          message: "No training history found for the given trainer",
        });
      }

      return res.status(200).json(trainerHistory);
    } catch (error) {
      console.error("Error fetching trainer history:", error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  } else {
    return res.status(405).json({
      message: "Method Not Allowed",
    });
  }
}
