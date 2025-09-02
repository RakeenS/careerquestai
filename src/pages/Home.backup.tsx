import React, { useState } from 'react';
import { 
  FileUp, FilePlus, Briefcase, Brain, Wand2, Shield, 
  Zap, Sparkles, Target, ChevronRight, Award, Users,
  PenTool, Bot, LineChart, BookOpen, Rocket, Check,
  Clock, FileText, Mail, Video, Blocks, Star, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import WaitlistModal from '../components/WaitlistModal';

const features = [
  {
    icon: <Wand2 className="w-6 h-6 text-blue-500" />,
    title: "AI Resume Optimization",
    description: "Our advanced AI analyzes your resume against job descriptions, optimizing content and formatting to increase your interview chances by up to 70%."
  },
  {
    icon: <Bot className="w-6 h-6 text-purple-500" />,
    title: "AI Interview Coach",
    description: "Practice with our intelligent AI interviewer that adapts to your responses, providing real-time feedback and personalized improvement suggestions."
  },
  {
    icon: <FileText className="w-6 h-6 text-green-500" />,
    title: "Smart Resume Builder",
    description: "Create ATS-friendly resumes with our intelligent builder featuring modern templates and real-time optimization suggestions."
  },
  {
    icon: <Mail className="w-6 h-6 text-pink-500" />,
    title: "Follow-up Generator",
    description: "Generate perfectly timed and professionally crafted follow-up emails for every stage of your job search journey."
  },
  {
    icon: <Video className="w-6 h-6 text-indigo-500" />,
    title: "Mock Interviews",
    description: "Simulate real interview scenarios with industry-specific questions and receive detailed performance analytics."
  },
  {
    icon: <Blocks className="w-6 h-6 text-orange-500" />,
    title: "Job Application Tracker",
    description: "Stay organized with our intelligent tracking system that provides insights and reminders for your job applications."
  }
];

const Home: React.FC = () => {
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-300/30 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/30 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300/30 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full"
            >
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Limited Time Beta Access Available</span>
            </motion.div>

            <motion.h1 
              className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Your Career Journey
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Powered by AI</span>
            </motion.h1>

            <motion.p 
              className="text-xl mb-12 text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Transform your job search with AI-powered resume optimization, interview preparation, and personalized career guidance. Join thousands of successful professionals who've accelerated their careers with CareerQuestAI.
            </motion.p>
            
            <motion.div
              className="space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWaitlistModalOpen(true)}
                className="inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
              >
                <Rocket className="mr-2" />
                Join the Waitlist
                <ChevronRight className="ml-2" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Supercharge Your Job Search
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Everything you need to land your dream job, powered by cutting-edge AI
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-500 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Resume",
                description: "Upload your existing resume or create a new one using our AI-powered builder",
                icon: <FileUp className="w-8 h-8" />
              },
              {
                step: "02",
                title: "AI Enhancement",
                description: "Our AI analyzes and optimizes your resume for your target roles",
                icon: <Wand2 className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Land Interviews",
                description: "Apply with confidence using your optimized resume and ace your interviews",
                icon: <Target className="w-8 h-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-4 left-4 bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded-full">
                    {item.step}
                  </div>
                  <div className="mb-6 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-500 dark:text-blue-400">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-lg">
              <h2 className="text-4xl font-bold text-white mb-4">
                Limited Time Beta Access
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join now to lock in exclusive benefits forever:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: <Zap />, text: "50% Lifetime Discount" },
                  { icon: <Sparkles />, text: "Early Feature Access" },
                  { icon: <Shield />, text: "Priority Support" }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-lg rounded-lg p-4 flex flex-col items-center"
                  >
                    <div className="text-white mb-2">
                      {benefit.icon}
                    </div>
                    <span className="text-white text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setIsWaitlistModalOpen(true)}
                  className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                >
                  <Clock className="mr-2" />
                  Join Waitlist Now
                  <ChevronRight className="ml-2" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <WaitlistModal 
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </div>
  );
};

export default Home;
