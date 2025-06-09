"use client"
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const monthsOrder = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AnnualTraining = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [accessRole, setAccessRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trainingName, setTrainingName] = useState('IATF');
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authorization check
  useEffect(() => {
    const storedEmployeeId = localStorage.getItem('employeeId');
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }

    const fetchAccessRole = async () => {
      try {
        const res = await fetch('/api/get_access_role?employeeId=' + storedEmployeeId);
        const data = await res.json();

        if (res.ok && data.Access_Role) {
          if (data.Access_Role === "Res_Person" || data.Access_Role === "HOS" || data.Access_Role === "HOD" ||  data.Access_Role === "HR_Hod") {
            setIsAuthorized(false);
            return;
          }
          setAccessRole(data.Access_Role);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error fetching access role:', error);
        setIsAuthorized(false);
      }
    };

    fetchAccessRole();
  }, []);

  // Fetch training calendar data when selectedDate or trainingName changes and authorized
  useEffect(() => {
    if (isAuthorized) {
      setLoading(true);
      setError(null);
      fetch(`/api/get_annual_training_calendar?year=${selectedDate.getFullYear()}&trainingName=${trainingName}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch training calendar');
          return res.json();
        })
        .then(data => {
          setTrainingData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [selectedDate, trainingName, isAuthorized]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
        <div className="bg-white p-10 rounded shadow text-center">
          <h2 className="text-2xl font-bold">Unauthorized</h2>
          <p className="mt-2">You do not have access to view this page.</p>
        </div>
      </div>
    );
  }
  

  // Process data to group by month and week
  // trainingData is array of objects with Year_No, Req_Months, Week, Program_Name
  // We want to create a structure: { month: { week: [programs] } }
  const groupedData = {};
  trainingData.forEach(item => {
    const month = item.Req_Months.toLowerCase();
    const week = item.Week;
    const program = item.Program_Name;

    if (!groupedData[month]) {
      groupedData[month] = {};
    }
    if (!groupedData[month][week]) {
      groupedData[month][week] = [];
    }
    groupedData[month][week].push(program);
  });

  // Use fixed months in calendar order
  const monthsInData = monthsOrder;

  // Map full month name to 3-letter abbreviation (lowercase)
  const monthAbbrMap = {
    January: 'jan',
    February: 'feb',
    March: 'mar',
    April: 'apr',
    May: 'may',
    June: 'jun',
    July: 'jul',
    August: 'aug',
    September: 'sep',
    October: 'oct',
    November: 'nov',
    December: 'dec',
  };

  // ISO 8601 Week Number Calculation (from FullYearCalendar)
  function getISOWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = new Date(target.getFullYear(), 0, 4);
    const firstDayNr = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3);
    const weekNumber = 1 + Math.floor((target - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
  }

  // Generate dynamic week numbers per month based on selected year
  const dynamicWeeksByMonth = {};
  monthsInData.forEach((month, index) => {
    const monthNum = index; // 0-based month index
    const weeks = new Set();
    const daysInMonth = new Date(selectedDate.getFullYear(), monthNum + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), monthNum, day);
      let weekNum = getISOWeekNumber(date);
      // Enforce ISO standard of max 52 weeks per year
      if (weekNum > 52) {
        weekNum = 52;
      }
      weeks.add(weekNum);
    }
    // Convert set to sorted array
    dynamicWeeksByMonth[month] = Array.from(weeks).sort((a, b) => a - b);
  });

  return (
    <div className="max-w-full mx-auto bg-white p-2 w-full">
<div className="bg-sky-400 text-white p-2 flex justify-between rounded-t-lg">

      <p className="font-semibold">Annual Training Calendar</p>
</div>
      <div className="mb-4 mt-2 flex items-center space-x-4">
        <div>
          <label htmlFor="year-select" className="mr-2 font-semibold">Select Year:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy"
            showYearPicker
            placeholderText="Select Year"
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
        <div>
          <label htmlFor="training-select" className="mr-2 font-semibold">Select Training:</label>
          <select
            id="training-select"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="IATF">IATF</option>
            <option value="HSE">HSE</option>
          </select>
        </div>
      </div>

      {loading && <p>Loading training calendar...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && trainingData.length === 0 && (
        <p>No training data available for the selected year.</p>
      )}

      {!loading && !error && trainingData.length > 0 && (
        <table className="min-w-full border border-gray-300 table-fixed">
          <tbody>
            <tr>
              <td
                className="border border-gray-300 px-2 py-1 font-semibold w-12 h-12 bg-blue-200 text-center align-middle whitespace-nowrap"
              >
                Months
              </td>
              <td
                className="border border-gray-300 px-1 py-1 w-24 text-center font-semibold bg-orange-200"
                colSpan={5}
              >
                Weeks
              </td>
            </tr>
            {monthsInData.map(month => {
              const monthKey = monthAbbrMap[month].toLowerCase();
              const weeks = dynamicWeeksByMonth[month] || [];
              const weeksToShow = weeks.slice(0, 5);
              return (
                <React.Fragment key={month}>
                  <tr>
                    <td
                      className="border border-gray-300 px-2 py-1 font-semibold w-12 h-12 bg-blue-100 text-center align-middle whitespace-nowrap"
                      rowSpan={2}
                    >
                      {month}
                    </td>
                    {weeksToShow.map(week => (
                      <td
                        key={`${month}-week-header-${week}`}
                        className="border border-gray-300 px-1 py-1 w-24  text-center font-semibold bg-orange-100"
                      >
                        Week {week}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {weeksToShow.map(week => {
                    let bgColor = 'bg-white';
                    return (
                      <td
                        key={`${month}-week-data-${week}`}
                        className={`border border-gray-300 px-4 py-3 w-24 break-words whitespace-normal max-w-24 ${bgColor}`}
                      >
                        {groupedData[monthKey] && groupedData[monthKey][week] ? groupedData[monthKey][week].map((program, idx) => (
                          <div key={idx} className="mb-1 break-words whitespace-normal max-w-full inline-block">{program}</div>
                        )) : '-'}
                      </td>
                    );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default AnnualTraining;
