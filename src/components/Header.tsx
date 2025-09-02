import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleSignOut = async (e: React.MouseEvent) => {
    // Prevent default link behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Log for debugging
    console.log('Logout button clicked');
    
    try {
      // First try the Context's signOut
      await signOut();
      console.log('Auth context signOut called');
      
      // As a backup, also directly call Supabase signOut
      await supabase.auth.signOut();
      console.log('Direct Supabase signOut called');
      
      // Clear all localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key) localStorage.removeItem(key);
      }
      console.log('LocalStorage cleared');
      
      // Force redirect
      console.log('Redirecting to login page...');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  };

  const NavItems = () => (
    <>
      {user && (
        <>
          <li><Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">Home</Link></li>
          <li><Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">Dashboard</Link></li>
          <li>
            <Link to="/resume-builder" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">
              <FileText className="mr-1 h-4 w-4" />
              <span>Resume Builder</span>
            </Link>
          </li>
          <li>
            <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">
              Jobs
            </Link>
          </li>
          <li><Link to="/job-tracker" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">Job Tracker</Link></li>
          <li><Link to="/preparation" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">Preparation</Link></li>
          <li><Link to="/settings" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300">Settings</Link></li>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center text-xl font-bold text-primary-600 dark:text-primary-400 group">
          <FileText className="mr-2 group-hover:animate-pulse" />
          <span className="relative">
            <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
              CareerQuest
            </span>
            <span className="font-light text-gray-700 dark:text-gray-300">AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center">
          {user && (
            <ul className="flex space-x-4 mr-4">
              <NavItems />
            </ul>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300"
            >
              <LogOut className="mr-1" size={18} />
              Log Out
            </button>
          ) : (
            <Link
              to="/signup"
              className="ml-4 flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300"
            >
              <LogIn className="mr-1" size={18} />
              Sign Up
            </Link>
          )}
        </nav>
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-gray-600 dark:text-gray-300 focus:outline-none">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 py-4">
          {user && (
            <ul className="flex flex-col space-y-2 px-4">
              <NavItems />
            </ul>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300"
            >
              <LogOut className="mr-1 inline-block" size={18} />
              Log Out
            </button>
          ) : (
            <Link
              to="/signup"
              className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition duration-300"
            >
              <LogIn className="mr-1 inline-block" size={18} />
              Sign Up
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export default Header