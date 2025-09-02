import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  User, 
  Database, 
  Globe, 
  Bell, 
  RefreshCw,
  Cookie,
  ExternalLink,
  Eye,
  FileText
} from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  // Animation variants
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
    <div className="bg-white dark:bg-gray-900 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              How we collect, use, and protect your information
            </p>
            <div className="mt-6 flex justify-center">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Introduction */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="prose prose-lg dark:prose-invert max-w-none mb-16"
        >
          <motion.p variants={itemVariants} className="lead text-gray-600 dark:text-gray-300">
            At CareerQuestAI, we value your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            Please read this policy carefully to understand our practices regarding your personal data.
          </motion.p>
        </motion.div>

        {/* Policy Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Information We Collect */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We collect several types of information from and about users of our platform:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and other contact details you provide when creating an account or using our services.</li>
                    <li><strong>Professional Information:</strong> Resume data, employment history, education background, skills, and other career-related information you provide or that is generated through our services.</li>
                    <li><strong>Usage Data:</strong> Information about how you use our platform, including features accessed, time spent, and interaction with content.</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, device information, operating system, and other technology identifiers when you access our platform.</li>
                    <li><strong>User Feedback:</strong> Responses to surveys, testimonials, and feedback about our services.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How We Use Your Information */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We use the information we collect for various purposes, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Providing and personalizing our career development services</li>
                    <li>Training our AI models to improve resume suggestions and interview preparation</li>
                    <li>Processing your transactions and managing your account</li>
                    <li>Sending you service-related notifications and updates</li>
                    <li>Communicating with you about new features, offers, and improvements</li>
                    <li>Analyzing usage patterns to enhance user experience</li>
                    <li>Detecting and preventing fraudulent activities</li>
                    <li>Complying with legal obligations</li>
                  </ul>
                  <p>
                    We process your data based on your consent, our legitimate interests, contractual necessity, or legal obligations.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Sharing and Disclosure */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Sharing and Disclosure</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (payment processing, cloud hosting, analytics).</li>
                    <li><strong>Business Partners:</strong> Trusted companies we collaborate with to offer integrated services (with your consent).</li>
                    <li><strong>Legal Authorities:</strong> When required by law, court order, or governmental regulation.</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, where your data would be among the transferred assets.</li>
                  </ul>
                  <p>
                    We do not sell your personal information to third parties. When we share data with service providers, we ensure they use appropriate security measures to protect your information.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Security */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Security</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Encryption of sensitive data during transmission and storage</li>
                    <li>Regular security assessments and vulnerability testing</li>
                    <li>Access controls and authentication procedures</li>
                    <li>Staff training on data protection and security practices</li>
                    <li>Incident response plans for potential data breaches</li>
                  </ul>
                  <p>
                    While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Your Privacy Rights */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Privacy Rights</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Depending on your location, you may have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information in certain circumstances.</li>
                    <li><strong>Restriction:</strong> Request limitation on how we use your data in certain circumstances.</li>
                    <li><strong>Portability:</strong> Request transfer of your data to you or a third party in a structured, commonly used format.</li>
                    <li><strong>Objection:</strong> Object to processing of your personal data based on legitimate interests.</li>
                    <li><strong>Consent Withdrawal:</strong> Withdraw consent at any time where we rely on consent to process your data.</li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us using the details provided at the end of this policy. We will respond to your request within the timeframe required by applicable law.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cookies and Tracking Technologies */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                <Cookie className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookies and Tracking Technologies</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our platform:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Essential Cookies:</strong> Required for the operation of our platform, such as session management and security.</li>
                    <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our platform by collecting anonymous information.</li>
                    <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization.</li>
                    <li><strong>Targeting Cookies:</strong> Record your visit to our platform, pages visited, and links followed to deliver relevant advertisements.</li>
                  </ul>
                  <p>
                    You can set your browser to refuse all or some browser cookies or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of our platform may become inaccessible or not function properly.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Third-Party Services */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <ExternalLink className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Third-Party Services</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Our platform may include links to third-party websites, plugins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                  </p>
                  <p>
                    We encourage you to read the privacy notice of every website you visit when you leave our platform. These third-party services include:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Analytics providers (such as Google Analytics)</li>
                    <li>Payment processors</li>
                    <li>Authentication services</li>
                    <li>Cloud storage providers</li>
                    <li>Customer support services</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Retention */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Retention</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, including:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>While your account is active</li>
                    <li>As needed to provide you with our services</li>
                    <li>As necessary to comply with legal obligations</li>
                    <li>As needed to resolve disputes and enforce our agreements</li>
                  </ul>
                  <p>
                    When we no longer need to use your personal information, we will either delete it or anonymize it so that it can no longer be associated with you. In some cases, we may retain certain information in anonymized or aggregated form.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Children's Privacy */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we learn we have collected or received personal information from a child under 18 without verification of parental consent, we will delete that information.
                  </p>
                  <p>
                    If you believe we might have any information from or about a child under 18, please contact us using the contact information provided below.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Changes to Privacy Policy */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <RefreshCw className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Privacy Policy</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                  </p>
                  <p>
                    We will provide more prominent notice of material changes, which may include email notification for significant updates. We encourage you to review this Privacy Policy periodically for any changes.
                  </p>
                  <p>
                    Your continued use of our platform after any modifications to the Privacy Policy constitutes your acknowledgment of the changes and your consent to abide and be bound by the modified Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact Information */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Contact Us</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <p>
                    <strong>Email:</strong> privacy@careerquestai.com
                  </p>
                  <p>
                    <strong>Mail:</strong> CareerQuestAI Privacy Team<br/>
                    123 AI Plaza<br/>
                    San Francisco, CA 94105<br/>
                    United States
                  </p>
                  <p>
                    We will respond to your inquiry as soon as possible and within the timeframe required by applicable law.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* Final Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-xl">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              By using CareerQuestAI, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 