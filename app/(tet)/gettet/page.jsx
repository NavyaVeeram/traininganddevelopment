"use client"
import React from 'react'
import { useState,useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useSearchParams } from "next/navigation";
import { FaPrint, FaSearch } from "react-icons/fa";
const TetReports = () => {
  const searchParams = useSearchParams();
  const programId = searchParams.get("id"); // `id` represents the Program_Id

  async function generatePdfForEmployees(programId) {
    const templatePath = '/Training_Effect_Tracing_Form.pdf';
    const label = 'Training_Effectiveness_Filtered_Employees.pdf';
    const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  
    // Fetch data from API for PDF generation
    const apiUrl = `/api/get_tet_form_emp_details_for_print?programId=${programId}`;
    let employees = [];
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        employees = await response.json();
      } else {
        alert("Failed to fetch employee data for PDF.");
        return;
      }
    } catch (error) {
      alert("Error fetching employee data for PDF.");
      return;
    }
  
    if (employees.length === 0) {
      alert("No employee data available for PDF.");
      return;
    }
  
    for (const emp of employees) {
      const templatePdf = await PDFDocument.load(templateBytes);
      const copiedPages = await mergedPdf.copyPages(templatePdf, templatePdf.getPageIndices());
  
      copiedPages.forEach((page, index) => {
        const height = page.getSize().height;
  
        if (index === 0) {
          // Customize on first page
          page.drawText(emp.EmployeeId || '', {
            x: 170,
            y: height - 55,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Username || '', {
            x: 170,
            y: height - 75,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Designation || '', {
            x: 170,
            y: height - 98,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Section || '', {
            x: 170,
            y: height - 118,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
          page.drawText(emp.Department || '', {
            x: 170,
            y: height - 140,
            size: 8,
            font,
            color: rgb(0, 0, 0),
          });
        }
  
        mergedPdf.addPage(page);
      });
    }
  
    const finalPdfBytes = await mergedPdf.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = label;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  useEffect(() => {
    if (programId) {
      setLoading(true);
      fetchProgramData();
    }
  }, [programId]);
  return (
    <div>
            <button type="button"
      onClick={() => generatePdfForEmployees(programId)}
      className="flex items-center justify-end bg-gray-600 text-white px-4 py-2 rounded-sm hover:bg-gray-900 transition"
    >
      <FaPrint />
    </button>
    </div>
  )
}

export default TetReports
