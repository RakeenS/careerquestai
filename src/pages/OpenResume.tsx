import React, { Suspense } from 'react';

// Lazily load the component to handle client-side only code
const OpenResumePage = React.lazy(() => import('../components/OpenResume/OpenResumePage'));

const OpenResume = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="py-6 px-8 bg-white shadow-sm">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Open Resume Builder
        </h1>
        <p className="text-gray-600 mt-2">
          Create professional resumes with our powerful, open-source builder
        </p>
      </header>
      
      <main className="relative w-full overflow-hidden">
        <Suspense fallback={<div className="flex justify-center items-center h-96">Loading resume builder...</div>}>
          <OpenResumePage />
        </Suspense>
      </main>
    </div>
  );
};

export default OpenResume; 