// import { prisma } from '@/lib/prisma';

// export default async function handler(req, res) {
//   const { Program_Id } = req.query;

//   if (!Program_Id) {
//     return res.status(400).json({ error: 'Program_Id is required' });
//   }

//   try {
//     const programIdInt = parseInt(Program_Id, 10);
//     if (isNaN(programIdInt)) {
//       return res.status(400).json({ error: 'Program_Id must be a valid number' });
//     }

//     const result = await prisma.$queryRaw`
//       EXEC dbo.Get_Program_Details @Program_Id = ${programIdInt}
//     `;

//     if (result.length === 0) {
//       return res.status(404).json({ error: 'Program details not found' });
//     }

//     res.status(200).json(result[0]);
//   } catch (error) {
//     console.error('Error fetching program details:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
import { prisma } from '@/lib/prisma';

export default async function handler(req, res) {
  const { Program_Id } = req.query; // same name — frontend unchanged

  if (!Program_Id) {
    return res.status(400).json({ error: 'Program_Id is required' });
  }

  try {
    // Trim and validate IDs
    const cleanIds = Program_Id.trim();
    const idArray = cleanIds.split(',').map(id => id.trim()).filter(id => id !== '');

    if (idArray.some(id => isNaN(id))) {
      return res.status(400).json({ error: 'Program_Id must contain valid numeric IDs' });
    }

    const idString = idArray.join(',');

    // Call stored procedure (which now expects @Program_Ids)
    const result = await prisma.$queryRawUnsafe(`
      EXEC dbo.Get_Program_Details @Program_Ids = '${idString}'
    `);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Program details not found' });
    }

    // If only one ID was passed, return a single object (to match old behavior)
    if (idArray.length === 1) {
      return res.status(200).json(result[0]);
    }

    // If multiple IDs, return all results as an array
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching program details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
