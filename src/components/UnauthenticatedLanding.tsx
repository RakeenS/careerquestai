import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Zap, 
  Target, 
  Check, 
  ArrowRight, 
  Gift, 
  Star, 
  TrendingUp,
  Shield,
  Sparkles,
  Brain,
  Briefcase,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

const UnauthenticatedLanding: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-20"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                <FileText className="relative h-20 w-20 text-white" />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                CareerQuestAI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your AI-powered career companion that transforms job hunting from a chore into a 
              <span className="text-emerald-400 font-semibold"> strategic advantage</span>
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div variants={itemVariants} className="flex items-center justify-center space-x-12 mb-12 text-gray-400">
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
              <span>85% Success Rate</span>
            </div>
          </motion.div>

          {/* Free Offer Banner */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 rounded-3xl shadow-2xl mb-16 max-w-4xl mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  All Premium Features FREE!
                </h2>
              </div>
              <p className="text-xl text-white/90 mb-6">
                Limited time offer: Get unlimited access to all AI-powered career tools at no cost
              </p>
              <div className="flex items-center justify-center space-x-6 text-white/80">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Setup in 30s</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span>Full Access</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Resume Builder</h3>
            <p className="text-gray-300 leading-relaxed">
              Create professional resumes with advanced AI optimization, ATS compatibility analysis, and industry-specific recommendations
            </p>
            <div className="mt-6 flex items-center text-blue-400 font-semibold">
              <span>Learn more</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Smart Job Tracking</h3>
            <p className="text-gray-300 leading-relaxed">
              Keep track of applications, interviews, and follow-ups with intelligent reminders and analytics to optimize your job search
            </p>
            <div className="mt-6 flex items-center text-emerald-400 font-semibold">
              <span>Learn more</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="group bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
          >
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Interview Mastery</h3>
            <p className="text-gray-300 leading-relaxed">
              Practice with AI-powered mock interviews, get personalized feedback, and build confidence for any interview scenario
            </p>
            <div className="mt-6 flex items-center text-purple-400 font-semibold">
              <span>Learn more</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </motion.div>

        {/* Features List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-lg p-12 rounded-3xl border border-white/10 max-w-6xl mx-auto mb-20"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Everything You Need to Land Your Dream Job
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[
                'AI Resume Optimization',
                'ATS Compatibility Analysis',
                'Multiple Professional Templates',
                'Unlimited PDF Downloads'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center group"
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg text-gray-200 group-hover:text-white transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                'AI Cover Letter Generator',
                'Job Application Tracking',
                'Interview Preparation Tools',
                'LinkedIn Profile Optimization'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center group"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full mr-4 group-hover:scale-110 transition-transform">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg text-gray-200 group-hover:text-white transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-5xl font-bold text-white mb-6"
          >
            Ready to Transform Your Career?
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Join thousands of professionals who've already accelerated their careers with CareerQuestAI. 
            Your dream job is just one click away.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="space-y-6 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
            >
              <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
              Start Your Career Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/login"
              className="inline-flex items-center px-10 py-5 bg-white/10 backdrop-blur-lg text-white font-semibold text-xl rounded-2xl border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
            >
              Already have an account? Sign In
            </Link>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="mt-8 flex items-center justify-center space-x-8 text-gray-400"
          >
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-400" />
              <span>100% Free</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-400" />
              <span>Setup in 30 seconds</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
              <span>No credit card required</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthenticatedLanding;