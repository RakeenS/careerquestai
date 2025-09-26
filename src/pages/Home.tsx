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
  Star,
  ArrowRight,
  Fingerprint,
  Users,
  TrendingUp,
  Sparkles,
  Play,
  Rocket,
  Globe,
  MessageSquare,
  BarChart3,
  Crown,
  Gauge
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

// Main features with videos (keeping existing videos)
const mainFeatures: Feature[] = [
  {
    icon: <Gauge className="w-8 h-8 text-emerald-400" />,
    title: "AI Resume Score & Optimization",
    description: "Get an instant ATS compatibility score and AI-powered optimization suggestions. Our advanced algorithms analyze your resume against job descriptions, identifying missing keywords and formatting issues that could cost you interviews.",
    videoUrl: "/score.mp4",
    benefits: [
      "Real-time ATS compatibility scoring",
      "Keyword gap analysis and suggestions",
      "Industry-specific optimization tips",
      "Professional formatting recommendations"
    ]
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-blue-400" />,
    title: "AI Interview Coach & Practice",
    description: "Master your interviews with our intelligent AI coach that simulates real interview scenarios. Get personalized feedback on your answers, body language, and communication style to boost your confidence.",
    videoUrl: "/mock.mp4",
    benefits: [
      "Realistic interview simulations",
      "Real-time feedback and scoring",
      "Industry-specific question banks",
      "Performance tracking over time"
    ]
  },
  {
    icon: <Wand2 className="w-8 h-8 text-purple-400" />,
    title: "Smart Resume Builder",
    description: "Create stunning, ATS-optimized resumes in minutes with our intelligent builder. Choose from premium templates and let AI suggest compelling content that highlights your unique value proposition.",
    videoUrl: "/opt.mp4",
    benefits: [
      "20+ premium ATS-friendly templates",
      "AI-powered content generation",
      "One-click formatting and styling",
      "Unlimited PDF downloads"
    ]
  }
];

