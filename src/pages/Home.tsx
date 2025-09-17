import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import {
  Check,
  ChevronRight,
  Zap,
  Target,
  X,
  FileText,
  Briefcase,
  Wand2,
  Bot,
  Clock,
  Mail,
  Video,
  Blocks,
  Star,
  ArrowRight,
  Fingerprint,
  Users,
  Gift,
  TrendingUp,
  Shield,
  Sparkles,
  Brain,
  Award
} from 'lucide-react';

// Import images
import dashboardImage from '../assets/screenshots/dashboard.png';

// Feature interface
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  benefits: string[];
  comingSoon?: boolean;
}

// Testimonials data (currently unused but kept for future reference)
// @ts-ignore - Keeping this data for potential future use
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "CareerQuestAI completely transformed my job search. The AI-generated resume got me more interviews in two weeks than I had in the previous three months!",
    increase: "300% more interviews"
  },
  {
    name: "David Chen",
    role: "Software Engineer",
    company: "InnovateSoft",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "The interview prep feature is amazing. It predicted 80% of the questions I was asked and helped me prepare perfect answers tailored to each company.",
    increase: "Offer accepted in 3 weeks"
  },
  {
    name: "Aisha Patel",
    role: "Marketing Specialist",
    company: "GrowthLabs",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "I was switching careers and struggling with how to position myself. The AI coach helped me identify transferable skills and articulate my value proposition.",
    increase: "Career transition success"
  }
];

// Stats data
const stats = [
  {
    value: "87%",
    label: "Higher Interview Rate",
    icon: <Target className="w-8 h-8" />
  },
  {
    value: "2.5x",
    label: "Faster Job Placement",
    icon: <Zap className="w-8 h-8" />
  },
  {
    value: "94%",
    label: "User Satisfaction",
    icon: <Star className="w-8 h-8" />
  },
  {
    value: "100%",
    label: "AI-Powered",
    icon: <Users className="w-8 h-8" />
  }
];

// Process Steps
const processSteps = [
  {
    step: 1,
    title: "Create Your Profile",
    description: "Sign up and enter your career goals, experience, and skill sets. Our AI analyzes your background to create a personalized career strategy.",
    icon: <Fingerprint className="w-6 h-6" />
  },
  {
    step: 2,
    title: "Build Your Professional Brand",
    description: "Our AI generates tailored resumes and cover letters for each job application, optimizing them for ATS systems and human recruiters alike.",
    icon: <FileText className="w-6 h-6" />
  },
  {
    step: 3,
    title: "Prepare With AI Interview Coach",
    description: "Practice industry-specific interview questions with our AI coach that provides real-time feedback on your answers and communication style.",
    icon: <Bot className="w-6 h-6" />
  },
  {
    step: 4,
    title: "Apply With Confidence",
    description: "Get matched with job opportunities that align with your skills and preferences. Apply with tailored applications that highlight your strengths.",
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    step: 5,
    title: "Track Your Progress",
    description: "Monitor your application status and receive AI-powered insights on how to improve your strategy and increase your chances of success.",
    icon: <Clock className="w-6 h-6" />
  }
];

// FAQ Items
const faqItems = [
  {
    question: "How does CareerQuestAI use artificial intelligence?",
    answer: "CareerQuestAI leverages advanced machine learning algorithms to analyze your background, the job market, and specific job requirements. Our AI customizes resumes and cover letters that are optimized for both ATS systems and human recruiters, provides personalized interview coaching, and delivers strategic career guidance based on your unique profile and goals."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We take data privacy extremely seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. You maintain full control over your information, and our systems comply with GDPR, CCPA, and other privacy regulations."
  },
  {
    question: "Can I use CareerQuestAI for career transitions?",
    answer: "Yes! CareerQuestAI is especially powerful for career transitions. Our system identifies transferable skills, helps you articulate your value proposition for new industries, and guides you on acquiring relevant qualifications. We've helped thousands of professionals successfully pivot to new career paths."
  },
  {
    question: "How much does the service cost?",
    answer: "CareerQuestAI is completely free! We've removed all paid plans and premium features, making all tools and services available to everyone at no cost."
  },
  {
    question: "How soon can I expect results?",
    answer: "While results vary based on your field, experience level, and the job market, our users typically see a significant increase in interview invitations within the first 2-3 weeks. The full job search process with CareerQuestAI is on average 40% faster than traditional methods."
  }
];

