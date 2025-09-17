import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendDiscordNotification } from '../lib/discordWebhook';
import SEO from '../components/SEO';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);



  // Handle form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Use the signUp method from AuthContext
      await signUp(email, password);
      
      // Send Discord notification
      try {
        await sendDiscordNotification({
          email: email,
          name: 'New User',
          signup_method: 'email'
        });
      } catch (discordError) {
        console.log('Discord notification failed (non-critical):', discordError);
      }
      
      setSuccessMessage('Account created successfully! Please check your email to verify your account.');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Sign Up - CareerQuestAI"
        description="Create your free CareerQuestAI account and access AI-powered resume builder, interview preparation, and career tools. Join thousands who've landed their dream jobs."
        keywords="sign up, create account, CareerQuestAI registration, free resume builder, career tools"
        url="https://careerquestai.vercel.app/signup"
        noIndex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mb-3">
            🎉 100% FREE - No Credit Card Required
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Start Your Career Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Join thousands who've landed their dream jobs with AI-powered tools
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              ✅ AI Resume Builder
            </span>
            <span className="flex items-center">
              ✅ Interview Prep
            </span>
            <span className="flex items-center">
              ✅ Job Tracking
            </span>
          </div>
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
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all text-lg"
                placeholder="your.email@company.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all text-lg"
                placeholder="Create a secure password"
                required
                minLength={8}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                🔒 Minimum 8 characters for security
              </p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-70 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Creating Your Free Account...
              </>
            ) : (
              <>
                🚀 Get Free Access Now
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Your data is secure • 🚫 No spam • ⚡ Instant access
            </p>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Sign in here
            </button>
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Trusted by job seekers worldwide • Free forever • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Signup;