// Additional features in bento grid layout
const additionalFeatures: Feature[] = [
  {
    icon: <Mail className="w-6 h-6 text-pink-400" />,
    title: "Smart Cover Letters",
    description: "Generate personalized cover letters that complement your resume perfectly. Our AI crafts compelling narratives that showcase your fit for each specific role.",
    imageUrl: "https://placehold.co/400x300/ec4899/ffffff?text=Cover+Letters",
    benefits: [
      "Job-specific customization",
      "Professional tone matching",
      "ATS-optimized formatting"
    ]
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-orange-400" />,
    title: "Application Tracker",
    description: "Stay organized with intelligent tracking that provides insights into your job search progress and success patterns.",
    imageUrl: "https://placehold.co/400x300/f97316/ffffff?text=Job+Tracker",
    benefits: [
      "Centralized application management",
      "Success rate analytics",
      "Follow-up reminders"
    ]
  },
  {
    icon: <Globe className="w-6 h-6 text-cyan-400" />,
    title: "LinkedIn Optimizer",
    description: "Transform your LinkedIn profile into a powerful career magnet with AI-optimized headlines, summaries, and skill recommendations.",
    imageUrl: "https://placehold.co/400x300/06b6d4/ffffff?text=LinkedIn+Pro",
    benefits: [
      "Profile optimization",
      "Keyword enhancement",
      "Professional branding"
    ]
  },
  {
    icon: <Briefcase className="w-6 h-6 text-indigo-400" />,
    title: "AI Job Matching",
    description: "Discover opportunities that align perfectly with your skills and career goals through intelligent job matching algorithms.",
    imageUrl: "https://placehold.co/400x300/6366f1/ffffff?text=Job+Match",
    benefits: [
      "Personalized job recommendations",
      "Skill-based matching",
      "Quality over quantity"
    ],
    comingSoon: true
  },
  {
    icon: <Rocket className="w-6 h-6 text-red-400" />,
    title: "Auto-Apply Assistant",
    description: "Let AI handle applications automatically with customized resumes and cover letters for each position.",
    imageUrl: "https://placehold.co/400x300/ef4444/ffffff?text=Auto+Apply",
    benefits: [
      "Automated submissions",
      "Custom applications",
      "Progress tracking"
    ],
    comingSoon: true
  },
  {
    icon: <Crown className="w-6 h-6 text-yellow-400" />,
    title: "Career Coaching",
    description: "Get personalized career guidance and strategic advice from our AI career coach to accelerate your professional growth.",
    imageUrl: "https://placehold.co/400x300/eab308/ffffff?text=AI+Coach",
    benefits: [
      "Personalized career roadmaps",
      "Skill development plans",
      "Industry insights"
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
      {/* Modern Hero Section with Bento Layout */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        {/* Enhanced background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-gray-900 to-gray-900"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl opacity-70 animate-pulse animation-delay-4000"></div>
          
          {/* Modern grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          {/* Hero content with modern layout */}
          <div className="text-center mb-16">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <Crown className="w-4 h-4 mr-2" />
              Trusted by 50,000+ professionals worldwide
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight"
            >
              <span className="text-white">AI-Powered</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Career Success
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Transform your job search with intelligent resume optimization, AI interview coaching, and personalized career guidance.
              <span className="block mt-2 text-emerald-400 font-bold text-xl">Everything is 100% FREE forever.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {user ? (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Rocket className="w-6 h-6 mr-3 relative z-10" />
                    <span className="relative z-10">Launch Your Career</span>
                    <ArrowRight className="w-6 h-6 ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <Link 
                    to="/signup"
                    className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Rocket className="w-6 h-6 mr-3 relative z-10" />
                    <span className="relative z-10">Start Free Today</span>
                    <ArrowRight className="w-6 h-6 ml-3 relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>
              
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#features"
                className="inline-flex items-center justify-center px-8 py-5 text-xl font-semibold text-gray-300 border-2 border-gray-600 rounded-2xl hover:border-emerald-500 hover:text-emerald-400 transition-all duration-300 backdrop-blur-sm"
              >
                <Play className="w-6 h-6 mr-3" />
                Watch Demo
              </motion.a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400"
            >
              <div className="flex items-center">
                <Check className="w-5 h-5 text-emerald-400 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-emerald-400 mr-2" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 text-emerald-400 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Bento Grid Hero Layout */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {/* Main dashboard preview - spans 2 columns */}
            <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">AI Resume Dashboard</h3>
                <div className="flex items-center text-emerald-400 text-sm font-medium">
                  <Gauge className="w-4 h-4 mr-1" />
                  Score: 94%
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-700">
                <img 
                  src={dashboardImage} 
                  alt="CareerQuestAI Dashboard" 
                  className="w-full h-auto" 
                />
              </div>
            </div>

            {/* Stats card */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-6 hover:border-emerald-500/40 transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">3x</div>
                <div className="text-emerald-400 font-medium mb-2">Faster Job Placement</div>
                <div className="text-sm text-gray-400">vs traditional methods</div>
              </div>
            </div>

            {/* Feature highlight 1 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-6 hover:border-blue-500/40 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Interview Coach</h3>
              <p className="text-gray-400 text-sm">Practice with realistic scenarios and get instant feedback</p>
            </div>

            {/* Feature highlight 2 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 hover:border-purple-500/40 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Wand2 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Builder</h3>
              <p className="text-gray-400 text-sm">Create ATS-optimized resumes with AI assistance</p>
            </div>
          </motion.div>
        </div>
        
        {/* Trusted by companies - Modern design */}
        <div className="relative border-t border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-slate-900/80 backdrop-blur-sm py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-emerald-400 text-lg font-bold mb-3">🚀 Join 50,000+ Successful Professionals</p>
              <p className="text-gray-300 text-base">Our users have landed positions at these leading companies</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
            >
              {["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix"].map((company, index) => (
                <motion.div
                  key={company}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group cursor-pointer"
                >
                  <div className="text-gray-400 font-bold text-xl group-hover:text-emerald-400 transition-colors duration-300 transform group-hover:scale-110">
                    {company}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-12"
            >
              <div className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-3 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-emerald-400 font-semibold">Start your success story today - completely FREE</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Modern Features Section with Isolated Components Layout */}
      <section id="features" className="py-32 bg-gradient-to-b from-gray-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Features
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
            >
              Everything You Need to
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Land Your Dream Job
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Powerful AI tools that work together to optimize your resume, prepare you for interviews, and accelerate your career growth
            </motion.p>
          </div>

          {/* Main Features with Videos - Isolated Components Layout */}
          <div className="space-y-32 mb-32">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}
              >
                {/* Feature Content */}
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {feature.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-gray-300 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                  >
                    Try {feature.title}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.button>
                </div>
                
                {/* Feature Demo - Isolated Components Style */}
                <div className="flex-1 relative">
                  <div className="relative">
                    {/* Main video container with modern styling */}
                    <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-t-3xl flex items-center px-6 border-b border-gray-600/50">
                        <div className="flex space-x-3">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="ml-auto text-gray-400 text-sm font-medium">
                          {feature.title}
                        </div>
                      </div>
                      
                      <div className="pt-4 rounded-2xl overflow-hidden">
                        <video 
                          src={feature.videoUrl}
                          className="w-full h-auto rounded-2xl shadow-lg"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      </div>
                    </div>
                    
                    {/* Floating UI elements - Isolated Components */}
                    <div className={`absolute ${index % 2 === 0 ? '-right-6 -top-6' : '-left-6 -top-6'} w-32 h-20`}>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="text-white text-sm font-bold">AI Powered</div>
                        <div className="text-emerald-100 text-xs">100% Free</div>
                      </div>
                    </div>
                    
                    <div className={`absolute ${index % 2 === 0 ? '-left-8 -bottom-8' : '-right-8 -bottom-8'} w-36 h-24`}>
                      <div className="bg-gray-800 border border-gray-600 rounded-2xl p-4 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="text-white text-xs font-medium">Live Demo</div>
                        </div>
                        <div className="text-gray-400 text-xs">Try it now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Features - Bento Grid Layout */}
          <div className="mb-20">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white text-center mb-12"
            >
              Plus Many More Powerful Tools
            </motion.h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-600">
                      {feature.icon}
                    </div>
                    
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300 flex items-center gap-2">
                      {feature.title}
                      {feature.comingSoon && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold px-2 py-1 rounded-full">
                          SOON
                        </span>
                      )}
                    </h4>
                    
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {feature.benefits.slice(0, 2).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button className="text-emerald-400 font-semibold inline-flex items-center group-hover:text-emerald-300 transition-colors">
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Modern Stats & Social Proof Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 to-gray-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Proven Results
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight"
            >
              Join 50,000+
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Success Stories
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Real professionals, real results. See why CareerQuestAI is the #1 choice for job seekers worldwide.
            </motion.p>
          </div>

          {/* Stats Grid with Modern Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 text-center hover:border-emerald-500/30 transition-all duration-500"
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/30">
                    <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      {stat.icon}
                    </div>
                  </div>
                  
                  <div className="text-4xl lg:text-5xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                    {stat.value}
                  </div>
                  
                  <div className="text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to Join Them?
                </h3>
                <p className="text-gray-300 mb-6">
                  Start your success story today - completely free, no strings attached
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
                  onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  {user ? 'Go to Dashboard' : 'Start Free Today'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified How It Works */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {processSteps.slice(0,3).map((step, index) => (
              <div key={step.step} className="bg-gray-800 p-6 rounded-xl">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
            ))}
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