"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

export default function GenerateSessions() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [trainingName, setTrainingName] = useState("");
  const [programOptions, setProgramOptions] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMonthYearChange = (date) => {
    setSelectedDate(date);
    setSelectedProgram(null);
    setProgramOptions([]);
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedDate || !trainingName) return;

      setLoading(true);
      try {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        const res = await fetch(
          `/api/get_training_attendance_dropdown?month=${month}&year=${year}&Training_Name=${trainingName}`
        );
        const data = await res.json();

if (res.ok) {
  const options = data.map(item => ({
    value: item.Value,         // keep Value for internal usage if needed
    label: item.Text,          // dropdown display
    programName: item.Program_Name, // 👈 capture Program_Name separately
  }));

  setProgramOptions(options);
  setSelectedProgram(null);
}
 else {
          setMessage(data.error || "Failed to fetch programs");
        }
      } catch (err) {
        setMessage("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [selectedDate, trainingName]);

const handleSubmit = async (e) => {
  e.preventDefault();

if (!selectedProgram || session === "" || isNaN(session)) {
  setMessage("Please select a program and enter valid sessions");
  return;
}
  setLoading(true);
  setMessage("");

  try {
const response = await fetch("/api/generate_sessions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
body: JSON.stringify({
    Program_Name: selectedProgram?.programName, // 👈 now sending Program_Name
    Session: parseInt(session, 10),
  
})

});

    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
    } else {
      setMessage(data.error || "Something went wrong");
    }
  } catch (error) {
    setMessage("Error: " + error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
          <div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">
        <p className="font-semibold">Generate Sessions for Program</p>
      </div>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[700px] shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Row - Year, Category, Program */}
            <div className="grid grid-cols-3 gap-4">
              {/* Year */}
              <div>
                <label className="block font-medium mb-1">Year/Month</label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleMonthYearChange}
                  dateFormat="MMM-yyyy"
                  showMonthYearPicker
                  placeholderText="Select Month and Year"
                  className="w-full pl-4 pr-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Training Name */}
              <div>
                <label className="block font-medium mb-1">Category</label>
                <Select
                  value={
                   trainingName
    ? {
        value: trainingName,
        label: trainingName === "IATF"
          ? "IATF (International Automotive Task Force)"
          : "HSE (Health, Safety, and Environment)",
      }
                      : null
                  }
                  onChange={(opt) => setTrainingName(opt.value)}
                  options={[
                    {
                      value: "IATF",
                      label: "IATF (International Automotive Task Force)",
                    },
                    {
                      value: "HSE",
                      label: "HSE (Health, Safety, and Environment)",
                    },
                  ]}
                  placeholder="Select Category"
                  isSearchable={false}
                  className="cursor-pointer rounded-lg"
                  
              styles={{
                control: (provided) => ({
                  ...provided,
                  padding: "2px",
                  borderColor: "#D1D5DB", // Tailwind sky-500
                  borderRadius: "0.5rem", // rounded-lg
                  cursor: "pointer",
                  minHeight: "38px",
                }),
                option: (provided, state) => ({
                  ...provided,
                  cursor: "pointer",
                  backgroundColor: state.isFocused ? "#E0F2FE" : "white", // Tailwind sky-100
                  color: "black", 
                }),
              }}
                />
              </div>

<div>
  <label className="block font-medium mb-1">Program</label>
<Select
  value={selectedProgram}
  onChange={setSelectedProgram}
  options={programOptions}
  placeholder={loading ? "Loading programs..." : "Select Program"}
  isDisabled={!selectedDate || !trainingName || loading}
  className="cursor-pointer"

          styles={{
                  control: (base, state) => ({
                    ...base,
                    cursor: 'pointer',
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(59, 130, 246, 0.5)"
                      : "none",
                    borderRadius: "0.5rem",
                    minHeight: "2rem",
                    display: "flex",
                    alignItems: "center",
                  }),
                  option: (base) => ({
                    ...base,
                    cursor: 'pointer',
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 50,
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
/>



</div>
      {/* Session Count */}
            <div>
              <label className="block font-medium mb-1">No of Sessions</label>
           <input
  type="number"
   min="1"
  value={session}
onChange={e => {
  const val = e.target.value;
  setSession(val === "" ? "" : parseInt(val, 10));
}}
  placeholder="Enter Session Count"
  required
  className="w-full border border-gray-300 rounded-lg px-3 py-2"
/>

            </div>

            </div>

      
            {/* Submit Button */}
            <Button type="submit" className="bg-sky-400" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate"}
            </Button>
          </form>

          {message && (
            <p className="mt-4 text-center font-medium text-sm text-green-600">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
