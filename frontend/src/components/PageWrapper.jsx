import React, { Suspense } from 'react';
import Loader from './Loader';

const PageWrapper = ({ children }) => {
  return (
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  );
};

export default PageWrapper;