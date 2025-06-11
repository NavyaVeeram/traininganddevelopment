import React, { Suspense } from 'react';
import ApprovedDataReport from './ApprovedDataReport';

const ApprovedPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <ApprovedDataReport />
    </Suspense>
  );
};

export default ApprovedPage;
