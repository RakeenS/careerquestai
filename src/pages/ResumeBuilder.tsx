import React from 'react';
import ResumeBuilderImpl from './ResumeBuilderImpl';

const ResumeBuilder: React.FC = () => {
  // Using the ResumeBuilderImpl component for the actual implementation
  // This wrapper exists to provide a clean public API
  return <ResumeBuilderImpl />;
};

export default ResumeBuilder;