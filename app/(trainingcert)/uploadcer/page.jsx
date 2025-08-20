"use client";

import dynamic from "next/dynamic";

const UploadCertificates = dynamic(() => import("./UploadCertificates"), {
  ssr: false,
});

const Page = () => {
  return <UploadCertificates />;
};

export default Page;
