"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

export default function GenerateSessions() {
  // state
const [trainingName, setTrainingName] = useState("IATF"); // ✅ default to IATF
  const [selectedDate, setSelectedDate] = useState(new Date());
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
          const options = data.map((item) => ({
            value: item.Value,
            label: item.Text,
            programName: item.Program_Name,
          }));

          setProgramOptions(options);
          setSelectedProgram(null);
        } else {
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

    if (!selectedProgram || session === "") {
     alert("Please select a program and number of sessions");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Program_Name: selectedProgram?.programName,
          Session: parseInt(session, 10),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "Sessions generated successfully!");


        // Reset form
        setSelectedDate(new Date());
        setTrainingName("");
        setSelectedProgram(null);
        setSession("");
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
        <Card className="w-[850px] shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1 - Year and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Year/Month</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleMonthYearChange}
                    dateFormat="MMM-yyyy"
                    showMonthYearPicker
                    placeholderText="Select Month and Year"
                    className="w-[390px] pl-4 pr-4 py-2 text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Category</label>
           <Select
  value={
    trainingName
      ? {
          value: trainingName,
          label:
            trainingName === "IATF"
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
      borderColor: "#D1D5DB",
      borderRadius: "0.5rem",
      cursor: "pointer",
      minHeight: "38px",
    }),
    option: (provided, state) => ({
      ...provided,
      cursor: "pointer",
      backgroundColor: state.isFocused ? "#E0F2FE" : "white",
      color: "black",
    }),
  }}
/>

                </div>
              </div>

              {/* Row 2 - Program and Sessions */}
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block font-medium mb-1">No of Sessions</label>
                  <Select
                    value={session ? { value: session, label: session } : null}
                    onChange={(opt) => setSession(opt.value)}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: i + 1,
                      label: i + 1,
                    }))}
                    placeholder="Select Sessions"
                    className="cursor-pointer"
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
              </div>

              {/* Submit Button */}
              <Button type="submit" className="bg-sky-400" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}