/**
 * @deprecated This file is maintained for backward compatibility. Use ResumeBuilderImpl instead.
 */
import React from 'react';
import ResumeBuilderImpl from './ResumeBuilderImpl';

/**
 * Legacy component name, re-exporting the new implementation.
 * This file exists only for backward compatibility.
 * Please import from './ResumeBuilderImpl' instead for new code.
 */
const Test: React.FC = () => {
  return <ResumeBuilderImpl />;
};

export default Test;
