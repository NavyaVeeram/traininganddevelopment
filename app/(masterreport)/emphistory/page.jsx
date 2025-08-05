"use client";

import BackButton from "@/components/BackButton";
import dynamic from "next/dynamic";

const EmployeeHistoryList = dynamic(() => import("./EmployeeHistoryList"), { ssr: false });

const Page = () => {
  return<>
  <EmployeeHistoryList />
  <BackButton/>
  </> ;
};

export default Page;
 