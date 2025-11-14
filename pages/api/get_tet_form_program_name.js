// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   if (req.method === "GET") {
//     const { id: programId } = req.query;

//     if (!programId) {
//       return res.status(400).json({ message: "ProgramId is required" });
//     }

//     try {
//       const employeeDetails = await prisma.$queryRaw`
//         EXEC [dbo].[Get_TET_Form_Program_Name] @Program_Id = ${programId}
//       `;

//       if (employeeDetails.length === 0) {
//         return res.status(404).json({ message: "No employee details found" });
//       }

//       return res.status(200).json(employeeDetails);
//     } catch (error) {
//       console.error("Error fetching employee details", error);
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
    const { id: programId } = req.query; // keep same name — frontend unaffected

    if (!programId) {
      return res.status(400).json({ message: "ProgramId is required" });
    }

    try {
      // programId can be "843" or "843,844,845"
      const cleanIds = programId.trim();
      const idArray = cleanIds.split(",").map(id => id.trim()).filter(id => id !== "");

      if (idArray.some(id => isNaN(id))) {
        return res.status(400).json({ message: "ProgramId(s) must be valid number(s)" });
      }

      const idString = idArray.join(",");

      // Use stored procedure (which now expects @Program_Ids)
      const employeeDetails = await prisma.$queryRawUnsafe(`
        EXEC [dbo].[Get_TET_Form_Program_Name] @Program_Ids = '${idString}'
      `);

      if (!employeeDetails || employeeDetails.length === 0) {
        return res.status(404).json({ message: "No employee details found" });
      }

      // If single ID, return single object (to match old frontend expectations)
      if (idArray.length === 1) {
        return res.status(200).json(employeeDetails);
      }

      // If multiple IDs, return array (frontend can still map over it)
      return res.status(200).json(employeeDetails);
    } catch (error) {
      console.error("Error fetching employee details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