// Feature data with more detailed descriptions
const features: Feature[] = [
  {
    icon: <Wand2 className="w-6 h-6 text-blue-500" />,
    title: "AI Resume Optimization",
    description: "Our advanced AI analyzes your resume against job descriptions, optimizing content and formatting to increase your interview chances by up to 70%. We identify missing keywords, suggest improvements, and ensure your resume passes through Applicant Tracking Systems.",
    videoUrl: "/score.mp4",
    benefits: [
      "Keyword optimization for ATS systems",
      "Tailored content suggestions for each job",
      "Professional formatting recommendations"
    ]
  },
  {
    icon: <Bot className="w-6 h-6 text-purple-500" />,
    title: "AI Interview Coach",
    description: "Practice with our intelligent AI interviewer that adapts to your responses, providing real-time feedback and personalized improvement suggestions. Prepare for behavioral, technical, and situational questions across different industries.",
    videoUrl: "/mock.mp4",
    benefits: [
      "Real-time feedback on your responses",
      "Industry-specific question preparation",
      "Body language and tone analysis"
    ]
  },
  {
    icon: <FileText className="w-6 h-6 text-green-500" />,
    title: "Smart Resume Builder",
    description: "Create ATS-friendly resumes with our intelligent builder featuring modern templates and real-time optimization suggestions. Our AI helps you craft compelling descriptions, highlight relevant skills, and format your resume professionally.",
    videoUrl: "/opt.mp4",
    benefits: [
      "Modern, professionally designed templates",
      "AI-powered content suggestions",
      "One-click formatting options"
    ]
  },
  {
    icon: <Mail className="w-6 h-6 text-pink-500" />,
    title: "Follow-up Generator",
    description: "Generate perfectly timed and professionally crafted follow-up emails for every stage of your job search journey. Our templates help you strike the right tone whether you're thanking an interviewer or checking on your application status.",
    imageUrl: "https://placehold.co/600x400/4f46e5/ffffff?text=Email+Generator",
    benefits: [
      "Context-aware email templates",
      "Timing recommendations",
      "Professional tone customization"
    ]
  },
  {
    icon: <Video className="w-6 h-6 text-indigo-500" />,
    title: "Mock Interviews",
    description: "Simulate real interview scenarios with industry-specific questions and receive detailed performance analytics. Practice technical, behavioral, and case interviews with personalized feedback to help you improve.",
    imageUrl: "https://placehold.co/600x400/4f46e5/ffffff?text=Mock+Interview",
    benefits: [
      "Industry-tailored interview simulations",
      "Performance metrics and insights",
      "Improvement tracking over time"
    ]
  },
  {
    icon: <Blocks className="w-6 h-6 text-orange-500" />,
    title: "Job Application Tracker",
    description: "Stay organized with our intelligent tracking system that provides insights and reminders for your job applications. Never miss a follow-up or deadline, and gain insights into your application success patterns.",
    imageUrl: "https://placehold.co/600x400/4f46e5/ffffff?text=Job+Tracker",
    benefits: [
      "Centralized application management",
      "Smart follow-up reminders",
      "Success rate analytics"
    ]
  },
  {
    icon: <Briefcase className="w-6 h-6 text-cyan-500" />,
    title: "AI Job Board",
    description: "Discover your dream career with our intelligent job board that uses AI to match you with positions perfectly aligned to your skills and career goals. Get personalized job recommendations that have the highest likelihood of success.",
    imageUrl: "https://placehold.co/600x400/0ea5e9/ffffff?text=AI+Job+Board",
    benefits: [
      "AI-powered job matching",
      "Personalized recommendations",
      "Quality over quantity approach"
    ],
    comingSoon: true
  },
  {
    icon: <Zap className="w-6 h-6 text-purple-500" />,
    title: "AI Auto Apply",
    description: "Let our AI handle your job applications automatically. Our groundbreaking technology analyzes job postings, customizes your application materials, and submits applications on your behalf to positions matching your preferences.",
    imageUrl: "https://placehold.co/600x400/8b5cf6/ffffff?text=AI+Auto+Apply",
    benefits: [
      "Automated application submission",
      "Custom cover letters for each position",
      "Application tracking and status updates"
    ],
    comingSoon: true
  }
];

