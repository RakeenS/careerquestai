import { useNavigate } from 'react-router-dom';
import { Check, Gift, Star } from 'lucide-react';

const Premium = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full inline-flex mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            All Premium Features Are FREE!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            For a limited time, enjoy unlimited access to all our AI-powered career tools
          </p>
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="font-semibold text-green-800 dark:text-green-300">
                Limited Time Offer
              </span>
            </div>
            <p className="text-green-700 dark:text-green-400 text-sm">
              No payment required • No credit card needed • Full access to all features
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            What You Get For FREE
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FeatureItem text="AI Resume Optimization" />
            <FeatureItem text="ATS Compatibility Analysis" />
            <FeatureItem text="Unlimited Resume Downloads" />
            <FeatureItem text="AI Cover Letter Generation" />
            <FeatureItem text="LinkedIn Profile Optimization" />
            <FeatureItem text="Interview Preparation Tools" />
            <FeatureItem text="Job Application Tracking" />
            <FeatureItem text="Multiple Resume Templates" />
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full max-w-md py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
          >
            Start Using Premium Features Now
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            No signup required to start • Create account to save your work
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component for the feature list
const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <span className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
    </span>
    <span className="text-gray-700 dark:text-gray-300 font-medium">{text}</span>
  </div>
);

export default Premium;