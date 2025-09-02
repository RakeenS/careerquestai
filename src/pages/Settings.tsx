import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Mail, 
  Trash2, 
  AlertCircle, 
  Check, 
  Loader,
  Download,
  LogOut,
  Key,
  User,
  Bell,
  Lock,
  Database,
  Sliders,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import DeleteAccountModal from '../components/DeleteAccountModal';
import ExportDataModal from '../components/ExportDataModal';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [messages, setMessages] = useState<{ [key: string]: { type: 'success' | 'error'; text: string } }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsLoading({ ...isLoading, passwordReset: true });
    setMessages({});

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessages({
        ...messages,
        passwordReset: {
          type: 'success',
          text: 'Password reset email sent. Please check your inbox.'
        }
      });
    } catch (error: any) {
      setMessages({
        ...messages,
        passwordReset: {
          type: 'error',
          text: 'Failed to send password reset email. Please try again.'
        }
      });
    } finally {
      setIsLoading({ ...isLoading, passwordReset: false });
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    setIsLoading({ ...isLoading, emailChange: true });
    setMessages({});

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      setMessages({
        ...messages,
        emailChange: {
          type: 'success',
          text: 'Verification email sent. Please check your inbox.'
        }
      });
    } catch (error: any) {
      setMessages({
        ...messages,
        emailChange: {
          type: 'error',
          text: 'Failed to update email. Please try again.'
        }
      });
    } finally {
      setIsLoading({ ...isLoading, emailChange: false });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
    }
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  // Navigation sidebar items
  const navItems = [
    { id: 'profile', icon: <User size={20} />, label: 'Profile' },
    { id: 'security', icon: <Lock size={20} />, label: 'Security' },
    { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { id: 'data', icon: <Database size={20} />, label: 'Data Management' },
    { id: 'appearance', icon: <Sliders size={20} />, label: 'Appearance' },
  ];

  // Define render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="flex-grow p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled
                    />
                    <button
                      onClick={() => handleEmailChange(user?.email || '')}
                      disabled={isLoading.emailChange}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      {isLoading.emailChange ? (
                        <Loader className="animate-spin mr-2" size={18} />
                      ) : (
                        <Mail className="mr-2" size={18} />
                      )}
                      Change Email
                    </button>
                  </div>
                  {messages.emailChange && (
                    <div className={`mt-3 text-sm flex items-center p-3 rounded-lg ${
                      messages.emailChange.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {messages.emailChange.type === 'success' ? (
                        <Check size={18} className="mr-2 flex-shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                      )}
                      {messages.emailChange.text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Security Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Password</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Change your password or request a password reset link.</p>
              <button
                onClick={handlePasswordReset}
                disabled={isLoading.passwordReset}
                className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                {isLoading.passwordReset ? (
                  <Loader className="animate-spin mr-2" size={18} />
                ) : (
                  <Key className="mr-2" size={18} />
                )}
                Reset Password
              </button>
              {messages.passwordReset && (
                <div className={`mt-3 text-sm flex items-center p-3 rounded-lg ${
                  messages.passwordReset.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {messages.passwordReset.type === 'success' ? (
                    <Check size={18} className="mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  )}
                  {messages.passwordReset.text}
                </div>
              )}
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Data Management</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Export Your Data</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Download a copy of your data including resumes, job applications, and goals.</p>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                <Download className="mr-2" size={18} />
                Export All Data
              </button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Appearance Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Theme Preferences</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark theme</p>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span className={`${darkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  <span className="sr-only">Toggle Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Notification Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Email Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Configure which email notifications you'd like to receive.</p>
              
              <div className="space-y-4">
                {['Job recommendations', 'Application updates', 'Career tips'].map(item => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span>{item}</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a category</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-12rem)]">
          {/* Sidebar */}
          <div className="md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
                <Shield className="mr-3 text-blue-600 dark:text-blue-400" />
                Settings
              </h1>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                      {activeTab === item.id && (
                        <ChevronRight size={16} className="ml-auto text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Account</h2>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut size={20} className="flex-shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={20} className="flex-shrink-0" />
                      <span>Delete Account</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-6 md:p-8 overflow-auto">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />

      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default Settings;