const Home: React.FC = () => {
  // Get user authentication state
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // One unified home page for everyone
  return (
    <>
      <SEO 
        title="CareerQuestAI - AI-Powered Resume Builder & Career Tools"
        description="Create ATS-friendly resumes with AI, practice interviews, track job applications, and accelerate your career with CareerQuestAI. Free AI-powered career tools for job seekers."
        keywords="AI resume builder, ATS resume, career tools, job search, interview preparation, resume optimization, AI career assistant, job tracker, professional resume, free resume builder"
        url="https://careerquestai.vercel.app/"
        type="website"
      />
      <div className="bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500/20 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[center_top_-1px] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col lg:flex-row items-center gap-12">
          {/* Hero content */}
          <div className="flex-1 text-center lg:text-left max-w-3xl">


            {/* FREE Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg"
            >
              <Gift className="w-4 h-4 mr-2" />
              🎉 100% FREE - No Credit Card Required
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
            >
              <span className="text-white">Land Your Dream Job </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                3x Faster
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto lg:mx-0"
            >
              Get AI-powered resume optimization, interview coaching, and job matching - 
              <span className="text-green-400 font-bold"> completely FREE forever</span>
            </motion.p>

            {/* Value proposition bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8 text-sm text-gray-300"
            >
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>No time limits</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-400 mr-2" />
                <span>All premium features</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {user ? (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Access Your Free Tools
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <Link 
                    to="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start FREE Now - No Card Required
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Link>
                )}
              </motion.div>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#features"
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl border-2 border-green-500 text-green-400 font-semibold hover:bg-green-500 hover:text-white transition-all duration-300"
              >
                See Why It's FREE
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.a>
            </motion.div>

            {/* Urgency/Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center lg:text-left"
            >
              <p className="text-sm text-gray-400 mb-2">
                ⚡ Join 50,000+ job seekers who landed their dream jobs
              </p>
              <p className="text-xs text-green-400 font-semibold">
                🔥 Limited time: All premium features FREE forever
              </p>
            </motion.div>
          </div>

          {/* Hero image/preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 relative mt-8 lg:mt-0"
          >
            <div className="relative mx-auto max-w-md">
              {/* Mock device frame */}
              <div className="rounded-2xl shadow-2xl bg-gray-800 border border-gray-700 p-1 overflow-hidden">
                <div className="rounded-xl overflow-hidden border border-gray-700">
                  <img 
                    src={dashboardImage} 
                    alt="CareerQuestAI Dashboard" 
                    className="w-full h-auto" 
                  />
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -bottom-6 -left-12 md:-left-16 w-32 md:w-40 h-auto">
                <div className="bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-700 transform rotate-[-8deg]">
                  <div className="flex items-center">
                    <Zap className="text-yellow-500 w-4 h-4" />
                    <div className="ml-2 text-sm font-medium text-white">Resume Score: 92%</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-8 -right-6 md:-right-12 w-32 md:w-40 h-auto">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-3 shadow-lg border border-green-500 transform rotate-[5deg]">
                  <div className="flex items-center">
                    <Gift className="text-white w-4 h-4" />
                    <div className="ml-2 text-sm font-bold text-white">100% FREE!</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Trusted by companies */}
        <div className="relative border-t border-gray-800 bg-gray-900/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-green-400 text-sm font-bold mb-2">🎯 50,000+ PROFESSIONALS LANDED JOBS FOR FREE</p>
              <p className="text-gray-400 text-sm font-medium">Used by job seekers at leading companies worldwide</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
              {["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix"].map((company) => (
                <div key={company} className="text-gray-500 font-bold text-xl hover:text-green-400 transition-colors">
                  {company}
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-green-400 text-sm font-semibold">
                💡 They all started with our FREE tools - just like you can!
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-400 font-semibold uppercase tracking-wide"
            >
              Powerful Features
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-4xl font-extrabold text-white mb-4"
            >
              Supercharge Your Job Search
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Everything you need to land your dream job, powered by cutting-edge AI that adapts to your unique skills and career goals
            </motion.p>
          </div>

          <div className="space-y-24">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}
              >
                {/* Feature description */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900/30 text-blue-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {feature.title}
                    {feature.comingSoon && (
                      <span className="text-xs bg-yellow-500 text-yellow-900 font-bold px-2 py-0.5 rounded-full ml-2">
                        COMING SOON
                      </span>
                    )}
                  </h3>
                  <p className="text-lg text-gray-300">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 shrink-0" />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Feature screenshot */}
                <div className="flex-1">
                  <div className="relative rounded-2xl shadow-2xl bg-gray-800 p-2 border border-gray-700">
                    <div className="absolute top-0 left-0 w-full h-8 bg-gray-700 rounded-t-2xl flex items-center px-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="pt-8 pb-2 overflow-hidden rounded-2xl">
                      {feature.videoUrl ? (
                        <video 
                          src={feature.videoUrl}
                          className="w-full h-auto rounded-lg"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img 
                          src={feature.imageUrl} 
                          alt={feature.title}
                          className="w-full h-auto rounded-lg"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            e.currentTarget.src = `https://placehold.co/800x450/4f46e5/ffffff?text=${encodeURIComponent(feature.title)}`;
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* More features in grid layout */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.slice(3).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-500"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                  {feature.title}
                  {feature.comingSoon && (
                    <span className="text-xs bg-yellow-500 text-yellow-900 font-bold px-2 py-0.5 rounded-full ml-2 transform group-hover:scale-105 transition-transform duration-300">
                      COMING SOON
                    </span>
                  )}
                </h3>
                <p className="text-gray-300 mb-4">
                  {feature.description.split('.')[0] + '.'}
                </p>
                <div className="mt-auto flex justify-end">
                  <button className="text-blue-400 font-medium inline-flex items-center">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-400 font-semibold uppercase tracking-wide"
            >
              Success Stories
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-4xl font-extrabold text-white mb-4"
            >
              From Our Community
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Join thousands of professionals who have accelerated their careers with our AI-powered tools
            </motion.p>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl shadow-lg p-6 text-center border border-gray-700"
              >
                <div className="flex justify-center mb-4 text-blue-400">
                  {stat.icon}
                </div>
                <div className="text-3xl font-extrabold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-400 font-semibold uppercase tracking-wide"
            >
              The Process
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-4xl font-extrabold text-white mb-4"
            >
              How CareerQuestAI Works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              A seamless journey from profile creation to landing your dream job
            </motion.p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-900/50 transform -translate-x-1/2 hidden md:block"></div>
            
            <div className="space-y-16 relative">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
                >
                  {/* Step content */}
                  <div className="flex-1 order-2 md:order-none">
                    <div className={`p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                      <h3 className="text-xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Step icon */}
                  <div className="flex-shrink-0 z-10 order-1 md:order-none">
                    <div className="w-16 h-16 bg-gray-800 rounded-full shadow-lg flex items-center justify-center border-4 border-blue-900/50">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        {step.icon}
                      </div>
                    </div>
                    {/* Step number */}
                    <div className="absolute top-0 left-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-6 -translate-y-1">
                      {step.step}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-20 bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-green-400 font-semibold uppercase tracking-wide"
            >
              🔥 COMPLETELY FREE FOREVER
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-4xl md:text-5xl font-extrabold text-white mb-4"
            >
              Why Pay $100s When It's <span className="text-green-400">FREE?</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Other platforms charge $29-99/month for these features. We believe everyone deserves access to career success tools - <span className="text-green-400 font-bold">no strings attached</span>
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Single Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-green-500/30 flex flex-col relative"
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-8 py-3 rounded-b-lg shadow-lg animate-pulse">
                  🎉 100% FREE FOREVER - NO CATCH!
                </div>
              </div>
              <div className="p-8 pt-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-b border-green-500/30 text-center">
                <h3 className="text-4xl font-bold text-white mb-6">Everything You Need</h3>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-6xl font-extrabold text-green-400 mb-2">$0</div>
                    <div className="text-gray-400 line-through text-xl mb-1">Competitors: $29-99/month</div>
                    <div className="text-green-400 font-bold text-xl">You Pay: NOTHING</div>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <p className="text-green-300 font-semibold">
                    ✅ No credit card required<br/>
                    ✅ No hidden fees ever<br/>
                    ✅ No time limits<br/>
                    ✅ Cancel anytime (but why would you?)
                  </p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-4">Resume Tools</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">AI Resume Optimization</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">All Premium Templates</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">ATS Compatibility Analysis</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Unlimited PDF Downloads</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-4">Career Tools</h4>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">AI Cover Letter Generator</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">LinkedIn Profile Optimizer</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Interview Preparation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Job Application Tracking</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/50">
                  <div className="text-center">
                    <div className="text-green-300 font-bold text-lg mb-2">
                      🚀 Ready to 3x Your Job Search Success?
                    </div>
                    <div className="text-green-400 text-sm">
                      ✅ Setup takes 2 minutes • ✅ No payment info needed • ✅ Start immediately
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-5 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:shadow-2xl"
                      onClick={() => navigate('/dashboard')}
                    >
                      🎯 Access Your FREE Tools Now
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-5 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:shadow-2xl"
                      onClick={() => navigate('/signup')}
                    >
                      🎯 Get FREE Access Now - No Card Required
                    </motion.button>
                  )}
                  <p className="text-center text-green-400 text-sm mt-3 font-semibold">
                    ⚡ Join 50,000+ successful job seekers • Takes 30 seconds
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-lg">Questions about our platform? <a href="#" className="text-blue-400 hover:underline">Contact us</a> for more information.</p>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-green-400 font-semibold uppercase tracking-wide"
            >
              "Is This Really FREE?" & Other Questions
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-2 text-4xl font-extrabold text-white mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Everything you need to know about our platform
            </motion.p>
          </div>

          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-700"
              >
                <button
                  className="w-full px-6 py-5 flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-lg font-medium text-white text-left">
                    {faq.question}
                  </h3>
                  <ChevronRight
                    className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${
                      expandedFaq === index ? 'transform rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-5">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-300"
                    >
                      {faq.answer}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">CareerQuestAI</h3>
              <p className="text-sm">Accelerate your career journey with AI</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p> &copy; {new Date().getFullYear()} CareerQuestAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Already Signed Up Notification */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 max-w-md w-full"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-white">Already Signed Up!</h3>
                  <div className="mt-1 text-sm text-gray-300">
                    You're already logged in and have access to all the premium features.
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => setShowNotification(false)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </>
  );
};

export default Home;