"use client";
import { useState } from "react";
import { useEffect } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
export default function TrainingProgramSelector() {
  const [trainingName, setTrainingName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleTrainingChange = async (e) => {
    const value = e.target.value;
    setTrainingName(value);
    setPrograms([]);

    if (!value) return;

    setLoading(true);

    try {
      const response = await fetch("/api/get_programs_by_training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingName: value }),
      });

      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
const handleExcelExport = () => {
  // Prepare data for Excel
  const excelData = programs.map((program, index) => ({
    "S.No": index + 1,
    "Program Name": program.Program_Name
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Programs");
  
  // Save file
  XLSX.writeFile(workbook, `${trainingName}_Standard_Programs.xlsx`);
};
  const handlePrint = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");

    const doc = new jsPDF("portrait", "mm", "a4");
    const programsPerPage = 30;
    const totalPages = Math.ceil(programs.length / programsPerPage);

    for (let pageIndex = 0; pageIndex < programs.length; pageIndex += programsPerPage) {
      const chunk = programs.slice(pageIndex, pageIndex + programsPerPage);
      const currentPage = Math.floor(pageIndex / programsPerPage) + 1;

      // Create hidden wrapper
      const wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.top = "-10000px";
      wrapper.style.left = "0";
      wrapper.style.padding = "20px";
      wrapper.style.width = "210mm";
      wrapper.style.backgroundColor = "white";
      wrapper.style.height = "auto";

      // Create title only for first page
      if (pageIndex === 0) {
        const title = document.createElement("h1");
        title.textContent = "Standard Programs";
        title.style.textAlign = "center";
        title.style.fontSize = "24px";
        title.style.fontWeight = "bold";
        title.style.marginBottom = "20px";
        title.style.fontFamily = "Arial, sans-serif";
        title.style.color = "black";
        wrapper.appendChild(title);
      }

      // Create table
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontFamily = "Arial, sans-serif";
      table.style.border = "0.5px solid #999";

      // Table header - only for first page
      if (pageIndex === 0) {
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.style.backgroundColor = "#93cddd";
        
        const th1 = document.createElement("th");
        th1.textContent = "S.No";
        th1.style.border = "0.5px solid #999";
        th1.style.padding = "8px";
        th1.style.textAlign = "center";
        th1.style.fontSize = "12px";
        th1.style.fontWeight = "bold";
        th1.style.width = "80px";
        th1.style.color = "black";
        
        const th2 = document.createElement("th");
        th2.textContent = "Program Name";
        th2.style.border = "0.5px solid #999";
        th2.style.padding = "8px";
        th2.style.textAlign = "center";
        th2.style.fontSize = "12px";
        th2.style.fontWeight = "bold";
        th2.style.color = "black";
        
        headerRow.appendChild(th1);
        headerRow.appendChild(th2);
        thead.appendChild(headerRow);
        table.appendChild(thead);
      }

      // Table body
      const tbody = document.createElement("tbody");
      chunk.forEach((item, index) => {
        const row = document.createElement("tr");
        
        const td1 = document.createElement("td");
        td1.textContent = pageIndex + index + 1;
        td1.style.border = "0.5px solid #999";
        td1.style.padding = "8px";
        td1.style.textAlign = "center";
        td1.style.fontSize = "11px";
        td1.style.color = "black";
        td1.style.fontFamily = "Arial, sans-serif";
        
        const td2 = document.createElement("td");
        td2.textContent = item.Program_Name;
        td2.style.border = "0.5px solid #999";
        td2.style.padding = "8px 10px";
        td2.style.fontSize = "11px";
        td2.style.color = "black";
        td2.style.textAlign = "left";
        td2.style.fontFamily = "Arial, sans-serif";
        td2.style.whiteSpace = "normal";
        td2.style.wordWrap = "break-word";
        
        row.appendChild(td1);
        row.appendChild(td2);
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      wrapper.appendChild(table);
      document.body.appendChild(wrapper);

      // Convert to canvas
      const canvas = await html2canvas(wrapper, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");

      if (pageIndex > 0) doc.addPage();

      // Only add header text and metadata on first page
      if (pageIndex === 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        // doc.text("Standard Programs", 10, 10);

        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Training: ${trainingName}`, pageWidth - 10, 10, { align: "right" });

        doc.setFontSize(8);
        doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 10, 15, { align: "right" });
      }

      // Calculate dimensions to fit A4
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF - adjust Y position based on page
      const imageY = pageIndex === 0 ? 20 : 10;
      doc.addImage(imgData, "PNG", 10, imageY, imgWidth, imgHeight);

      // Add footer only on last page
      if (currentPage === totalPages) {
        const footerY = imageY + imgHeight + 10;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");

        doc.text(
          "Greentech Industries (India) Pvt. Ltd @ HR 25.12.2025 By Syam Prasad",
          doc.internal.pageSize.getWidth() / 2,
          footerY,
          { align: "center" }
        );

       
      }

      // Clean up
      document.body.removeChild(wrapper);
    }

    // Save PDF
    doc.save(`${trainingName}_Standard_Programs.pdf`);
  };

  // Calculate how many rows per column
  const itemsPerColumn = Math.ceil(programs.length / 3);

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center gap-6">
          <p className="font-semibold">Standard Programs</p>
        </div>
        {programs.length > 0 && (
            <>
            <div className="flex ">
            <button
  onClick={handleExcelExport}
    className="bg-white text-sky-600 px-2 py-1.5 rounded text-sm font-semibold hover:bg-sky-50 transition-colors flex items-center gap-2 mr-1"
>
  <FaFileExcel className="w-4 h-4"/>
</button>
          <button
            onClick={handlePrint}
            className="bg-white text-sky-600 px-2 py-1.5 rounded text-sm font-semibold hover:bg-sky-50 transition-colors flex items-center gap-2"
          >
         <FaFilePdf className="w-4 h-4"/>
          </button>
          </div>
          </>
        )}
      </div>

      {/* Training Dropdown */}
      <div className="flex-shrink-0 w-48 mt-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Training Name
        </label>
        <select
          value={trainingName}
          onChange={handleTrainingChange}
          className="w-full bg-sky-50 border border-sky-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          <option value="">Select Training</option>
          <option value="IATF">IATF</option>
          <option value="HSE">HSE</option>
        </select>
      </div>

      {/* Programs Table - Screen View (3 columns) */}
      {trainingName && (
        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && programs.length === 0 && (
            <p className="text-gray-500 text-xs py-4">No programs found</p>
          )}

          {!loading && programs.length > 0 && (
            <table className="w-full border-collapse mb-9">
              <thead>
                <tr className="bg-sky-300 text-white">
                  <th className="border border-sky-400 px-2 py-1.5 text-center text-xs font-semibold" colSpan="6">
                    Program Names
                  </th>
                </tr>
              </thead>
              <tbody>
              {Array.from({ length: itemsPerColumn }).map((_, rowIndex) => (
  <tr key={rowIndex} className="hover:bg-sky-50 transition-colors">
    {/* Column 1 - only render if data exists */}
    {programs[rowIndex] && (
      <>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-center bg-sky-100 font-semibold text-sky-700">
          {rowIndex + 1}
        </td>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-gray-800">
          {programs[rowIndex].Program_Name}
        </td>
      </>
    )}

    {/* Column 2 - only render if data exists */}
    {programs[rowIndex + itemsPerColumn] && (
      <>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-center bg-sky-100 font-semibold text-sky-700">
          {rowIndex + itemsPerColumn + 1}
        </td>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-gray-800">
          {programs[rowIndex + itemsPerColumn].Program_Name}
        </td>
      </>
    )}

    {/* Column 3 - only render if data exists */}
    {programs[rowIndex + itemsPerColumn * 2] && (
      <>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-center bg-sky-100 font-semibold text-sky-700">
          {rowIndex + itemsPerColumn * 2 + 1}
        </td>
        <td className="border border-sky-200 px-2 py-1.5 text-xs text-gray-800">
          {programs[rowIndex + itemsPerColumn * 2].Program_Name}
        </td>
      </>
    )}
  </tr>
))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}