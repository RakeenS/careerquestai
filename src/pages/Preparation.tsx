import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Mail, Download } from 'lucide-react';
import { generateCoverLetterPDF } from '../components/pdf/CoverLetterPDF';
import { 
  Link as LinkIcon, Wand2, AlertCircle,
  Search, MessageSquare, 
  Clock, X
} from 'lucide-react';
import { LinkedInOptimizerModal, OptimizationResults } from '../components/LinkedInOptimizer';
import ResumeTailorModal from '../components/ResumeTailorModal';
import CoverLetterModal from '../components/CoverLetterModal';
import EmailModal from '../components/EmailModal';
import TailoredResumeModal from '../components/TailoredResumeModal';
import CareerResearchModal from '../components/CareerResearchModal';
import MockInterviewModal from '../components/MockInterviewModal';
import AutoApplyModal from '../components/AutoApplyModal';
import type { OptimizationResults as OptimizationResultsType } from '../lib/linkedinOptimizer';
import { optimizeLinkedInProfile } from '../lib/linkedinOptimizer';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import { getOpenAIClient as getLibraryOpenAIClient } from '../lib/openai';

// Use the library's getOpenAIClient function, which properly handles all environments
const getOpenAIClient = async () => {
  return await getLibraryOpenAIClient();
};

