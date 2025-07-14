"use client";

import React, { useEffect, useState } from "react";
import ChartBarDefault from "../ratingdistribution/barchart/page"
const RatingDistributionPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingDistribution = async () => {
      try {
        const response = await fetch("/api/get_rating_distribution");
        if (!response.ok) {
          throw new Error("Failed to fetch rating distribution data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchRatingDistribution();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading rating distribution...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch justify-around p-6 bg-white rounded shadow mt-6">

    <div >
      <h1 className="text-2xl font-bold mb-6 text-center text-sky-500">Training Effectiveness Evaluation Summary </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th rowSpan={2} className="border border-gray-300 px-4 py-2 text-left">S.No</th>
              <th rowSpan={2} className="border border-gray-300 px-4 py-2 text-left">Parameters</th>
              <th colSpan={5} className="border border-gray-300 px-4 py-2 text-center">Count Summary</th>
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
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
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
              <td colSpan={2} className="border border-gray-300 px-4 py-2 text-left">Parameters Rating</td>
              <td colSpan={10} className="border border-gray-300 px-4 py-2 text-center">
                1-Poor&nbsp;&nbsp; 2-Average&nbsp;&nbsp; 3-Good&nbsp;&nbsp; 4-Very Good&nbsp;&nbsp; 5-Excellent
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
          <div>
      <ChartBarDefault/>
      </div>
    </div>
  );
};

export default RatingDistributionPage;
