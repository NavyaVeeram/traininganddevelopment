import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
if (req.method === 'POST') {
const {
Train_Mode,
Persons,
Evaluation_Period,
Training_Budget,
Schedule_Type,
Trainer,
Venue,
No_Hrs,
Training_Date,
CreatedBy,
EmployeeIds
} = req.body;

const { Program_Id } = req.query;

// Debug: log Program_Id and request body to check if everything is being passed correctly
// console.log('Received Program_Id:', Program_Id);
// console.log('Request Body:', req.body);

// Validation checks for required fields
if (
!Train_Mode ||
!Persons ||
!No_Hrs ||
!Evaluation_Period ||
!Trainer ||
!Venue ||
!Array.isArray(EmployeeIds) ||
EmployeeIds.length === 0
) {
return res.status(400).json({ message: 'Missing or invalid input.' });
}

// Ensure Program_Id is a valid integer
const programIdInt = parseInt(Program_Id, 10);
if (isNaN(programIdInt)) {
return res.status(400).json({ message: 'Program_Id must be a valid number' });
}

try {
const updateResult = await prisma.$queryRaw`
EXEC [dbo].[Update_TrainingAtt_Entry]
@Program_Id = ${programIdInt},
@Train_Mode = ${Train_Mode},
@Persons = ${Persons},
@No_Hrs = ${No_Hrs},
@Training_Budget = ${Training_Budget},
@Training_Date = ${Training_Date || null},
@Evaluation_Period = ${Evaluation_Period},
@Schedule_Type = ${Schedule_Type},
@Trainer = ${Trainer},
@Venue = ${Venue},
@CreatedBy = ${CreatedBy}
`;

console.log('Update Training Result:', updateResult);

 //const updateMessage = updateResult?.[0]?.Result;

// if (updateMessage !== 'Updated Successfully.') {
// return res.status(200).json({
// success: false,
// message: updateMessage || 'Failed to update training record.'
// });
// }

// 2️⃣ If the update succeeded, proceed to assign employees
const employeeCsv = EmployeeIds.join(',');

const result = await prisma.$queryRaw`
EXEC [dbo].[Insert_Emp_Att_Program_Wise]
@Program_Id = ${programIdInt},
@EmployeeIds = ${employeeCsv},
@CreatedBy = ${CreatedBy}
`;

res.status(200).json({ message: result[0]?.Result || 'Unknown error' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Enter all fields.' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}