const Preparation: React.FC = () => {
  const [isResumeTailorModalOpen, setIsResumeTailorModalOpen] = useState(false);
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [isCareerResearchModalOpen, setIsCareerResearchModalOpen] = useState(false);
  const [isMockInterviewModalOpen, setIsMockInterviewModalOpen] = useState(false);
  const [isAutoApplyModalOpen, setIsAutoApplyModalOpen] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResultsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentJobInfo, setCurrentJobInfo] = useState('');
  const [currentResumeContent, setCurrentResumeContent] = useState('');
  const [currentLinkedInProfile, setCurrentLinkedInProfile] = useState('');
  const [currentJobTitle, setCurrentJobTitle] = useState('');
  const [currentIndustry, setCurrentIndustry] = useState('');
  const { addActivity } = useActivity();
  const { user } = useAuth();

  const handleTailorResume = async (jobInfo: string, resumeContent: string) => {
    if (!user) {
      setError('Please log in to use this feature');
      return;
    }

    // For development: bypass API usage check
    // const canUseApi = await checkAndIncrementUsage(user.id);
    // if (!canUseApi) {
    //   setError('You have reached your daily API usage limit. Please try again tomorrow.');
    //   return;
    // }

    setIsOptimizing(true);
    setCurrentJobInfo(jobInfo);
    setCurrentResumeContent(resumeContent);
    setError(null);

    try {
      let result;
      
      // Use the serverless API endpoint in production, direct OpenAI in development
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('Using Resume Tailor serverless function');
        try {
          const response = await fetch('/api/tailor-resume', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobInfo, resumeContent }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}...`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to tailor resume');
          }
          
          result = data.data.choices[0].message.content;
        } catch (error: any) {
          console.error('Resume Tailor API error:', error);
          
          // If there's a server timeout, tell the user specifically
          if (error.message && error.message.includes('504')) {
            throw new Error('The server timed out while processing your request. Please try again with a shorter resume or job description.');
          }
          
          if (error.message && error.message.includes('JSON')) {
            throw new Error('Invalid response received from server. Please try again later.');
          }
          
          throw error;
        }
      } else {
        console.log('Using direct OpenAI client');
        // Fallback to direct OpenAI for development
        const openaiClient = await getOpenAIClient();
        const response = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert at tailoring resumes to match job descriptions."
            },
            {
              role: "user",
              content: `Create a tailored resume based on this job description:\n\n${jobInfo}\n\nOriginal Resume:\n\n${resumeContent}`
            }
          ],
        });
        
        result = response.choices[0].message.content;
      }

      setTailoredResume(result);
      addActivity('resume', 'Generated tailored resume');
    } catch (error: any) {
      console.error('Error tailoring resume:', error);
      setError('Failed to tailor resume. Please try again.');
    } finally {
      setIsOptimizing(false);
      setIsResumeTailorModalOpen(false);
    }
  };

  const generateCoverLetter = async (name: string, jobUrl: string) => {
    if (!user) {
      setError('Please log in to use this feature');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      let result;
      
      // Use the serverless API endpoint in production, direct OpenAI in development
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('Using Cover Letter serverless function');
        try {
          const response = await fetch('/api/cover-letter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, jobUrl }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}...`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to generate cover letter');
          }
          
          result = data.data.choices[0].message.content;
        } catch (error: any) {
          console.error('Cover Letter API error:', error);
          
          // If there's a server timeout, tell the user specifically
          if (error.message && error.message.includes('504')) {
            throw new Error('The server timed out while processing your request. Please try again with a shorter job description.');
          }
          
          if (error.message && error.message.includes('JSON')) {
            throw new Error('Invalid response received from server. Please try again later.');
          }
          
          throw error;
        }
      } else {
        console.log('Using direct OpenAI client');
        // Fallback to direct OpenAI for development
        const openaiClient = await getOpenAIClient();
        const response = await openaiClient.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert at writing professional cover letters."
            },
            {
              role: "user",
              content: `Write a professional cover letter for ${name} applying to this job: ${jobUrl}`
            }
          ],
        });
        
        result = response.choices[0].message.content;
      }

      setCoverLetter(result);
      addActivity('resume', 'Generated cover letter');
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsOptimizing(false);
      setIsCoverLetterModalOpen(false);
    }
  };

  const generateEmailTemplate = async (jobInfo: string, tone: string, stage: string) => {
    if (!user) {
      setError('Please log in to use this feature');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      let result;
      
      // Use the serverless API endpoint in production, direct OpenAI in development
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('Using Follow-up Email serverless function');
        try {
          const response = await fetch('/api/follow-up-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jobInfo, tone, stage }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Server error: ${response.status} - ${errorText.substring(0, 100)}...`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to generate email template');
          }
          
          result = data.data.choices[0].message.content;
        } catch (error: any) {
          console.error('Follow-up Email API error:', error);
          
          // If there's a server timeout, tell the user specifically
          if (error.message && error.message.includes('504')) {
            throw new Error('The server timed out while processing your request. Please try again with a shorter job description.');
          }
          
          if (error.message && error.message.includes('JSON')) {
            throw new Error('Invalid response received from server. Please try again later.');
          }
          
          throw error;
        }
      } else {
        console.log('Using direct OpenAI client');
        // Fallback to direct OpenAI for development
        const openaiClient = await getOpenAIClient();
        const response = await openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are an expert at writing professional follow-up emails. Create a ${tone} email for a candidate who is ${stage}.`
            },
            {
              role: "user",
              content: `Generate a follow-up email template for this job/interview: ${jobInfo}`
            }
          ],
        });
        
        result = response.choices[0].message.content;
      }

      setEmailTemplate(result);
      addActivity('resume', 'Generated email template');
    } catch (error: any) {
      console.error('Error generating email template:', error);
      setError('Failed to generate email template. Please try again.');
    } finally {
      setIsOptimizing(false);
      setIsEmailModalOpen(false);
    }
  };

  const handleLinkedInOptimize = async (profileUrl: string, jobTitle: string, industry: string) => {
    console.log('handleLinkedInOptimize called with:', { profileUrl, jobTitle, industry });
    
    try {
      if (!user) {
        console.error('No user logged in');
        setError('Please log in to use this feature');
        return;
      }

      // For development: bypass API usage check - similar to other features
      // Comment this out in production
      /*
      console.log('Checking API usage for user:', user.id);
      const canUseApi = await checkAndIncrementUsage(user.id);
      console.log('API usage check result:', canUseApi);
      
      if (!canUseApi) {
        setError('You have reached your daily API usage limit. Please try again tomorrow.');
        return;
      }
      */

      // Store the profile details for possible regeneration
      setCurrentLinkedInProfile(profileUrl);
      setCurrentJobTitle(jobTitle);
      setCurrentIndustry(industry);

      setIsOptimizing(true);
      setError(null);

      // Pass all parameters to the optimizer function
      console.log('Calling optimizeLinkedInProfile with:', { profileUrl, jobTitle, industry });
      const results = await optimizeLinkedInProfile(profileUrl, jobTitle, industry);
      console.log('Optimization results:', results);
      
      setOptimizationResults(results);
      setIsLinkedInModalOpen(false);
      
      // Add activity logging
      addActivity('linkedin', `Optimized LinkedIn profile for ${jobTitle} in ${industry}`);
    } catch (error: any) {
      console.error('Error optimizing LinkedIn profile:', error);
      setError('Failed to optimize LinkedIn profile. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Function to regenerate LinkedIn optimization results
  const regenerateLinkedInOptimization = async () => {
    // Make sure we have the required details stored
    if (!currentLinkedInProfile || !currentJobTitle || !currentIndustry) {
      setError('Missing LinkedIn profile details. Please submit a new optimization request.');
      return;
    }
    
    // Call the optimization function with the stored details
    await handleLinkedInOptimize(currentLinkedInProfile, currentJobTitle, currentIndustry);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Preparation Tools</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Resume Tailor Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: 5,
              rotateY: 5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-teal-500/20 to-green-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 8, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-gradient-to-br from-green-300/20 to-emerald-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsResumeTailorModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(16, 185, 129, 0.15)'
                }}
              >
                <Wand2 size={32} className="text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Resume Tailor
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                AI-powered resume customization for specific job postings
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* Cover Letter Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: 5,
              rotateY: -5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-500/20 to-violet-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-6 right-6 w-18 h-18 rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 10, 0],
                rotate: [0, 3, 0]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-violet-300/20 to-indigo-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsCoverLetterModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(99, 102, 241, 0.15)'
                }}
              >
                <FileUp size={32} className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Cover Letter
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Create compelling letters that showcase your unique value
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* Follow-up Email Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: -5,
              rotateY: 5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.25), 0 0 0 1px rgba(236, 72, 153, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 via-pink-500/20 to-fuchsia-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 8, 0]
              }}
              transition={{ 
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-5 right-5 w-16 h-16 rounded-full bg-gradient-to-br from-rose-300/30 to-pink-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 6, 0],
                rotate: [0, -4, 0]
              }}
              transition={{ 
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute bottom-6 left-5 w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-300/20 to-rose-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 8 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(236, 72, 153, 0.15)'
                }}
              >
                <Mail size={32} className="text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
                Follow-up Email
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Professional emails that increase response rates
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* LinkedIn Optimizer Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: 5,
              rotateY: -5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(14, 165, 233, 0.25), 0 0 0 1px rgba(14, 165, 233, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 via-blue-500/20 to-cyan-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -9, 0],
                rotate: [0, 6, 0]
              }}
              transition={{ 
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 right-4 w-17 h-17 rounded-full bg-gradient-to-br from-sky-300/30 to-blue-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 7, 0],
                rotate: [0, -2, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8
              }}
              className="absolute bottom-5 left-6 w-13 h-13 rounded-full bg-gradient-to-br from-cyan-300/20 to-sky-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsLinkedInModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -3 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(14, 165, 233, 0.15)'
                }}
              >
                <LinkIcon size={32} className="text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                LinkedIn Optimizer
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Enhance your profile to attract top recruiters
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* Career Research Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: -5,
              rotateY: -5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(245, 158, 11, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-orange-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -11, 0],
                rotate: [0, -7, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-6 right-5 w-15 h-15 rounded-full bg-gradient-to-br from-amber-300/30 to-yellow-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 9, 0],
                rotate: [0, 4, 0]
              }}
              transition={{ 
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute bottom-4 left-4 w-11 h-11 rounded-full bg-gradient-to-br from-orange-300/20 to-amber-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsCareerResearchModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 7 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(245, 158, 11, 0.15)'
                }}
              >
                <Search size={32} className="text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
                Career Research
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Explore salary data and insights for careers & companies
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* Mock Interview Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: 5,
              rotateY: 5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 via-purple-500/20 to-indigo-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 4, 0]
              }}
              transition={{ 
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-5 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-violet-300/30 to-purple-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 8, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 6.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.1
              }}
              className="absolute bottom-6 left-5 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-300/20 to-violet-400/20 blur-lg"
            ></motion.div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setIsMockInterviewModalOpen(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: -4 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(139, 92, 246, 0.15)'
                }}
              >
                <MessageSquare size={32} className="text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                Mock Interview
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Practice with AI-powered interview simulations
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>

          {/* Auto Apply Card */}
          <motion.div
            whileHover={{ 
              y: -12, 
              rotateX: -5,
              rotateY: 5,
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.05)" 
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative overflow-hidden rounded-3xl shadow-2xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-teal-600/20 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating orbs */}
            <motion.div 
              animate={{ 
                y: [0, -7, 0],
                rotate: [0, -6, 0]
              }}
              transition={{ 
                duration: 5.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-4 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-green-300/30 to-emerald-400/30 blur-xl"
            ></motion.div>
            <motion.div 
              animate={{ 
                y: [0, 11, 0],
                rotate: [0, 3, 0]
              }}
              transition={{ 
                duration: 6.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7
              }}
              className="absolute bottom-5 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-teal-300/20 to-green-400/20 blur-lg"
            ></motion.div>
            
            {/* Coming Soon Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-yellow-400/90 to-orange-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg">
              Coming Soon
            </div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"></div>
            
            <button
              onClick={() => setShowComingSoonPopup(true)}
              className="relative z-10 w-full h-full p-8 flex flex-col items-center text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300"
            >
              {/* Icon container with neumorphism */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 6 }}
                className="w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/30 group-hover:shadow-xl transition-all duration-300"
                style={{
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 8px 32px rgba(34, 197, 94, 0.15)'
                }}
              >
                <Download size={32} className="text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300" />
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Auto Apply
              </h3>
              <p className="text-sm text-center opacity-80 font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                Chrome extension to auto-fill job applications
              </p>
              
              {/* Subtle indicator */}
              <motion.div 
                initial={{ width: 0 }}
                whileHover={{ width: "2rem" }}
                className="mt-4 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
              ></motion.div>
            </button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isResumeTailorModalOpen && (
          <ResumeTailorModal
            isOpen={isResumeTailorModalOpen}
            onClose={() => setIsResumeTailorModalOpen(false)}
            onTailor={handleTailorResume}
            isLoading={isOptimizing}
          />
        )}

        {isCoverLetterModalOpen && (
          <CoverLetterModal
            isOpen={isCoverLetterModalOpen}
            onClose={() => setIsCoverLetterModalOpen(false)}
            onGenerate={generateCoverLetter}
            isLoading={isOptimizing}
          />
        )}

        {isEmailModalOpen && (
          <EmailModal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            onGenerate={generateEmailTemplate}
          />
        )}

        {isLinkedInModalOpen && (
          <LinkedInOptimizerModal
            isOpen={isLinkedInModalOpen}
            onClose={() => setIsLinkedInModalOpen(false)}
            onOptimize={handleLinkedInOptimize}
            isLoading={isOptimizing}
          />
        )}

        {isCareerResearchModalOpen && (
          <CareerResearchModal
            isOpen={isCareerResearchModalOpen}
            onClose={() => setIsCareerResearchModalOpen(false)}
          />
        )}

        {isMockInterviewModalOpen && (
          <MockInterviewModal
            isOpen={isMockInterviewModalOpen}
            onClose={() => setIsMockInterviewModalOpen(false)}
          />
        )}

        {isAutoApplyModalOpen && (
          <AutoApplyModal
            isOpen={isAutoApplyModalOpen}
            onClose={() => setIsAutoApplyModalOpen(false)}
          />
        )}

        {/* Coming Soon Popup for Auto Apply */}
        {showComingSoonPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowComingSoonPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Clock size={32} className="text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Auto Apply Coming Soon
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We're currently developing our Chrome extension to help you automatically fill out job applications. This feature will be available soon!
                </p>
                
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p>The Auto Apply extension will:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-left">
                    <li>Auto-fill applications with your resume data</li>
                    <li>Save you time on repetitive forms</li>
                    <li>Track your application progress</li>
                    <li>Work with major job platforms</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => {
                    // You could add waitlist functionality here
                    setShowComingSoonPopup(false);
                  }}
                  className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {tailoredResume && (
          <TailoredResumeModal
            content={tailoredResume}
            onClose={() => setTailoredResume(null)}
            onRegenerate={() => handleTailorResume(currentJobInfo, currentResumeContent)}
            onSave={() => {
              addActivity('resume', 'Saved tailored resume');
              setTailoredResume(null);
            }}
          />
        )}

        {optimizationResults && (
          <OptimizationResults
            results={optimizationResults}
            onClose={() => setOptimizationResults(null)}
            onRegenerate={regenerateLinkedInOptimization}
            isRegenerating={isOptimizing}
          />
        )}
      </AnimatePresence>

      {/* Results sections */}
      {coverLetter && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 relative overflow-hidden rounded-xl shadow-lg"
        >
          {/* Background and decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-200/50 dark:bg-indigo-600/20 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-purple-200/50 dark:bg-purple-600/20 blur-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 dark:bg-indigo-800/50 rounded-lg mr-4 shadow-sm">
                <FileUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Generated Cover Letter</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{coverLetter}</pre>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  try {
                    // Use the React-PDF based cover letter generator for text-based PDFs
                    const pdfBlob = await generateCoverLetterPDF(coverLetter);
                    
                    // Create a download link and trigger it
                    const url = URL.createObjectURL(pdfBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'cover-letter.pdf';
                    link.click();
                    
                    // Cleanup
                    URL.revokeObjectURL(url);
                    addActivity('resume', 'Saved cover letter as PDF');
                  } catch (error) {
                    console.error('Error generating PDF:', error);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg shadow-md flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Save as PDF
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(coverLetter);
                  addActivity('resume', 'Copied cover letter to clipboard');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy to Clipboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {emailTemplate && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 relative overflow-hidden rounded-xl shadow-lg"
        >
          {/* Background and decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-200/50 dark:bg-rose-600/20 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-pink-200/50 dark:bg-pink-600/20 blur-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-rose-100 dark:bg-rose-800/50 rounded-lg mr-4 shadow-sm">
                <Mail className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Generated Email Template</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-rose-100 dark:border-rose-800/30">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{emailTemplate}</pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(emailTemplate);
                  addActivity('resume', 'Copied email template to clipboard');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg shadow-md flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy to Clipboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      
      {tailoredResume && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 relative overflow-hidden rounded-xl shadow-lg"
        >
          {/* Background and decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-teal-200/50 dark:bg-teal-600/20 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-emerald-200/50 dark:bg-emerald-600/20 blur-2xl"></div>
          
          <div className="relative p-6">
            <div className="flex items-center mb-5">
              <div className="w-12 h-12 flex items-center justify-center bg-teal-100 dark:bg-teal-800/50 rounded-lg mr-4 shadow-sm">
                <Wand2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tailored Resume</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-teal-100 dark:border-teal-800/30">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300">{tailoredResume}</pre>
            </div>
            
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  navigator.clipboard.writeText(tailoredResume);
                  addActivity('resume', 'Copied tailored resume to clipboard');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg shadow-md flex items-center gap-2 hover:shadow-lg transition-shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy to Clipboard
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Preparation;