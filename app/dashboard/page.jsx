"use client";
import { useState, useEffect, useRef } from "react";

const Dashboard = () => {
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [typedUsername, setTypedUsername] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    const storedDepartment = localStorage.getItem('department');
    const storedUsername = localStorage.getItem('username');
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedDepartment && storedUsername && storedEmployeeId) {
      setDepartment(storedDepartment);
      const processedUsername = storedUsername.trim().replace(/\s+/g, ' ');
      setUsername(processedUsername);
      setEmployeeId(storedEmployeeId);
      setShowPopup(true);
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (showPopup || !username) {
      setTypedUsername('');
      return;
    }

    let index = 0;
    setTypedUsername('');
    intervalRef.current = setInterval(() => {
      index++;
      setTypedUsername(username.slice(0, index));
      if (index === username.length) {
        clearInterval(intervalRef.current);
      }
    }, 150);

    return () => clearInterval(intervalRef.current);
  }, [showPopup, username]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {showPopup && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-md flex justify-between items-center z-50">
          <div>
            <h2 className="text-lg font-semibold">Welcome to Dashboard</h2>
            <p>Hello, {username}!</p>
          </div>
          <button
            onClick={closePopup}
            className="ml-4 px-3 py-1 bg-white text-blue-600 rounded hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      )}
      <div className={`flex-grow w-full max-w-4xl mt-16 px-4 ${showPopup ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
        <h1 className="text-3xl font-bold text-center mt-8">
          Welcome, <span className="font-mono">{typedUsername}</span>!
        </h1>
        {/* Dashboard content can go here */}
      </div>
    </div>
  );
};

export default Dashboard;
