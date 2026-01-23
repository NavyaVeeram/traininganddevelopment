import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function toSafeString(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  } else if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return value;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      let {
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
        CreatedBy,
        UpdatedBy,
        For, // 👈 Now can be SELF, COMN, WOMEN
      } = req.body;

      // Convert values safely
      Training_Name = toSafeString(Training_Name);
      Department = toSafeString(Department);
      Section = toSafeString(Section);
      Program_Name = toSafeString(Program_Name);
      Train_Mode = toSafeString(Train_Mode);
      Train_Purpose = toSafeString(Train_Purpose);
      Persons = toSafeString(Persons);
      Req_Months = toSafeString(Req_Months);
      CreatedBy = toSafeString(CreatedBy);
      UpdatedBy = toSafeString(UpdatedBy);
      For = toSafeString(For);

      // Call stored procedure
      const result = await prisma.$queryRaw`
        EXEC [dbo].[Insert_TrainingData] 
          @Training_Name = ${Training_Name}, 
          @Year_No = ${Year_No}, 
          @Department = ${Department}, 
          @Section = ${Section},
          @Program_Name = ${Program_Name}, 
          @Train_Mode = ${Train_Mode}, 
          @Train_Purpose = ${Train_Purpose}, 
          @Persons = ${Persons}, 
          @No_Hrs = ${No_Hrs}, 
          @No_Times = ${No_Times}, 
          @Req_Months = ${Req_Months}, 
          @Evaluation_Period = ${Evaluation_Period}, 
          @CreatedBy = ${CreatedBy},
          @UpdatedBy = ${UpdatedBy},
          @For = ${For} -- 👈 NEW
      `;

      res.status(200).json({ message: "Data inserted successfully", result });
    } catch (error) {
      console.error("Error executing stored procedure:", error);
      res.status(500).json({
        message: "Failed to insert data",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
