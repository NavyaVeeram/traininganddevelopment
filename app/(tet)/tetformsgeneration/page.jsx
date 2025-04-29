'use client';

import React from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const Page = () => {
  const employees = [
    { empid: '240212', empname: 'Viswanath Reddy',desig:'Manager' },
    { empid: '240444', empname: 'Bhargavi',desig:'Engineer' },
    { empid: '250010', empname: 'Navya',desig:'GET' },
    // Add more employees here
  ];

  const generatePDFByTemplate = async (templatePath, label, drawFn, drawOnPageIndex = 0) => {
    const templateBytes = await fetch(templatePath).then(res => res.arrayBuffer());
    const mergedPdf = await PDFDocument.create();
    const font = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    for (const emp of employees) {
      const templatePdf = await PDFDocument.load(templateBytes);
      const copiedPages = await mergedPdf.copyPages(templatePdf, templatePdf.getPageIndices());

      copiedPages.forEach((page, index) => {
        const height = page.getSize().height;

        if (index === drawOnPageIndex) {
          drawFn(page, height, font, emp); // Customize only on specific page
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
  };

  const drawTemplateA = (page, height, font, emp) => {
    page.drawText(emp.empid, {
      x: 170,
      y: height - 55,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(emp.empname, {
      x: 170,
      y: height - 75,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  const drawTemplateB = (page, height, font, emp) => {
    page.drawText(emp.empname, {
      x: 130,
      y: height - 68,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(emp.empid, {
      x: 115,
      y: height - 102,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
    page.drawText(emp.desig, {
      x: 115,
      y: height - 138,
      size: 8,
      font,
      color: rgb(0, 0, 0),
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {/* Template A Button */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Training Effectiveness Tracing Form
          </h2>
          <button
            onClick={() =>
              generatePDFByTemplate(
                '/Training_Effect_Tracing_Form.pdf',
                'Training_Effectiveness_All_Employees.pdf',
                drawTemplateA
              )
            }
            className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            <FaFilePdf className="mr-2" />
            Download Template A (All Employees)
          </button>
        </div>

        {/* Template B Button */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Training Report (శిక్షణ నివేదిక)
          </h2>
          <button
            onClick={() =>
              generatePDFByTemplate(
                '/training_report.pdf',
                'Training_Report_All_Employees.pdf',
                drawTemplateB,
                0 // only customize the first page
              )
            }
            className="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            <FaFilePdf className="mr-2" />
            Download Template B (All Employees)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
