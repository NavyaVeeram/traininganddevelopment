// // pages/api/get-access-role.js

// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req, res) {
//   const { employeeId } = req.query;

//   if (!employeeId) {
//     return res.status(400).json({ error: 'Missing employeeId' });
//   }

//   try {
//     // Call the stored procedure with employeeId
//     const result = await prisma.$queryRawUnsafe(
//       `EXEC Get_Access_Role @EmployeeId = '${employeeId}'`
//     );

//     if (result.length === 0 || !result[0].Access_Role) {
//       return res.status(404).json({ error: 'Role not found' });
//     }

//     return res.status(200).json({ Access_Role: result[0].Access_Role });
//   } catch (err) {
//     console.error('SP Error:', err);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }
// pages/api/get_access_role.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { employeeId } = req.query;

  if (!employeeId) {
    return res.status(400).json({ error: 'Missing employeeId' });
  }

  try {
    // Call the stored procedure with employeeId
    const result = await prisma.$queryRawUnsafe(
      `EXEC Get_Access_Role @EmployeeId = '${employeeId}'`
    );

    if (result.length === 0 || !result[0].Access_Role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // ✅ Return BOTH Access_Role AND Department
    return res.status(200).json({ 
      EmployeeId: result[0].EmployeeId,
      Department: result[0].Department,
      Access_Role: result[0].Access_Role 
    });
  } catch (err) {
    console.error('SP Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}