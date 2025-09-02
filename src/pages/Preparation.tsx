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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Resume Tailor Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(66, 153, 225, 0.15), 0 10px 10px -5px rgba(66, 153, 225, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsResumeTailorModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <Wand2 size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Tailor</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Customize your resume for specific job postings
              </p>
            </button>
          </motion.div>

          {/* Cover Letter Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(104, 211, 145, 0.15), 0 10px 10px -5px rgba(104, 211, 145, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsCoverLetterModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <FileUp size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cover Letter</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Create compelling letters that showcase your value
              </p>
            </button>
          </motion.div>

          {/* Follow-up Email Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(236, 72, 153, 0.15), 0 10px 10px -5px rgba(236, 72, 153, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <Mail size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Follow-up Email</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Professional emails that increase response rates
              </p>
            </button>
          </motion.div>

          {/* LinkedIn Optimizer Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(251, 191, 36, 0.15), 0 10px 10px -5px rgba(251, 191, 36, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsLinkedInModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <LinkIcon size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">LinkedIn Optimizer</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Enhance your profile to attract recruiters
              </p>
            </button>
          </motion.div>

          {/* Career Research Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsCareerResearchModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <Search size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Career Research</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Explore salary data and insights for careers or companies
              </p>
            </button>
          </motion.div>

          {/* Mock Interview Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.15), 0 10px 10px -5px rgba(79, 70, 229, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setIsMockInterviewModalOpen(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <MessageSquare size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mock Interview</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Practice with AI-powered interview simulations
              </p>
            </button>
          </motion.div>

          {/* Auto Apply Card */}
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(5, 150, 105, 0.15), 0 10px 10px -5px rgba(5, 150, 105, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative overflow-hidden rounded-xl shadow-lg"
          >
            {/* Card background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-90"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-56 h-56 rounded-full bg-white opacity-10"></div>
            
            <button
              onClick={() => setShowComingSoonPopup(true)}
              className="relative z-10 w-full h-full p-6 flex flex-col items-center text-white"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm rounded-xl shadow-inner">
                <Download size={30} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Auto Apply</h3>
              <p className="text-sm text-center opacity-90 font-light">
                Chrome extension to auto-fill job applications
              </p>
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