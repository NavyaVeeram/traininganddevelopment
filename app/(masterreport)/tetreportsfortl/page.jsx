import React, { Suspense } from 'react';
import TetReportsforTL from './TetReportsforTL';

const TetReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TetReportsforTL/>
    </Suspense>
  );
};

export default TetReportsPage;
