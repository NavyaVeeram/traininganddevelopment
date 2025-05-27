import React, { useEffect, useState } from "react";

const AccessList = ({ refreshTrigger }) => {
  const [accessList, setAccessList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccessList = async () => {
      try {
        const res = await fetch("/api/view_employee_access");
        if (!res.ok) throw new Error("Failed to load access list");
        const data = await res.json();
        setAccessList(data);
        // Store all Access_Role values in localStorage as JSON string
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      }
    };

    fetchAccessList();
  }, [refreshTrigger]);

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="m-5">
      <h2 className="text-lg font-semibold mb-4">Employee Access List:</h2>
      <table className="w-230 overf border relative z-0  bg-card text-foreground"
         style={{
          tableLayout: "fixed",
          fontSize: "13px",
          padding: "1px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
        <thead className="bg-muted sticky top-0 z-10">
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border w-20">Access ID</th>
            <th className="px-4 py-2 border">Employee ID</th>
            <th className="px-4 py-2 border">Access Role</th>
          </tr>
        </thead>
        <tbody>
          {accessList.length > 0 ? (
            accessList.map((item) => (
              <tr className="border hover:bg-muted"  key={item.Ac_Id}>
                <td className="px-4 py-2 border">{item.Ac_Id}</td>
                <td className="px-4 py-2 border">{item.EmployeeId}</td>
                <td className="px-4 py-2 border">{item.Access_Role}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="p-4 text-center">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AccessList;
