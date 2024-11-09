'use client';

import { useProjectContext } from '@/context/ProjectProvider';
import { useEffect, useState } from 'react';

const ConsumptionPage = () => {
  const { selectedProjectId, selectedProjectAddress } = useProjectContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Consumption Page</h1>
      {selectedProjectId ? (
        <>
          <p>Selected Project ID: {selectedProjectId}</p>
          <p>Project Address: {selectedProjectAddress}</p>
        </>
      ) : (
        <p>No project selected.</p>
      )}
    </div>
  );
};

export default ConsumptionPage;
