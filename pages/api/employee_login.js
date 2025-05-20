// import fetch from 'node-fetch';

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { EmployeeId, Password } = req.body;

//     if (!EmployeeId || !Password) {
//       return res.status(400).json({ message: 'EmployeeId and Password are required.' });
//     }

//     try {
//       // Call external API for authentication
//       const response = await fetch('http://10.40.20.93:300/api/Login/authenticate', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ EmployeeId, Password }),
//       });

//       const data = await response.json();
//       console.log(data);
//       if (response.ok) {
//         // Normalize the success message for frontend compatibility
//         const normalizedData = {
//           ...data,
//           message: "Login Successful"
//         };
//         return res.status(200).json(normalizedData);
//       } else {
//         console.error('External API login failed:', data);
//         return res.status(response.status).json(data);
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }
//   } else {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }
// pages/api/login.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { EmployeeId, Password } = req.body;

    if (!EmployeeId || !Password) {
      return res.status(400).json({ message: 'EmployeeId and Password are required.' });
    }

    try {
      // Execute stored procedure using Prisma's `$queryRaw` method
      const result = await prisma.$queryRaw`
        EXEC sp_EmployeeLogin @EmployeeId = ${EmployeeId}, @Password = ${Password}
      `;

      // Check the result from the stored procedure
      if (result && result.length > 0) {
        const loginResult = result[0];

        if (loginResult.Message === 'Login Successful') {
          // If login successful, return EmployeeId and Department
          return res.status(200).json({
            message: loginResult.Message,
            employeeId: loginResult.EmployeeId,
            department: loginResult.Department, // Include department information
            section:loginResult.Section,
            username:loginResult.Username,
            designation :loginResult.Designation
          });
        } else {
          return res.status(401).json({ message: loginResult.Message });
        }
      } else {
        return res.status(401).json({ message: 'Invalid credentials or inactive account' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}