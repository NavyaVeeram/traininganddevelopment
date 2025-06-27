"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const BLUE_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const GREEN_COLORS = ["#4ade80", "#166534", "#15803d", "#16a34a", "#22c55e"];

const Dashboard = () => {
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [typedUsername, setTypedUsername] = useState("");
  const intervalRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [iatfData, setIatfData] = useState([]);
  const [hseData, setHseData] = useState([]);
  const [iatfDeptData, setIatfDeptData] = useState([]);
  const [hseDeptData, setHseDeptData] = useState([]);
  const [monthWiseBudgetIatfData, setMonthWiseBudgetIatfData] = useState([]);

  // Helper function to fill missing months with zero data
  const fillMissingMonths = (data) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = new Map(data.map(d => [d.Req_Month, d]));
    return months.map(month => dataMap.get(month) || { Req_Month: month, Total: 0, Completed: 0 });
  };

  useEffect(() => {
    fetch(`/api/month_wise_programs_iatf?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setIatfData(data))
      .catch(() => setIatfData([]));

    fetch(`/api/month_wise_programs_hse?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setHseData(data))
      .catch(() => setHseData([]));

    fetch(`/api/dept_wise_programs_iatf?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setIatfDeptData(data))
      .catch(() => setIatfDeptData([]));

    fetch(`/api/dept_wise_programs_hse?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setHseDeptData(data))
      .catch(() => setHseDeptData([]));

    fetch(`/api/month_wise_budget?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setMonthWiseBudgetIatfData(data))
      .catch(() => setMonthWiseBudgetIatfData([]));
  }, [selectedYear]);


  const computeStats = (data) => {
    if (!data.length) return { total: 0, completed: 0, rate: 0 };
    const total = data.reduce((sum, d) => sum + (d.Total || 0), 0);
    const completed = data.reduce((sum, d) => sum + (d.Completed || 0), 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
  };

  const fillMissingMonthsBudget = (data) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = new Map(data.map(d => [d.Req_Month, d]));
    return months.map(month => dataMap.get(month) || { Req_Month: month, Training_Budget: 0, Actual_Budget: 0 });
  };

  const renderMonthWiseBudgetChart = (data, title) => {
    const chartData = data.map(d => ({
      Req_Month: d.Req_Month,
      Training_Budget: d.Training_Budget || 0,
      Actual_Budget: d.Actual_Budget || 0,
    }));

    return (
      <div className="rounded-xl px-4 py-3 bg-white shadow-md max-h-[400px] overflow-hidden">

        <h2 className="font-semibold text-gray-800 mb-4">{title}</h2>
        <ChartContainer
          config={{
            Req_Month: { label: "Month" },
            Training_Budget: { label: "Training Budget", color: "#3b82f6" },
            Actual_Budget: { label: "Actual Budget", color: "#2563eb" },
          }}
        > 
        <div className="w-[1000px] mx-auto ">
          <ResponsiveContainer width="100%" height={300}>
            
            <LineChart data={chartData} margin={{ left: 12, right: 12, top: 5, bottom: 5 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis
                dataKey="Req_Month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="rounded-md border bg-white p-3 text-sm shadow-md">
                      <p className="font-semibold mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{entry.name}:</span>
                          <span className="font-medium">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend />
              <Line
                dataKey="Training_Budget"
                type="monotone"
                stroke="#1d4ed8" 
                strokeWidth={3}
                dot={{ fill: "#1d4ed8", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#1d4ed8", strokeWidth: 2 }}
              />
              <Line
                dataKey="Actual_Budget"
                type="monotone"
                stroke="#166534" // Darker blue
                strokeWidth={3}
                dot={{ fill: "#166534", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#166534", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
    );
  };

  const iatfStats = computeStats(iatfData);
  const hseStats = computeStats(hseData);

  const renderBarChart = (data, title, stat, totalColor, completedColor, labelColor) => {
    const chartData = data.map((d) => ({
      Req_Month: d.Req_Month,
      Total: d.Total || 0,
      Completed: d.Completed || 0,
    }));

    return (
      <div key={title} className="rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <TrendingUp className="text-gray-500 w-5 h-5" />
            <h2 className="font-semibold text-gray-800">{title}</h2>
          </div>
          <span className={`text-sm font-medium ${labelColor}`}>
            Completion Rate: {stat.rate}%
          </span>
        </div>
        {data.length ? (
          <ChartContainer
            config={{
              Req_Month: { label: "Month" },
              Completed: { label: "Completed", color: completedColor },
              Total: { label: "Total", color: totalColor },
            }}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} barSize={32} stackOffset="sign">
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                <XAxis dataKey="Req_Month" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="rounded-md border bg-white p-3 text-sm shadow-md">
                        <p className="font-semibold mb-2">{label}</p>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span>{entry.name}:</span>
                            <span className="font-medium">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend content={({ payload }) => {
                  if (!payload) return null;
                  return (
                    <div className="flex gap-4">
                      {payload.map((entry, index) => (
                        <span key={`legend-item-${index}`} className="flex items-center gap-1 text-sm font-medium" style={{ color: entry.color }}>
                          <span className="inline-block w-3 h-3" style={{ backgroundColor: entry.color }}></span>
                          {entry.value}
                        </span>
                      ))}
                    </div>
                  );
                }} />
                <Bar dataKey="Total" fill={totalColor} stackId="a" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Completed" fill={completedColor} stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="text-center text-gray-400 py-16">
            <BookOpen className="mx-auto w-10 h-10 mb-2" />
            No data available.
          </div>
        )}
      </div>
    );
  };

  const renderPieChart = (data, title, colorSet, options = {}) => {
    const { titleAlignRight = false } = options;
    return (
      <div className={`flex flex-col xl:flex-row items-start justify-between gap-6 rounded-xl bg-white p-6 shadow ${titleAlignRight ? 'flex-row-reverse' : ''}`}>
        <div className="w-full xl:w-2/3">
          <h3 className={`text-lg  text-m font-medium text-gray-800 mb-4 ${titleAlignRight ? 'text-right' : ''}`}>
            {title}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const entry = payload[0];
                  return (
                    <div className="rounded-md border bg-white p-3 text-sm shadow-md">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: entry.payload.fill }}
                        />
                        <span>{entry.payload.Department}:</span>
                        <span className="font-medium">{entry.payload.Total_Programs}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={data}
                dataKey="Total_Programs"
                nameKey="Department"
                cx="50%"
                cy="50%"
                outerRadius={130}
                isAnimationActive
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorSet[index % colorSet.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-2 xl:mt-14 xl:ml-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm font-medium">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ backgroundColor: colorSet[index % colorSet.length] }}
              ></span>
              <span>{entry.Department}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-green-400 shadow rounded-lg p-4 flex items-left gap-3 border">
            <Calendar className="w-5 h-5 text-blue-700" />
            <DatePicker
              selected={new Date(selectedYear, 0, 1)}
              onChange={(d) => setSelectedYear(d.getFullYear())}
              showYearPicker
              dateFormat="yyyy"
              className="border px-3 py-1 rounded focus:outline-none bg-white text-blue-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "IATF Total", value: iatfStats.total, icon: <BookOpen className="w-8 h-8 text-white" />, bg: "bg-blue-400" },
            { label: "IATF Completed", value: iatfStats.completed, icon: <Target className="w-6 h-6 text-white" />, bg: "bg-blue-700" },
            { label: "HSE Total", value: hseStats.total, icon: <BookOpen className="w-8 h-8 text-white" />, bg: "bg-green-400" },
            { label: "HSE Completed", value: hseStats.completed, icon: <Target className="w-6 h-6 text-white" />, bg: "bg-green-700" },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className={`p-5 rounded-xl shadow-md flex justify-between items-center text-white ${bg}`}>
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              {icon}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
          {renderBarChart(fillMissingMonths(iatfData), "IATF Monthly Training", iatfStats, "#6cb0fc", "#1d4ed8", "text-blue-600")}
          {renderBarChart(fillMissingMonths(hseData), "HSE Monthly Training", hseStats, "#52eb87", "#15803d", "text-green-700")}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {renderPieChart(iatfDeptData, "IATF by Department", BLUE_COLORS)}
          {renderPieChart(hseDeptData, "HSE by Department", GREEN_COLORS)}
        </div>

        <div className="mt-20  max-w-7xl " >
          {renderMonthWiseBudgetChart(fillMissingMonthsBudget(monthWiseBudgetIatfData), "Training Cost ")}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;