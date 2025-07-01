import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { programId,EmployeeId } = req.query;

    try {
      const employees = await prisma.$queryRaw`
        EXEC dbo.Get_Tet_Form_User_Dropdown_Res_Person @ProgramId = ${programId},@EmployeeId = ${EmployeeId}
      `;
      
      res.status(200).json(employees);
    } catch (error) {
      console.error("Error fetching employees: ", error);
      res.status(500).json({ error: 'Error fetching data' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}