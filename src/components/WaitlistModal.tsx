import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Reset states when modal is closed or opened
  useEffect(() => {
    if (!isOpen) {
      // Small delay to reset after animation completes
      const timer = setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);
        setError(null);
        setEmail('');
        setDebugInfo(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setDebugInfo(null);

    try {
      // Log environment variables (without revealing secrets)
      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      setDebugInfo(`Supabase config available: URL=${hasSupabaseUrl}, Key=${hasSupabaseKey}`);

      // Store locally immediately as a fallback
      const existingWaitlist = JSON.parse(localStorage.getItem('waitlist') || '[]');
      
      if (existingWaitlist.includes(email)) {
        setIsSubmitting(false);
        setError('This email is already on our waitlist.');
        return;
      }
      
      existingWaitlist.push(email);
      localStorage.setItem('waitlist', JSON.stringify(existingWaitlist));
      console.log('Successfully saved to localStorage waitlist');
      
      // Try to submit to Supabase if available
      if (hasSupabaseUrl && hasSupabaseKey) {
        console.log('Attempting to submit to Supabase:', email);
        setDebugInfo(prev => `${prev}\nAttempting Supabase submission...`);

        const { data, error: supabaseError } = await supabase
          .from('waitlist')
          .insert([{ email, created_at: new Date().toISOString() }]);

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setDebugInfo(prev => `${prev}\nSupabase error: ${supabaseError.message}`);
        } else {
          console.log('Supabase success:', data);
          setDebugInfo(prev => `${prev}\nSupabase submission successful!`);
        }
      } else {
        console.warn('Supabase not configured, using localStorage only');
        setDebugInfo(prev => `${prev}\nSupabase not configured properly.`);
      }

      // Always mark as success since we saved to localStorage at minimum
      setIsSuccess(true);
      setIsSubmitting(false);

      // Close modal after success display
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Waitlist submission error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}`);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join the Waitlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Early Access Benefits:
          </h3>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg mb-3 border-l-4 border-yellow-500">
            <p className="text-yellow-800 dark:text-yellow-200 font-bold">
              Special Offer: $2.99 Lifetime Access
            </p>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              Limited to the first 50 users on our waitlist!
            </p>
          </div>
          <ul className="text-blue-800 dark:text-blue-300 space-y-2">
            <li className="flex items-center">
              <Check size={16} className="mr-2 flex-shrink-0" />
              Lifetime access to all premium features
            </li>
            <li className="flex items-center">
              <Check size={16} className="mr-2 flex-shrink-0" />
              Priority access to new features
            </li>
            <li className="flex items-center">
              <Check size={16} className="mr-2 flex-shrink-0" />
              Exclusive early-bird community
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting || isSuccess}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg flex items-center"
            >
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {debugInfo && (
            <div className="p-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-mono whitespace-pre-wrap">
              {debugInfo}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSuccess || !email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader className="animate-spin mr-2" size={16} />
                Joining...
              </div>
            ) : isSuccess ? (
              <div className="flex items-center">
                <Check className="mr-2" size={16} />
                You're on the list!
              </div>
            ) : (
              'Join Waitlist'
            )}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          By joining the waitlist, you agree to receive updates about CareerQuestAI.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WaitlistModal;