import React from 'react';
import { motion } from 'framer-motion';
import { 
  File, 
  User, 
  AlertTriangle, 
  Shield, 
  Scale, 
  LifeBuoy, 
  FileText,
  Landmark,
  Gavel,
  Copyright,
  RefreshCw
} from 'lucide-react';

const TermsOfService: React.FC = () => {
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Please read these terms carefully before using CareerQuestAI
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
            Welcome to CareerQuestAI. These Terms of Service ("Terms") govern your access to and use of the CareerQuestAI website, 
            services, and applications (collectively, the "Service"). By accessing or using the Service, you agree to be bound 
            by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the Service.
          </motion.p>
        </motion.div>

        {/* Terms Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Account Terms */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Account Terms</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    To use certain features of our Service, you may need to create an account. When creating your account, you agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Provide accurate, current, and complete information</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Keep your password secure and confidential</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                    <li>Be responsible for all activities that occur under your account</li>
                  </ul>
                  <p>
                    We reserve the right to suspend or terminate your account if any information provided proves to be 
                    inaccurate, not current, or incomplete. You must be at least 18 years old to use our Service.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* User Responsibilities */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Responsibilities</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    When using our Service, you agree to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Provide truthful and accurate information in your resume and profile</li>
                    <li>Use the Service for legitimate job-seeking and career development purposes</li>
                    <li>Respect the intellectual property rights of others</li>
                    <li>Not engage in any activity that could harm our Service or interfere with other users</li>
                  </ul>
                  <p>
                    You are solely responsible for the content you submit to our Service, including your resume, 
                    professional profile, and any other information. While we provide AI tools to help optimize 
                    your content, you should review all generated content before using it.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Prohibited Activities */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Prohibited Activities</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    You may not use our Service to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Impersonate any person or entity</li>
                    <li>Harass, abuse, or harm another person</li>
                    <li>Upload or transmit viruses or malicious code</li>
                    <li>Collect or track personal information of other users</li>
                    <li>Interfere with or circumvent the security features of the Service</li>
                    <li>Generate fake or fraudulent resumes or applications</li>
                    <li>Misrepresent your qualifications, experience, or credentials</li>
                    <li>Use our Service for any illegal or unauthorized purpose</li>
                  </ul>
                  <p>
                    We reserve the right to terminate your access to the Service immediately, without prior notice, if we 
                    determine that you have violated these Terms.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Intellectual Property */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <Copyright className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Intellectual Property</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    CareerQuestAI and its original content, features, and functionality are owned by us and are protected 
                    by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p>
                    <strong>Your Content:</strong> You retain all rights to the content you submit to our Service, including your 
                    resume and professional information. By uploading content, you grant us a non-exclusive, worldwide, royalty-free 
                    license to use, reproduce, and display your content solely for the purpose of providing our Service to you.
                  </p>
                  <p>
                    <strong>AI-Generated Content:</strong> Content generated by our AI tools is provided for your personal use 
                    as part of our Service. While we do not claim ownership of your final resume or other documents, we retain 
                    all rights to our AI algorithms, models, and the underlying technology that generates content.
                  </p>
                  <p>
                    <strong>Feedback:</strong> If you provide us with feedback about our Service, you grant us the right to use 
                    that feedback without restriction or compensation to you.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Service Limitations and Modifications */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                <File className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Limitations and Modifications</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We reserve the right to:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Modify or terminate the Service for any reason, without notice</li>
                    <li>Change our Terms of Service at any time</li>
                    <li>Refuse service to anyone for any reason</li>
                    <li>Limit the availability of certain features to specific users or regions</li>
                    <li>Establish general practices and limits concerning use of our Service</li>
                  </ul>
                  <p>
                    We make no guarantees regarding:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>The accuracy or effectiveness of our AI-generated content</li>
                    <li>Your success in securing employment through our Service</li>
                    <li>The continuous, uninterrupted availability of the Service</li>
                    <li>The preservation or maintenance of any user content</li>
                  </ul>
                  <p>
                    We will make reasonable efforts to notify you of significant changes to the Service or these Terms.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Disclaimer of Warranties */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                <LifeBuoy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Disclaimer of Warranties</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                    EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL 
                    WARRANTIES, INCLUDING, BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                    <li>Any warranties regarding the security, reliability, timeliness, or performance of our Service</li>
                    <li>Any warranties for information or advice obtained through our Service</li>
                    <li>Any warranties that our Service will meet your requirements or be error-free</li>
                  </ul>
                  <p>
                    Our AI tools provide suggestions and optimizations based on general best practices, but we cannot 
                    guarantee their effectiveness for your specific circumstances or industry. You should always review and 
                    customize AI-generated content before using it for job applications.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitation of Liability</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CAREERQUESTAI, ITS DIRECTORS, 
                    EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>Damages resulting from your access to or use of, or inability to access or use the Service</li>
                    <li>Damages resulting from any content posted, transmitted, or otherwise made available via the Service</li>
                    <li>Damages resulting from unauthorized access to or use of our servers or any personal information stored therein</li>
                  </ul>
                  <p>
                    These limitations apply whether the alleged liability is based on contract, tort, negligence, strict liability, 
                    or any other basis, even if we have been advised of the possibility of such damage.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Governing Law */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Gavel className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Governing Law</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of the United States,
                    without regard to its conflict of law provisions.
                  </p>
                  <p>
                    Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
                    If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
                    of these Terms will remain in effect.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Dispute Resolution */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                <Landmark className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dispute Resolution</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be 
                    resolved through good faith negotiations. If such negotiations fail, you agree that any dispute shall be 
                    resolved through arbitration in accordance with the American Arbitration Association rules.
                  </p>
                  <p>
                    The arbitration shall be conducted in English and shall take place in the United States. The decision of 
                    the arbitrator shall be final and binding.
                  </p>
                  <p>
                    To the fullest extent permitted by applicable law, no arbitration shall be joined with any other proceeding, 
                    and there is no right for any dispute to be arbitrated on a class-action basis.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Termination */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We may terminate or suspend your account and access to the Service immediately, without prior notice 
                    or liability, for any reason, including, without limitation, if you breach these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the Service will immediately cease. If you wish to terminate your 
                    account, you may simply discontinue using the Service or contact us to request account deletion.
                  </p>
                  <p>
                    All provisions of these Terms which by their nature should survive termination shall survive, including, 
                    without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Changes to Terms */}
          <motion.section variants={itemVariants} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start">
              <div className="mr-4 bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
                <RefreshCw className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <p>
                    We reserve the right to modify or replace these Terms at any time. We will provide notice of any 
                    significant changes by posting the new Terms on our website or by sending you an email.
                  </p>
                  <p>
                    Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. 
                    Please review these Terms periodically for changes. If you do not agree to any of this Terms or any 
                    changes, do not use or access the Service.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div className="inline-block bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-xl">
            <p className="font-medium text-blue-800 dark:text-blue-300">legal@careerquestai.com</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService; 