import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';

const DarkModeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center justify-center p-1 w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none"
    >
      <div
        className={`absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          darkMode ? 'translate-x-6' : ''
        }`}
      />
      <Sun className={`absolute left-1 top-1 w-6 h-6 text-yellow-500 transition-opacity duration-300 ${darkMode ? 'opacity-0' : 'opacity-100'}`} />
      <Moon className={`absolute right-1 top-1 w-6 h-6 text-blue-500 transition-opacity duration-300 ${darkMode ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
};

export default DarkModeToggle;