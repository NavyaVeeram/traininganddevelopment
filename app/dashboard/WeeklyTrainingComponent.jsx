"use client";
import { useState, useEffect,useMemo } from "react";
import { Calendar, Clock, BookOpen, Users, ChevronRight, Shield } from "lucide-react";

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

      // Pre-filter here instead of doing inside component during render
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

  const currentWeek = getCurrentWeek();
  const nextWeek = currentWeek + 1;
// Replace useMemo usage with:
const currentWeekIatf = iatfData.current || [];
const nextWeekIatf = iatfData.next || [];
const currentWeekHse = hseData.current || [];
const nextWeekHse = hseData.next || [];

  const TrainingCard = ({ training, weekType, trainingType }) => {
    const isCurrentWeek = weekType === 'current';
    const isIatf = trainingType === 'iatf';
    
    let cardBg, iconColor, textColor;
    
    if (isIatf) {
      cardBg = isCurrentWeek ? 'bg-blue-50 border-blue-200' : 'bg-blue-50 border-blue-300';
      iconColor = isCurrentWeek ? 'text-blue-600' : 'text-blue-700';
      textColor = isCurrentWeek ? 'text-blue-800' : 'text-blue-900';
    } else {
      cardBg = isCurrentWeek ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-300';
      iconColor = isCurrentWeek ? 'text-green-600' : 'text-green-700';
      textColor = isCurrentWeek ? 'text-green-800' : 'text-green-900';
    }
    
    return (
      <div className={`rounded-lg border-2 p-1 transition-all duration-200 hover:shadow-md ${cardBg}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* <div className={`p-2 rounded-full ${isIatf ? (isCurrentWeek ? 'bg-blue-100' : 'bg-blue-100') : (isCurrentWeek ? 'bg-green-100' : 'bg-green-100')}`}>
              {isIatf ? (
                <BookOpen className={`w-5 h-5 ${iconColor}`} />
              ) : (
                <Shield className={`w-5 h-5 ${iconColor}`} />
              )}
            </div> */}
            <div className="flex-1">
              
              <h4 className={`font-semibold text-lg ${textColor}`}>
                {training.Program_Name || training.Training_Name}
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ weekType, trainingType }) => {
    const isCurrentWeek = weekType === 'current';
    const isIatf = trainingType === 'iatf';
    
    const bgColor = isIatf ? 'bg-blue-50' : 'bg-green-50';
    const textColor = isIatf ? 'text-blue-600' : 'text-green-600';
    const trainingLabel = isIatf ? 'IATF' : 'HSE';
    
    return (
      <div className={`rounded-lg border-2 border-dashed border-gray-200 p-8 text-center ${bgColor}`}>
        <Users className={`w-12 h-12 mx-auto mb-3 ${textColor} opacity-50`} />
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
  };

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
      {/* <div className="w-3 h-3 bg-blue-500 rounded-full"></div> */}
      <h3 className="font-bold text-blue-500">
        Current Week IATF ({currentWeek})
      </h3>
    </div>
    <ul className="list-none space-y-2 font-semibold text-blue-800">
      {currentWeekIatf.length > 0 ? (
        currentWeekIatf.map((training, index) => (
          <li key={`cw-iatf-${index}`} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {training.Program_Name || training.Training_Name}
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
      {/* <div className="w-3 h-3 bg-blue-700 rounded-full"></div> */}
      <h3 className="font-bold text-blue-900">
        Next Week IATF ({nextWeek})
      </h3>
    </div>
    <ul className="list-none space-y-2 font-semibold text-blue-900">
      {nextWeekIatf.length > 0 ? (
        nextWeekIatf.map((training, index) => (
          <li key={`nw-iatf-${index}`} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-700 rounded-full"></span>
            {training.Program_Name || training.Training_Name}
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
      {/* <div className="w-3 h-3 bg-green-500 rounded-full"></div> */}
      <h3 className="font-bold text-green-600">
        Current Week HSE ({currentWeek})
      </h3>
    </div>
    <ul className="list-none space-y-2 font-semibold text-green-700">
      {currentWeekHse.length > 0 ? (
        currentWeekHse.map((training, index) => (
          <li key={`cw-hse-${index}`} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {training.Program_Name || training.Training_Name}
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
      {/* <div className="w-3 h-3 bg-green-700 rounded-full"></div> */}
      <h3 className="font-bold  text-green-900">
        Next Week HSE ({nextWeek})
      </h3>
    </div>
    <ul className="list-none space-y-2 font-semibold text-green-900">
      {nextWeekHse.length > 0 ? (
        nextWeekHse.map((training, index) => (
          <li key={`nw-hse-${index}`} className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-700 rounded-full"></span>
            {training.Program_Name || training.Training_Name}
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