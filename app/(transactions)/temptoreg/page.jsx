"use client"
import React from 'react'
import { useState,useEffect } from 'react';
const page = () => {
      const [accessRole, setAccessRole] = useState(null);
      const [isAuthorized, setIsAuthorized] = useState(null);
      const [employeeId,setEmployeeId] = useState(null);
     useEffect(() => {
     const storedEmployeeId = localStorage.getItem('employeeId');
   
     if (storedEmployeeId) {
       setEmployeeId(storedEmployeeId);
     }
    
     const fetchAccessRole = async () => {
       try {
         const res = await fetch(`/api/get_access_role?employeeId=${storedEmployeeId}`);
         const data = await res.json();
   
         if (res.ok && data.Access_Role) {
           // Restrict access for HR_Res and HR_HOD roles
           if (data.Access_Role === "HOS" || data.Access_Role === "HOD" || data.Access_Role === "Res_Person" ) {
             setIsAuthorized(false);
             // Optionally redirect to unauthorized page
             // window.location.href = '/unauthorized';
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
     if (isAuthorized === null) {
    return (
      // <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 text-gray-800">
      //   <div className="bg-white p-10 rounded shadow text-center">
      //     <h2 className="text-2xl font-bold">Loading...</h2>
      //   </div>
      // </div>
      <div>Loading...</div>
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
  return (
    <div>
      temporary to regular
    </div>
  )
}

export default page
