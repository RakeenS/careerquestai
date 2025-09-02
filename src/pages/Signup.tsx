import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { sendDiscordNotification } from '../lib/discordWebhook';
import { Loader, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();



  // Handle form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Create user account with minimal required fields
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      const user = data.user;
      
      // After successful signup, update the user metadata
      if (user) {
        try {
          await supabase.auth.updateUser({
            data: { full_name: fullName }
          });
        } catch (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Continue even if metadata update fails
        }

        // Send Discord notification
        await sendDiscordNotification({
          email: user.email || email,
          name: fullName,
          signup_method: 'email'
        });
      }
      
      setSuccessMessage('Account created successfully! Redirecting to Dashboard...');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign up to get started with CareerQuestAI
          </p>
        </div>
        
        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-green-700 dark:text-green-400">
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-400">
            {errorMessage}
          </div>
        )}
        

        
        <form onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="john@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters
              </p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
