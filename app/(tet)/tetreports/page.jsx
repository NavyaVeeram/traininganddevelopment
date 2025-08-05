import React, { Suspense } from 'react';
import TetReportsClient from './TetReportsClient';
import BackButton from '@/components/BackButton';

const TetReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TetReportsClient />
      <BackButton/>
    </Suspense>
  );
};

export default TetReportsPage;
