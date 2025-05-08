// pages/api/review.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    Program_Id, EmployeeId,
    Q_1, Q_2, Q_3, Q_4, Q_5,
    Q_6, Q_7, Q_8, Q_9, Q_10,
    Overall, Percentage,
    CreatedBy
  } = req.body;

  try {
    const result = await prisma.$queryRawUnsafe(
      `EXEC [dbo].[sp_Post_Tet_Form_Review]
        @Program_Id = ${parseInt(Program_Id)},
        @EmployeeId = '${EmployeeId}',
        @Q_1 = ${parseInt(Q_1)},
        @Q_2 = ${parseInt(Q_2)},
        @Q_3 = ${parseInt(Q_3)},
        @Q_4 = ${parseInt(Q_4)},
        @Q_5 = ${parseInt(Q_5)},
        @Q_6 = ${parseInt(Q_6)},
        @Q_7 = ${parseInt(Q_7)},
        @Q_8 = ${parseInt(Q_8)},
        @Q_9 = ${parseInt(Q_9)},
        @Q_10 = ${parseInt(Q_10)},
        @Overall = ${parseInt(Overall)},
        @Percentage = ${parseInt(Percentage)},
        @CreatedBy = '${CreatedBy}'`
    );

    res.status(200).json({ message: result[0]?.Result ?? 'No response' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
}
