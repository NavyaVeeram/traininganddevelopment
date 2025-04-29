"use client";

import dynamic from "next/dynamic";

const QualifiedTrainerList= dynamic(() => import("./QualifiedTrainerList"), { ssr: false });

const Page = () => {
  return <QualifiedTrainerList />;
};

export default Page;
 