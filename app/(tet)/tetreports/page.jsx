import React, { Suspense } from 'react';
import TetReportsClient from './TetReportsClient';

const TetReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TetReportsClient />
    </Suspense>
  );
};

export default TetReportsPage;
