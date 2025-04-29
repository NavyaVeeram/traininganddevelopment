"use client";

import dynamic from "next/dynamic";

const EmployeeHistoryList = dynamic(() => import("./EmployeeHistoryList"), { ssr: false });

const Page = () => {
  return <EmployeeHistoryList />;
};

export default Page;
 