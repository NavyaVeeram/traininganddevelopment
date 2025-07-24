import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { programId, resPerson, employeeIds } = req.body;

    if (!programId || !resPerson || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid parameters' });
    }

    try {
      // Prepare the EmployeeIds as a table variable in SQL
      const employeeIdsTable = employeeIds.map(id => `('${id}')`).join(',');

      const query = `
        DECLARE @EmployeeIds dbo.EmployeeIdList;
        INSERT INTO @EmployeeIds (EmployeeId) VALUES ${employeeIdsTable};

        EXEC dbo.Update_Res_Person @ProgramId = ${programId}, @ResPerson = '${resPerson}', @EmployeeIds = @EmployeeIds;
      `;

      await prisma.$executeRawUnsafe(query);

      res.status(200).json({ message: 'Res_Person updated successfully' });
    } catch (error) {
      console.error('Error updating Res_Person:', error);
      res.status(500).json({ error: 'Failed to update Res_Person' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
