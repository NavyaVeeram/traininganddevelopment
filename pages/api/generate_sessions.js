import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
 if (req.method === "POST") {
  console.log("Request body:", req.body);  // 👈 Add this

  const { Program_Name, Session } = req.body;

  if (!Program_Name || !Session) {
    return res.status(400).json({
      error: "Program_Name and Session are required",
    });
  }

  try {
  const result = await prisma.$executeRawUnsafe(`
    EXEC [dbo].[Generate_Sessions_For_Program] 
      @Program_Name = '${Program_Name}', 
      @Session = ${parseInt(Session, 10)}
  `);

  res.status(200).json({ message: "Sessions generated successfully", result });
} catch (err) {
  console.error("SQL Error:", err);   // 👈 log full SQL error
  res.status(500).json({ error: err.message });
}
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
