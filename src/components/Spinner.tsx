import React from 'react';
import { Loader } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClass = 
    size === 'sm' ? 'w-4 h-4' : 
    size === 'lg' ? 'w-8 h-8' : 
    'w-6 h-6';
  
  return (
    <div className="flex items-center justify-center">
      <Loader className={`${sizeClass} animate-spin`} />
    </div>
  );
};

export default Spinner; 