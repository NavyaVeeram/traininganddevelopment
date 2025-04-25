import { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { programId, empid, download } = req.query; // Accept empid and download flag

  // Ensure programId is valid and not 'null' or empty
  if (!programId || programId === 'null' || isNaN(parseInt(programId, 10))) {
    return res.status(400).json({ error: "Valid Program Id is required" });
  }

  const programIdInt = parseInt(programId, 10); // Ensure programId is an integer
  if (isNaN(programIdInt)) {
    return res.status(400).json({ error: "Invalid Program Id" });
  }

  try {
    // Call the stored procedure
    let result = await prisma.$queryRaw`
      EXEC [dbo].[Get_TET_Form_Emp_Details] ${programIdInt}
    `;

    // If empid filter is provided, filter the result
    if (empid) {
      const empidArray = Array.isArray(empid) ? empid : empid.split(",");
      result = result.filter((item) =>
        empidArray.includes(item.EmployeeId?.toString())
      );
    }

    if (download === "true") {
      // Convert result to CSV and send as file download
      const fields = result.length > 0 ? Object.keys(result[0]) : [];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result);

      res.setHeader("Content-Disposition", "attachment; filename=tet_report.csv");
      res.setHeader("Content-Type", "text/csv");
      return res.status(200).send(csv);
    } else {
      // Return JSON response
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error executing stored procedure:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
