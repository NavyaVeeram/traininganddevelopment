import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { year, training_name, EmployeeId } = req.query;

    if (!year) {
      return res.status(400).json({ message: "Year is required" });
    }

    try {
      const employeeDetails = await prisma.$queryRaw`
        EXEC [dbo].[Get_TET_Form_Data] @Year_No=${parseInt(year)}, @Training_name=${training_name || ''}, @EmployeeId=${EmployeeId || ''}
      `;

      if (!employeeDetails || employeeDetails.length === 0) {
        return res.status(404).json({ message: "Details not found" });
      }

      // Process data to add date restriction logic
      const processedData = employeeDetails.map(item => {
        const evaluationDate = item.Evaluation_Date ? new Date(item.Evaluation_Date) : null;
        const currentDate = new Date();
        
        let isViewReportEnabled = false;
        let viewReportStartDate = null;
        let viewReportEndDate = null;

        if (evaluationDate) {
          // Calculate 15 days before evaluation date
          viewReportStartDate = new Date(evaluationDate);
          viewReportStartDate.setDate(evaluationDate.getDate() - 15);
          
          viewReportEndDate = new Date(evaluationDate);
          
          // Check if current date is within the valid range
          isViewReportEnabled = currentDate >= viewReportStartDate && currentDate <= viewReportEndDate;
        }

        return {
          ...item,
          isViewReportEnabled,
          viewReportStartDate: viewReportStartDate?.toISOString(),
          viewReportEndDate: viewReportEndDate?.toISOString(),
          currentDate: currentDate.toISOString()
        };
      });

      return res.status(200).json(processedData);

    } catch (error) {
      console.error("Error fetching details", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
