import React, { Suspense } from 'react';
import TetReportsGeneric from './TetReportsGeneric';

const TetReportsGenericMain = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
  <TetReportsGeneric/>
    </Suspense>
  );
};

export default TetReportsGenericMain;
