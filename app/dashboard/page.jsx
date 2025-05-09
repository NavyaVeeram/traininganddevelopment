"use client";
import { useState, useEffect, useRef } from "react";

const Dashboard = () => {
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [employeeId, setEmployeeId] = useState('');
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
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (!username) {
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
  }, [username]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="flex-grow w-full max-w-4xl mt-16 px-4 opacity-100 transition-opacity">
        <h1 className="text-3xl font-bold text-center mt-8">
          Welcome, <span className="font-mono">{typedUsername}</span>!
        </h1>
        {/* Dashboard content can go here */}
      </div>
    </div>
  );
};

export default Dashboard;
