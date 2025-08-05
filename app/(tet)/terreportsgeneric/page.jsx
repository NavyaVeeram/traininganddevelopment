import React, { Suspense } from 'react';
import TetReportsGeneric from './TetReportsGeneric';
import BackButton from '@/components/BackButton';

const TetReportsGenericMain = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
  <TetReportsGeneric/>
  <BackButton/>
    </Suspense>
  );
};

export default TetReportsGenericMain;
