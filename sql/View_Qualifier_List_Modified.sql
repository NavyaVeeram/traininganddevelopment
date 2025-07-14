USE [HRModule]
GO
/****** Object:  StoredProcedure [dbo].[View_Qualifier_List_Modified]    Script Date: 7/11/2025 3:30:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[View_Qualifier_List_Modified]
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH DistinctDesig AS (
        SELECT 
            DesigCode, 
            DesigName,
            ROW_NUMBER() OVER (PARTITION BY DesigCode ORDER BY DesigName) AS rn
        FROM MISQA..Desig_master
    )
    
    SELECT 
        DesigCode,
        DesigName
    INTO #Temp_Desig_Master
    FROM DistinctDesig
    WHERE rn = 1;

    CREATE TABLE #Temp_Qualifier_List (
	Qual_Id INT,
        EmployeeId VARCHAR(50),
        Username VARCHAR(MAX),
        DOJ VARCHAR(20),
        Designation VARCHAR(50),
		Department VARCHAR(50),
        Section VARCHAR(50),
        Training_Name VARCHAR(50),
		Cert_Des VARCHAR(50),
        Certified BIT,
        Exp_5_Yr BIT,
        Exp_3_yr BIT,
        HOD_Rec BIT,
        Qualified BIT,
		IsActive BIT
    );

    INSERT INTO #Temp_Qualifier_List
    SELECT 
	Qual_Id,
        EM.EmpCode AS EmployeeId,
        EM.EmpName AS Username,
        FORMAT(EM.JoinDate, 'dd-MMM-yyyy') AS DOJ,
        TD.DesigName AS Designation,
		EM.DeptCode AS Department,
        DM.NSection AS Section,
        QT.Training_Name,
		QT.Cert_Des,
        QT.Certified,
        QT.Exp_5_Yr,
        QT.Exp_3_yr,
        QT.HOD_Rec,
        QT.Qualified,
		QT.IsActive
    FROM [HRModule].[dbo].[Qualified_Trainer_List] QT
    INNER JOIN MISQA..Employee_Master EM ON EM.EmpCode = QT.EmployeeId
    LEFT JOIN MISQA..Dept_Master DM ON DM.NSecCode = EM.NSecCode
    INNER JOIN #Temp_Desig_Master TD ON TD.DesigCode = EM.DesigCode
    WHERE QT.Emp_Send=1 AND QT.HOS=1 AND QT.HOD=1 AND QT.HR_Res=1 AND QT.HR_HOD=1 AND QT.Email_Status = 1 AND QT.Qualified = 1;

    SELECT * FROM #Temp_Qualifier_List;

    DROP TABLE #Temp_Qualifier_List;
    DROP TABLE #Temp_Desig_Master;
END
