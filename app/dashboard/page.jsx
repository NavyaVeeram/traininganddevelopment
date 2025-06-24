"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import {
  BookOpen,
  Target,
  Calendar,
  TrendingUp,
  Award,
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
} from "recharts";
import {
  ChartContainer,
} from "@/components/ui/chart";

const Dashboard = () => {
  const [department, setDepartment] = useState("");
  const [username, setUsername] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [typedUsername, setTypedUsername] = useState("");
  const intervalRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [iatfData, setIatfData] = useState([]);
  const [hseData, setHseData] = useState([]);

  useEffect(() => {
    const storedDepartment = localStorage.getItem("department");
    const storedUsername = localStorage.getItem("username");
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      const processedUsername = storedUsername.trim().replace(/\s+/g, " ");
      setUsername(processedUsername);
      setEmployeeId(storedEmployeeId);
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (!username) return setTypedUsername("");
    let index = 0;
    setTypedUsername("");
    intervalRef.current = setInterval(() => {
      index++;
      setTypedUsername(username.slice(0, index));
      if (index === username.length) clearInterval(intervalRef.current);
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [username]);

  useEffect(() => {
    fetch(`/api/month_wise_programs_iatf?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setIatfData(data))
      .catch(() => setIatfData([]));

    fetch(`/api/month_wise_programs_hse?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setHseData(data))
      .catch(() => setHseData([]));
  }, [selectedYear]);

  const computeStats = (data) => {
    if (!data.length) return { total: 0, completed: 0, rate: 0 };
    const total = data.reduce((sum, d) => sum + (d.Total || 0), 0);
    const completed = data.reduce((sum, d) => sum + (d.Completed || 0), 0);
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, rate };
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
      <div key={title} className="bg-white rounded-xl shadow p-6">
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
                <Legend />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-center text-gray-800 mb-2">
          Welcome, <span className="font-mono text-indigo-600">{typedUsername}</span>!
        </h1>
        
        <div className="flex mb-8">
          <div className="bg-white shadow rounded-lg p-4 flex items-left gap-3 border">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <DatePicker
              selected={new Date(selectedYear, 0, 1)}
              onChange={(d) => setSelectedYear(d.getFullYear())}
              showYearPicker
              dateFormat="yyyy"
              className="border px-3 py-1 rounded focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "IATF Total", value: iatfStats.total  },
            { label: "IATF Completed", value: iatfStats.completed },
            { label: "HSE Total", value: hseStats.total },
            { label: "HSE Completed", value: hseStats.completed },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
              </div>
              {icon}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
          {renderBarChart(iatfData, "IATF Monthly Training", iatfStats, "#c7d2fe", "#1e40af", "text-indigo-600")}
          {renderBarChart(hseData, "HSE Monthly Training", hseStats, "#fdba74", "#c2410c", "text-orange-600")}
        </div>

        <p className="text-center text-sm text-gray-500">
          Dashboard updated for {selectedYear} • Training Progress Tracker
        </p>
      </div>
    </div>
  );
};

export default Dashboard;