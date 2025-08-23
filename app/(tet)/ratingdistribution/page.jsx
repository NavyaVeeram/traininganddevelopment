"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import { Mona_Sans } from "next/font/google";
import BackButton from "@/components/BackButton";

const trainingOptions = [
  { value: "IATF", label: "IATF (International Automotive Task Force)" },
  { value: "HSE", label: "HSE (Health, Safety, and Environment)" },
];

const ratingLabels = {
  1: "Poor",
  2: "Average",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const chartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RatingDistributionPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [selectedTrainingName, setSelectedTrainingName] = useState(null);
  const [programNames, setProgramNames] = useState([]);
  const [selectedProgramName, setSelectedProgramName] = useState(null);
  const [programDetails, setProgramDetails] = useState(null);

  // Helper function to get program name from program ID
  const getProgramNameById = (programId) => {
    const program = programNames.find((p) => p.id === programId);
    return program ? program.name : "";
  };

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    const fetchRatingDistribution = async () => {
      try {
        if (!selectedMonthYear || !selectedTrainingName || !selectedProgramName) {
          setData([]);
          setError(null);
          setLoading(false);
          return;
        }

        let url = "/api/get_rating_distribution";
        const params = new URLSearchParams();

        params.append("Year_No", selectedMonthYear.getFullYear());
        params.append("Month", monthNames[selectedMonthYear.getMonth()]);
        params.append("Training_Name", selectedTrainingName.value);
        params.append("Program_Id", selectedProgramName.value);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch rating distribution data");
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRatingDistribution();
  }, [selectedMonthYear, selectedTrainingName, selectedProgramName]);

  useEffect(() => {
    const fetchProgramNames = async () => {
      if (selectedMonthYear) {
        try {
          const trainingName = selectedTrainingName ? selectedTrainingName.value : "IATF";
          const response = await fetch(
            `/api/get_program_name_dropdown?Year_No=${selectedMonthYear.getFullYear()}&Training_Name=${trainingName}&Month=${monthNames[selectedMonthYear.getMonth()]}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch program names");
          }
          const result = await response.json();
          setProgramNames(result);

          if (selectedProgramName) {
            const exists = result.find(p => p.id === selectedProgramName.value);
            if (!exists) {
              setSelectedProgramName(null);
            }
          }
        } catch (err) {
          console.error(err);
          setProgramNames([]);
          setSelectedProgramName(null);
        }
      } else {
        setProgramNames([]);
        setSelectedProgramName(null);
      }
    };

    fetchProgramNames();
  }, [selectedMonthYear, selectedTrainingName]);

  useEffect(() => {
    const fetchInitialProgramNames = async () => {
      try {
        const now = new Date();
        const response = await fetch(
          `/api/get_program_name_dropdown?Year_No=${now.getFullYear()}&Training_Name=IATF&Month=${monthNames[now.getMonth()]}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch program names");
        }
        const result = await response.json();
        setProgramNames(result);
      } catch (err) {
        console.error(err);
        setProgramNames([]);
      }
    };

    fetchInitialProgramNames();
  }, []);

  useEffect(() => {
    const fetchRatingCounts = async () => {
      try {
        if (!selectedMonthYear || !selectedTrainingName || !selectedProgramName) {
          setChartData([]);
          setChartError(null);
          setChartLoading(false);
          setProgramDetails(null);
          return;
        }

        const params = new URLSearchParams();
        params.append("Year_No", selectedMonthYear.getFullYear());
        params.append("Month", monthNames[selectedMonthYear.getMonth()]);
        params.append("Training_Name", selectedTrainingName.value);
        params.append("Program_Id", selectedProgramName.value);

        const response = await fetch(`/api/get_rating_counts?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rating counts");
        }
        const data = await response.json();

        const formattedData = data.map((item) => ({
          rating: ratingLabels[item.Rating] || `Rating ${item.Rating}`,
          count: item.RatingCount,
        }));

        setChartData(formattedData);
        setChartError(null);

        const detailsResponse = await fetch(`/api/get_program_details?Program_Id=${selectedProgramName.value}`);
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch program details");
        }
        const detailsData = await detailsResponse.json();
        setProgramDetails(detailsData);
      } catch (err) {
        setChartError(err.message || String(err));
        setProgramDetails(null);
      } finally {
        setChartLoading(false);
      }
    };

    fetchRatingCounts();
  }, [selectedMonthYear, selectedTrainingName, selectedProgramName]);

  if (loading || chartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading rating distribution...</p>
      </div>
    );
  }

  if (error || chartError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-semibold">Error: {error || chartError}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
      <div className="bg-sky-400 text-white p-2 ">
        <h2 className="font-semibold"> Training Effectiveness Evaluation Summary</h2>
      </div>
      <BackButton/>
      <div className="mb-4 flex space-x-4 ">
        <div className="flex mt-3 items-center space-x-1">
          <label className="block mb-1 font-semibold">Select Month and Year:</label>
          <DatePicker
            selected={selectedMonthYear}
            onChange={(date) => setSelectedMonthYear(date)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
            placeholderText="Select Month and Year"
            className="p-2 border border-gray-300 rounded-lg"
            calendarClassName="z-50"
            popperPlacement="top-start"
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: "viewport",
              },
            }}
          />
        </div>

        <div className="flex mt-3 items-center space-x-1">
          <label className="block mb-1 font-semibold">Select Training:</label>
          <Select
            value={selectedTrainingName}
            isDisabled = {!selectedMonthYear}
            onChange={(newValue) => {
              setSelectedTrainingName(newValue);
              setSelectedProgramName(null);
            }}
            options={trainingOptions}
            isSearchable={false}
            className="w-[400px]"
            classNamePrefix="react-select"
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

        <div className="flex mt-3 items-center space-x-1">
          <label className="block mb-1 font-semibold">Select Program Name:</label>
          <Select
            value={selectedProgramName && programNames.some(program => program.id === selectedProgramName.value) ? { value: selectedProgramName.value, label: programNames.find(program => program.id === selectedProgramName.value)?.name } : null}
            onChange={setSelectedProgramName}
            options={programNames.map(program => ({ value: program.id, label: program.name }))}
            isSearchable={true}
            isDisabled = {!selectedMonthYear || !selectedTrainingName }
            className="w-[400px]"
            classNamePrefix="react-select"
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
                backgroundColor: state.isSelected ? "#BEE3F8" : (state.isFocused ? "#E0F2FE" : "white"),
                color: "black",
              }),
            }}
            placeholder="Select Program Name"
          />
        </div>
      </div>
      {data.length > 0 ? (
        <div className="flex flex-col md:flex-row items-stretch justify-around  bg-white rounded  mt-6">
          <div className="overflow-x-auto">
            {data.length > 0 && (
              <>
                <div className="overflow-x-auto  w-full bg-white">
                  <table className="min-w-full text-left text-sm">
                    <tbody>
                      <tr>
                        <th className="border px-3 py-2 bg-gray-100 w-40">Program Name</th>
                        <td className="border px-3 py-2 w-40">{programDetails?.Program_Name || "N/A"}</td>
                        <th className="border px-3 py-2 bg-gray-100 w-40">Training Date</th>
                        <td className="border px-3 py-2 w-40">{programDetails?.Training_Date ? programDetails.Training_Date : "N/A"}</td>
                      </tr>
                      <tr>
                        <th className="border px-3 py-2 bg-gray-100 w-40">Trainer</th>
                        <td className="border px-3 py-2 w-40">{programDetails?.Trainer || "N/A"}</td>
                        <th className="border px-3 py-2 bg-gray-100 w-40">Persons</th>
                        <td className="border px-3 py-2 w-40">{programDetails?.Persons || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th rowSpan={2} className="border border-gray-300 px-4 py-2 text-left">
                    S.No
                  </th>
                  <th rowSpan={2} className="border border-gray-300 px-4 py-2 text-left">
                    Parameters
                  </th>
                  <th colSpan={5} className="border border-gray-300 px-4 py-2 text-center">
                    Count Summary
                  </th>
                  <th colSpan={5} className="border border-gray-300 px-4 py-2 text-center">% Summary</th>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-center">1</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">2</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">3</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">4</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">5</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">1</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">2</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">3</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">4</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">5</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{row.Question_Text}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Count_1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Count_2}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Count_3}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Count_4}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Count_5}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Percent_1}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Percent_2}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Percent_3}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Percent_4}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{row.Percent_5}</td>
                  </tr>
                ))}
                <tr className="bg-gray-200 font-semibold">
                  <td colSpan={2} className="border border-gray-300 px-4 py-2 text-left">
                    Parameters Rating
                  </td>
                  <td colSpan={10} className="border border-gray-300 px-4 py-2 text-center">
                    1-Poor&nbsp;&nbsp; 2-Average&nbsp;&nbsp; 3-Good&nbsp;&nbsp; 4-Very Good&nbsp;&nbsp; 5-Excellent
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-18">
            <Card style={{ width: 550, height: 450 }}>
              <CardHeader>
                <CardTitle className="text-sky-600">{programDetails?.Program_Name || "N/A"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    width={400}
                    height={300}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="rating" tickLine={false} tickMargin={10} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="count"
                      fill="var(--chart-1)"
                      radius={8}
                      label={({ x, y, width, value }) => {
                        const total = chartData.reduce((sum, item) => sum + item.count, 0);
                        const percent = total === 0 ? "0%" : ((value / total) * 100).toFixed(0) + "%";
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            fill="#000"
                            textAnchor="middle"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {percent}
                          </text>
                        );
                      }}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                  Showing rating counts from the latest data
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        (!selectedMonthYear && !selectedTrainingName && !selectedProgramName) && data.length > 0 &&(
          <div className="text-center text-gray-500 mt-6 font-semibold">No records found</div>
        )
      )}
    </div>
  );
};

export default RatingDistributionPage;
