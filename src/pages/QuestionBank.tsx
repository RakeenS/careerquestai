import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Book } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  response: string;
  why: string;
}

interface Category {
  name: string;
  questions: Question[];
}

const categories: Category[] = [
  {
    name: "General Interview Questions",
    questions: [
      {
        id: 1,
        question: "Tell me about yourself.",
        response: "I have over five years of experience in digital marketing, focusing on content strategy and SEO. I've led multiple successful campaigns for mid-sized companies, increasing their online traffic by up to 200%. I'm passionate about data-driven marketing and always look for innovative ways to connect brands with their audience. Outside work, I enjoy writing and exploring new tech trends.",
        why: "This answer is concise, highlights relevant experience, and gives a personal touch. It positions the candidate as both skilled and personable."
      },
      {
        id: 2,
        question: "What are your strengths and weaknesses?",
        response: "My strengths include strong analytical skills and a keen eye for detail, which help me excel in problem-solving. For example, I once identified a key data discrepancy that saved the company thousands of dollars. As for weaknesses, I sometimes focus too much on details, but I'm actively working on balancing this by setting strict time limits for my tasks.",
        why: "This response addresses strengths with specific examples and reframes a weakness as something manageable and improvable, showing self-awareness."
      },
      // Add all other general questions (3-20) here following the same pattern
    ]
  },
  {
    name: "Technical (IT/Software Development) Questions",
    questions: [
      {
        id: 21,
        question: "Explain the concept of Object-Oriented Programming (OOP).",
        response: "OOP is a programming paradigm based on the concept of 'objects,' which can contain data in the form of fields (attributes or properties) and code in the form of procedures (methods). The four main principles of OOP are encapsulation, inheritance, polymorphism, and abstraction. This approach allows for code reuse, scalability, and easier maintenance.",
        why: "This answer concisely covers the key elements of OOP and demonstrates a solid understanding of its principles and benefits."
      },
      // Add all other technical questions (22-30) here following the same pattern
    ]
  },
  {
    name: "Marketing & Sales Questions",
    questions: [
      {
        id: 31,
        question: "How do you handle rejection in sales?",
        response: "Rejection is a natural part of sales, and I see it as an opportunity to learn. I analyze each situation to understand why a prospect said no and adjust my approach for future interactions. Persistence, adaptability, and a positive attitude are key to overcoming rejection.",
        why: "Demonstrates resilience, a willingness to learn, and the ability to turn a negative into a positive."
      },
      // Add all other marketing questions (32-40) here following the same pattern
    ]
  },
  {
    name: "Finance & Accounting Questions",
    questions: [
      {
        id: 41,
        question: "How do you ensure accuracy in your financial reports?",
        response: "I use a combination of automated tools and manual checks to ensure data integrity. Double-checking data entries, reconciling accounts regularly, and following strict documentation processes help me maintain accuracy.",
        why: "Demonstrates meticulousness and the use of best practices to ensure accuracy."
      },
      // Add all other finance questions (42-50) here following the same pattern
    ]
  },
  {
    name: "Customer Service Questions",
    questions: [
      {
        id: 51,
        question: "How do you handle an irate customer?",
        response: "I listen attentively to understand their concerns, empathize with their situation, and apologize for any inconvenience. I then work on finding a solution promptly, keeping them informed throughout the process. If needed, I escalate the issue to ensure it's resolved efficiently.",
        why: "Shows empathy, effective communication, and a solution-oriented approach."
      },
      // Add all other customer service questions (52-60) here following the same pattern
    ]
  },
  {
    name: "Project Management Questions",
    questions: [
      {
        id: 61,
        question: "How do you manage project deadlines?",
        response: "I break down projects into smaller tasks, set realistic deadlines for each, and prioritize them based on dependencies and importance. I use project management tools like Asana to track progress and ensure the team stays on schedule.",
        why: "Shows strategic planning and experience with relevant tools."
      },
      // Add all other project management questions (62-70) here following the same pattern
    ]
  },
  {
    name: "Engineering & Manufacturing Questions",
    questions: [
      {
        id: 71,
        question: "How do you ensure quality in your engineering projects?",
        response: "I ensure quality by implementing strict quality control procedures at each stage of the project. This includes thorough testing, regular audits, and continuous feedback loops. I also make use of tools like Six Sigma and lean manufacturing to minimize defects and improve overall efficiency.",
        why: "Shows a comprehensive approach to maintaining quality, emphasizing structured processes and industry-standard methods."
      },
      // Add all other engineering questions (72-80) here following the same pattern
    ]
  },
  {
    name: "Education & Training Questions",
    questions: [
      {
        id: 81,
        question: "How do you handle a difficult student?",
        response: "I try to understand the underlying reasons behind a student's behavior by communicating with them one-on-one. Once I identify any issues, I adapt my approach to meet their needs, whether it's through personalized instruction or additional support, to help them succeed.",
        why: "Shows empathy, communication skills, and a tailored approach to problem-solving."
      },
      // Add all other education questions (82-90) here following the same pattern
    ]
  }
];

const QuestionBank: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    questions: category.questions.filter(question =>
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.response.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-6 flex items-center">
          <Book className="mr-3" />
          Interview Question Bank
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence>
          {filteredCategories.map((category) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <h2 className="text-xl font-semibold">{category.name}</h2>
                {selectedCategory === category.name ? (
                  <ChevronUp className="text-gray-500" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {selectedCategory === category.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6">
                      {category.questions.map((question) => (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 border rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                        >
                          <button
                            onClick={() => toggleQuestion(question.id)}
                            className="w-full text-left flex justify-between items-center"
                          >
                            <h3 className="text-lg font-medium">{question.question}</h3>
                            {expandedQuestions.includes(question.id) ? (
                              <ChevronUp className="text-gray-500" />
                            ) : (
                              <ChevronDown className="text-gray-500" />
                            )}
                          </button>

                          <AnimatePresence>
                            {expandedQuestions.includes(question.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 space-y-4"
                              >
                                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Response:</h4>
                                  <p className="text-gray-800 dark:text-gray-200">{question.response}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                                  <h4 className="font-semibold mb-2 text-green-800 dark:text-green-200">Why This Works:</h4>
                                  <p className="text-gray-800 dark:text-gray-200">{question.why}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestionBank;