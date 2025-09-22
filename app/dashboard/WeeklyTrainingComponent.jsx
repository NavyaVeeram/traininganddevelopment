"use client";
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

const WeeklyTrainingComponent = ({ selectedYear }) => {
  const [iatfData, setIatfData] = useState([]);
  const [hseData, setHseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [iatfResponse, hseResponse] = await Promise.all([
          fetch(`/api/get_curr_next_week_prog_iatf?year=${selectedYear}`),
          fetch(`/api/get_curr_next_week_prog_hse?year=${selectedYear}`),
        ]);

        if (!iatfResponse.ok) throw new Error('Failed to fetch IATF training data');
        if (!hseResponse.ok) throw new Error('Failed to fetch HSE training data');

        const [iatfResult, hseResult] = await Promise.all([
          iatfResponse.json(),
          hseResponse.json(),
        ]);

        const currentWeek = getCurrentWeek();
        const nextWeek = currentWeek + 1;

        setIatfData({
          current: iatfResult.filter(item => item.Week === currentWeek),
          next: iatfResult.filter(item => item.Week === nextWeek),
        });

        setHseData({
          current: hseResult.filter(item => item.Week === currentWeek),
          next: hseResult.filter(item => item.Week === nextWeek),
        });
      } catch (err) {
        setError(err.message);
        setIatfData({ current: [], next: [] });
        setHseData({ current: [], next: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [selectedYear]);

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  };

  // Utility function to combine identical trainings
  const mergeTrainings = (trainings) => {
    const map = new Map();
    trainings.forEach(training => {
      // This key should include all fields you want for uniqueness
      const key = [
        training.Program_Name || "",
        training.Training_Name || "",
        training.Training_Date || "",
        training.Department || "",
        training.Location || "",
        training.Start_Time || "",
        training.End_Time || "",
        training.Trainer || "",
      ].join("|");

      if (!map.has(key)) {
        map.set(key, training);
      }
    });
    return Array.from(map.values());
  };

  // Prepare merged/truncated lists for display
  const currentWeekIatf = mergeTrainings(iatfData.current || []);
  const nextWeekIatf = mergeTrainings(iatfData.next || []);
  const currentWeekHse = mergeTrainings(hseData.current || []);
  const nextWeekHse = mergeTrainings(hseData.next || []);

  const currentWeek = getCurrentWeek();
  const nextWeek = currentWeek + 1;

  const EmptyState = ({ weekType, trainingType }) => {
    const isCurrentWeek = weekType === 'current';
    const isIatf = trainingType === 'iatf';
    const bgColor = isIatf ? 'bg-blue-50' : 'bg-green-50';
    const textColor = isIatf ? 'text-blue-600' : 'text-green-600';
    const trainingLabel = isIatf ? 'IATF' : 'HSE';

    return (
      <div className={`rounded-lg border-2 border-dashed border-gray-200 p-8 text-center ${bgColor}`}>
        <p className="text-gray-500 font-medium">
          No {isCurrentWeek ? 'current' : 'next'} week {trainingLabel} trainings
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Check back later for updates
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600 font-medium">Error loading weekly trainings</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Weekly Training Schedule</h2>
          <p className="text-sm font-semibold text-black-200">Current and Upcoming IATF & HSE Training Programs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Current Week IATF */}
        <div className="border-2 border-blue-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-blue-500">
              Current Week IATF ({currentWeek})
            </h3>
          </div>
          <ul className="list-none space-y-2 font-semibold text-blue-800">
            {currentWeekIatf.length > 0 ? (
              currentWeekIatf.map((training, index) => (
                <li key={`cw-iatf-${index}`} className="flex flex-col px-2 py-1 border-blue-100">
                  {training.Program_Name || training.Training_Name}
                  {training.Training_Date && <span className="text-xs text-blue-400">{training.Training_Date}</span>}
                  {training.Department && <span className="text-xs text-blue-400">{training.Department}</span>}
                  {/* Add other fields if they exist */}
                </li>
              ))
            ) : (
              <EmptyState weekType="current" trainingType="iatf" />
            )}
          </ul>
        </div>

        {/* Next Week IATF */}
        <div className="border-2 border-blue-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-blue-900">
              Next Week IATF ({nextWeek})
            </h3>
          </div>
          <ul className="list-none space-y-2 font-semibold text-blue-900">
            {nextWeekIatf.length > 0 ? (
              nextWeekIatf.map((training, index) => (
                <li key={`nw-iatf-${index}`} className="flex flex-col px-2 py-1 border-blue-100">
                  {training.Program_Name || training.Training_Name}
                  {training.Training_Date && <span className="text-xs text-blue-400">{training.Training_Date}</span>}
                  {training.Department && <span className="text-xs text-blue-400">{training.Department}</span>}
                </li>
              ))
            ) : (
              <EmptyState weekType="next" trainingType="iatf" />
            )}
          </ul>
        </div>

        {/* Current Week HSE */}
        <div className="border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold text-green-600">
              Current Week HSE ({currentWeek})
            </h3>
          </div>
          <ul className="list-none space-y-2 font-semibold text-green-700">
            {currentWeekHse.length > 0 ? (
              currentWeekHse.map((training, index) => (
                <li key={`cw-hse-${index}`} className="flex flex-col px-2 py-1 border-green-100">
                  {training.Program_Name || training.Training_Name}
                  {training.Training_Date && <span className="text-xs text-green-400">{training.Training_Date}</span>}
                  {training.Department && <span className="text-xs text-green-400">{training.Department}</span>}
                </li>
              ))
            ) : (
              <EmptyState weekType="current" trainingType="hse" />
            )}
          </ul>
        </div>

        {/* Next Week HSE */}
        <div className="border-2 border-green-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-bold  text-green-900">
              Next Week HSE ({nextWeek})
            </h3>
          </div>
          <ul className="list-none space-y-2 font-semibold text-green-900">
            {nextWeekHse.length > 0 ? (
              nextWeekHse.map((training, index) => (
                <li key={`nw-hse-${index}`} className="flex flex-col px-2 py-1 border-green-100">
                  {training.Program_Name || training.Training_Name}
                  {training.Training_Date && <span className="text-xs text-green-400">{training.Training_Date}</span>}
                  {training.Department && <span className="text-xs text-green-400">{training.Department}</span>}
                </li>
              ))
            ) : (
              <EmptyState weekType="next" trainingType="hse" />
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTrainingComponent;
