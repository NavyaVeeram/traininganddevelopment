"use client";

import dynamic from "next/dynamic";

const UploadMaterials = dynamic(() => import("./UploadMaterials"), { ssr: false });

const Page = () => {
  return <UploadMaterials />;
};

export default Page;
 