// // pages/api/get_tet_form_emp_details2.js
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === "GET") {
//  const programIds = req.query.id?.trim();

// if (!programIds || programIds.toLowerCase() === "nan" || programIds.toLowerCase() === "undefined") {
//   return res.status(400).json({ message: "Invalid ProgramIds" });
// }


//     try {
//       console.log("Fetching employee details for ProgramIds:", programIds);

//       // No Number() conversion — pass as string
//       const employeeDetails = await prisma.$queryRawUnsafe(`
//         EXEC [dbo].[Get_TET_Form_Emp_Details] @Program_Ids = '${programIds}'
//       `);

//       console.log("Employee details fetched:", employeeDetails.length);

//       if (!employeeDetails || employeeDetails.length === 0) {
//         return res.status(404).json({ message: "No employee details found" });
//       }

//       return res.status(200).json(employeeDetails);
//     } catch (error) {
//       console.error("Error fetching employee details:", error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   } else {
//     return res.status(405).json({ message: "Method not allowed" });
//   }
// }
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    let programIds = req.query.id;

    // Validate programIds exists and is not invalid string
    if (!programIds || typeof programIds !== "string" || programIds.trim().toLowerCase() === "nan" || programIds.trim().toLowerCase() === "undefined") {
      return res.status(400).json({ message: "Invalid ProgramIds" });
    }

    // Trim whitespace
    programIds = programIds.trim();

    // Optional: Sanitize input further or validate format (numbers separated by commas)
    // Example simple regex test to allow only digits and commas
    if (!/^\d+(,\s*\d+)*$/.test(programIds)) {
      return res.status(400).json({ message: "ProgramIds must be numbers separated by commas" });
    }

    try {
      console.log("Fetching employee details for ProgramIds:", programIds);

      // Pass programIds string directly to stored procedure
      const employeeDetails = await prisma.$queryRawUnsafe(`
        EXEC [dbo].[Get_TET_Form_Emp_Details] @Program_Ids = '${programIds}'
      `);

      console.log("Employee details fetched:", employeeDetails.length);

      if (!employeeDetails || employeeDetails.length === 0) {
        return res.status(404).json({ message: "No employee details found" });
      }

      return res.status(200).json(employeeDetails);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
