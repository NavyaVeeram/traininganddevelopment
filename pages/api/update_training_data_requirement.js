import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      Program_Id,
      EmployeeId,
      Training_Name,
      Year_No,
      Department,
      Section,
      Program_Name,
      Train_Mode,
      Train_Purpose,
      Persons,
      No_Hrs,
      No_Times,
      Req_Months,
      Evaluation_Period,
      For: forValue
    } = req.body;

    console.log('Received data:', req.body);

    // Validation
    if (!Program_Id || !EmployeeId) {
      return res.status(400).json({ 
        message: 'Program_Id and EmployeeId are required' 
      });
    }

    // Parse and convert data types properly
    const parsedProgramId = parseInt(Program_Id);
    const parsedYearNo = Year_No ? parseInt(Year_No) : null;
    const parsedProgramName = Program_Name ? parseInt(Program_Name) : null;
    const parsedPersons = Persons ? parseInt(Persons) : null;
    const parsedNoHrs = No_Hrs ? parseFloat(No_Hrs) : null;
    const parsedNoTimes = No_Times ? parseInt(No_Times) : null;
    const parsedEvaluationPeriod = Evaluation_Period ? Evaluation_Period.toString() : null;

    // Determine WOMEN and COMN values based on For field
    let WOMEN = null;
    let COMN = null;
    
    if (forValue === 'WOMEN') {
      WOMEN = parsedPersons || 0;
      COMN = 0;
    } else if (forValue === 'COMN') {
      COMN = parsedPersons || 0;
      WOMEN = 0;
    } else if (forValue === 'SELF') {
      WOMEN = 0;
      COMN = 0;
    }

    console.log('Parsed values:', {
      parsedProgramId,
      parsedYearNo,
      parsedProgramName,
      parsedPersons,
      parsedNoHrs,
      parsedNoTimes,
      WOMEN,
      COMN
    });

    // Execute stored procedure using Prisma's raw query with proper type casting
    const result = await prisma.$queryRawUnsafe(`
      EXEC Update_TrainingData_By_Employee
        @Program_Id = ${parsedProgramId},
        @EmployeeId = '${EmployeeId}',
        ${Training_Name ? `@Training_Name = N'${Training_Name}',` : ''}
        ${parsedYearNo ? `@Year_No = ${parsedYearNo},` : ''}
        ${Department ? `@Department = '${Department}',` : ''}
        ${Section ? `@Section = N'${Section}',` : ''}
        ${parsedProgramName ? `@Program_Name = ${parsedProgramName},` : ''}
        ${Train_Mode ? `@Train_Mode = N'${Train_Mode}',` : ''}
        ${Train_Purpose ? `@Train_Purpose = N'${Train_Purpose.replace(/'/g, "''")}',` : ''}
        ${parsedPersons ? `@Persons = ${parsedPersons},` : ''}
        ${parsedNoHrs ? `@No_Hrs = ${parsedNoHrs},` : ''}
        ${parsedNoTimes ? `@No_Times = ${parsedNoTimes},` : ''}
        ${Req_Months ? `@Req_Months = N'${Req_Months}',` : ''}
        ${parsedEvaluationPeriod ? `@Evaluation_Period = N'${parsedEvaluationPeriod}',` : ''}
        ${WOMEN !== null ? `@WOMEN = ${WOMEN},` : ''}
        ${COMN !== null ? `@COMN = ${COMN}` : ''}
    `.replace(/,(\s*)$/, '$1')); // Remove trailing comma

    return res.status(200).json({
      message: 'Training record updated successfully',
      data: result && result.length > 0 ? result[0] : null
    });

  } catch (error) {
    console.error('Update API Error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to update training record',
      error: error.toString()
    });
  } finally {
    await prisma.$disconnect();
  }
}