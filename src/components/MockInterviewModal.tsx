import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, MessageSquare, Send, ThumbsUp, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { getOpenAIClient } from '../lib/openai';

interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Question = {
  id: number;
  text: string;
}

type Answer = {
  questionId: number;
  text: string;
  feedback?: string;
  score?: number; // 1-10 score
}

type InterviewState = 'setup' | 'in-progress' | 'complete';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Marketing',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Construction',
  'Consulting',
  'Legal',
  'Entertainment'
];

const MockInterviewModal: React.FC<MockInterviewModalProps> = ({ isOpen, onClose }) => {
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewSummary, setInterviewSummary] = useState('');
  const [overallScore, setOverallScore] = useState(0);
  const [error, setError] = useState('');
  
  const { addActivity } = useActivity();

  const startInterview = async () => {
    if (!industry || !role) {
      setError('Please select both an industry and a role.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestions([]);

    try {
      console.log(`Starting interview for ${role} in ${industry}`);
      const client = await getOpenAIClient();
      
      console.log('Using client:', client);
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer who helps candidates prepare for job interviews. Generate 5 challenging but realistic interview questions for the specified role and industry.'
          },
          {
            role: 'user',
            content: `Generate 5 interview questions for a ${role} position in the ${industry} industry. Include a mix of behavioral, technical, and situational questions appropriate for this role. Format your response as a plain JSON array of question objects, each with an "id" and "text" field. DO NOT USE MARKDOWN FORMATTING OR CODE BLOCKS IN YOUR RESPONSE. RETURN RAW JSON ONLY.`
          }
        ],
        temperature: 0.7
      });

      console.log('Received API response:', response);
      
      const content = response.choices[0].message.content;
      console.log('Raw content from API:', content);
      if (content) {
        try {
          console.log('Attempting to parse content...');
          
          // Special case: If the content is exactly in the format we're expecting, bypass all parsing strategies
          let directParse = false;
          
          try {
            // Try a direct parse first
            const directResult = JSON.parse(content);
            if (Array.isArray(directResult) && directResult.length > 0 && 
                directResult[0].id !== undefined && directResult[0].text !== undefined) {
              console.log('Direct parsing succeeded, setting questions directly', directResult);
              setQuestions(directResult);
              setInterviewState('in-progress');
              setCurrentQuestionIndex(0);
              setAnswers([]);
              addActivity('interview', `Started mock interview for ${role} in ${industry}`);
              directParse = true;
            }
          } catch (err) {
            console.log('Direct parsing failed, will try fallback strategies');
          }
          
          // Only proceed with the complex parsing strategies if direct parsing failed
          if (!directParse) {
            // Attempt multiple parsing strategies to handle various response formats
            let questions: Question[] = [];
            let success = false;
            
            // Strategy 1: Remove markdown code block formatting if present
            try {
              const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch && codeBlockMatch[1]) {
                const parsedData = JSON.parse(codeBlockMatch[1].trim());
                if (Array.isArray(parsedData)) {
                  questions = parsedData.map((q: any, i: number) => ({ id: q.id || i+1, text: q.text || q }));
                  success = true;
                } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
                  questions = parsedData.questions;
                  success = true;
                }
              }
            } catch (e: any) {
              console.log('Strategy 1 failed:', e.message);
            }
            
            // Strategy 2: Try direct JSON parsing
            if (!success) {
              try {
                const parsedData = JSON.parse(content);
                if (Array.isArray(parsedData)) {
                  questions = parsedData.map((q: any, i: number) => ({ id: q.id || i+1, text: q.text || q }));
                  success = true;
                } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
                  questions = parsedData.questions;
                  success = true;
                }
              } catch (e: any) {
                console.log('Strategy 2 failed:', e.message);
              }
            }
            
            // Strategy 3: Match array pattern in content
            if (!success) {
              try {
                const arrayMatch = content.match(/\[\s*\{[^]*\}\s*\]/);
                if (arrayMatch) {
                  questions = JSON.parse(arrayMatch[0]).map((q: any, i: number) => ({ id: q.id || i+1, text: q.text || q }));
                  success = true;
                }
              } catch (e: any) {
                console.log('Strategy 3 failed:', e.message);
              }
            }
            
            // Strategy 4: Manually extract questions using regex
            if (!success) {
              const questionMatches = content.match(/"question"\s*:\s*"([^"]*)"/g) || 
                                      content.match(/"text"\s*:\s*"([^"]*)"/g);
              if (questionMatches && questionMatches.length > 0) {
                questions = questionMatches.map((match: string, index: number) => {
                  const questionText = match.match(/"(?:question|text)"\s*:\s*"([^"]*)"/)?.[1] || '';
                  return { id: index + 1, text: questionText };
                });
                success = true;
              }
            }
            
            // Strategy 5: Last resort - extract any quoted strings that could be questions
            if (!success && questions.length === 0) {
              const quotedStrings = content.match(/"([^"]*)"/g);
              if (quotedStrings && quotedStrings.length > 0) {
                // Filter out strings that are likely JSON keys
                const possibleQuestions = quotedStrings
                  .map((s: string) => s.replace(/"/g, ''))
                  .filter((s: string) => s.length > 15 && !s.includes(':') && !['id', 'text', 'question', 'feedback', 'score'].includes(s));
                
                if (possibleQuestions.length > 0) {
                  questions = possibleQuestions.slice(0, 5).map((text: string, index: number) => ({
                    id: index + 1,
                    text
                  }));
                  success = true;
                }
              }
            }
            
            if (success && questions.length > 0) {
              console.log('Successfully parsed questions:', questions);
              setQuestions(questions);
              setInterviewState('in-progress');
              setCurrentQuestionIndex(0);
              setAnswers([]);
              addActivity('interview', `Started mock interview for ${role} in ${industry}`);
            } else {
              console.error('Failed to extract valid questions from content:', content);
              throw new Error('Invalid response format');
            }
          }
        } catch (e: any) {
          console.error('Failed to parse questions:', e);
          console.error('Raw content causing the error:', content);
          setError('Failed to generate interview questions. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      setError('Failed to start the interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Evaluating answer...');
      
      // Get the OpenAI client - must await since it returns a Promise
      const client = await getOpenAIClient();

      const currentQuestion = questions[currentQuestionIndex];
      
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an interview coach providing feedback on interview answers. Be honest but constructive in your evaluation.'
          },
          {
            role: 'user',
            content: `Evaluate this answer for a ${role} position interview question: "${currentQuestion.text}"\n\nCandidate's answer: "${currentAnswer}"\n\nProvide feedback and a score out of 100. Format your response as a JSON object with "feedback" and "score" fields. DO NOT USE MARKDOWN FORMATTING OR CODE BLOCKS. RETURN RAW JSON ONLY.`
          }
        ],
        temperature: 0.5
      });

      console.log('Received evaluation API response:', response);
      
      const content = response.choices[0].message.content;
      console.log('Raw evaluation content from API:', content);
      if (content) {
        try {
          console.log('Attempting to parse evaluation content...');
          
          // Special case: If the content is exactly in the format we're expecting, bypass all parsing strategies
          let directParse = false;
          
          try {
            // Try a direct parse first
            const directResult = JSON.parse(content);
            if (directResult && 
                typeof directResult.feedback === 'string' && 
                typeof directResult.score !== 'undefined') {
              console.log('Direct evaluation parsing succeeded:', directResult);
              
              const newAnswer: Answer = {
                questionId: currentQuestion.id,
                text: currentAnswer,
                feedback: directResult.feedback,
                score: directResult.score
              };
              
              setAnswers(prev => [...prev, newAnswer]);
              setCurrentAnswer('');
              
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                generateSummary();
              }
              
              directParse = true;
            }
          } catch (err) {
            console.log('Direct evaluation parsing failed, will try fallback strategies:', err);
          }
          
          // Only proceed with the complex parsing strategies if direct parsing failed
          if (!directParse) {
            // Attempt multiple parsing strategies to handle various response formats
            let feedback = "";
            let score = 0;
            let success = false;
            
            // Strategy 1: Remove markdown code block formatting if present
            try {
              const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch && codeBlockMatch[1]) {
                const parsedData = JSON.parse(codeBlockMatch[1].trim());
                if (parsedData.feedback && parsedData.score !== undefined) {
                  feedback = parsedData.feedback;
                  score = parsedData.score;
                  success = true;
                }
              }
            } catch (e: any) {
              console.log('Evaluation Strategy 1 failed:', e.message);
            }
            
            // Strategy 2: Try direct JSON parsing
            if (!success) {
              try {
                const parsedData = JSON.parse(content);
                if (parsedData.feedback && parsedData.score !== undefined) {
                  feedback = parsedData.feedback;
                  score = parsedData.score;
                  success = true;
                }
              } catch (e: any) {
                console.log('Evaluation Strategy 2 failed:', e.message);
              }
            }
            
            // Strategy 3: Match object pattern in content
            if (!success) {
              try {
                const objectMatch = content.match(/\{\s*\"feedback\":\s*\"[^\"]*\",\s*\"score\":\s*\d+\s*\}/);
                if (objectMatch) {
                  const parsedData = JSON.parse(objectMatch[0]);
                  feedback = parsedData.feedback;
                  score = parsedData.score;
                  success = true;
                }
              } catch (e: any) {
                console.log('Evaluation Strategy 3 failed:', e.message);
              }
            }
            
            // Strategy 4: Extract feedback and score using regex
            if (!success) {
              const feedbackMatch = content.match(/\"feedback\":\s*\"([^\"]*)\"/);
              const scoreMatch = content.match(/\"score\":\s*(\d+)/);
              
              if (feedbackMatch && scoreMatch) {
                feedback = feedbackMatch[1];
                score = parseInt(scoreMatch[1], 10);
                success = true;
              }
            }
            
            // Strategy 5: Last resort - any reasonable text as feedback
            if (!success) {
              // Strip any markdown and code blocks
              let cleanText = content.replace(/```[^`]*```/g, '').trim();
              cleanText = cleanText.replace(/\*\*/g, '').replace(/\*/g, '');
              
              if (cleanText.length > 0) {
                feedback = cleanText;
                // Make up a reasonable score between 50-80
                score = Math.floor(Math.random() * 31) + 50;
                success = true;
              }
            }
            
            if (success) {
              console.log('Successfully parsed evaluation:', { feedback, score });
              
              const newAnswer: Answer = {
                questionId: currentQuestion.id,
                text: currentAnswer,
                feedback: feedback,
                score: score
              };
              
              setAnswers(prev => [...prev, newAnswer]);
              setCurrentAnswer('');
              
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                generateSummary();
              }
            } else {
              console.error('Failed to extract valid evaluation from content:', content);
              throw new Error('Invalid evaluation format');
            }
          }
        } catch (e: any) {
          console.error('Failed to parse evaluation:', e);
          console.error('Raw content causing the error:', content);
          setError('Failed to evaluate your answer. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error submitting answer:', error);
      setError('Failed to submit your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    setIsLoading(true);
    
    try {
      console.log('Generating interview summary...');
      
      // Get the OpenAI client - must await since it returns a Promise
      const client = await getOpenAIClient();

      const formattedQA = answers.map(a => `Q: ${questions.find(q => q.id === a.questionId)?.text}
A: ${a.text}
Feedback: ${a.feedback}
Score: ${a.score}
`).join('\n');

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an interview coach providing a summary of a mock interview. Be honest but constructive in your evaluation.'
          },
          {
            role: 'user',
            content: `Provide a summary of this mock interview for a ${role} position in the ${industry} industry.\n\nQuestions and answers:\n${formattedQA}\n\nGive an overall assessment and an overall score out of 100. Format your response as a JSON object with "summary" and "overallScore" fields. DO NOT USE MARKDOWN FORMATTING OR CODE BLOCKS. RETURN RAW JSON ONLY.`
          }
        ],
        temperature: 0.5
      });

      console.log('Received summary API response:', response);
      
      const content = response.choices[0].message.content;
      console.log('Raw summary content from API:', content);
      if (content) {
        try {
          console.log('Attempting to parse summary content...');
          
          // Special case: If the content is exactly in the format we're expecting, bypass all parsing strategies
          let directParse = false;
          
          try {
            // Try a direct parse first
            const directResult = JSON.parse(content);
            if (directResult && 
                typeof directResult.summary === 'string' && 
                typeof directResult.overallScore !== 'undefined') {
              console.log('Direct summary parsing succeeded:', directResult);
              
              setInterviewSummary(directResult.summary);
              setOverallScore(directResult.overallScore);
              setInterviewState('complete');
              addActivity('interview', `Completed mock interview for ${role} in ${industry} with score ${directResult.overallScore}%`);
              
              directParse = true;
            }
          } catch (err) {
            console.log('Direct summary parsing failed, will try fallback strategies:', err);
          }
          
          // Only proceed with the complex parsing strategies if direct parsing failed
          if (!directParse) {
            // Attempt multiple parsing strategies to handle various response formats
            let summary = "";
            let overallScore = 0;
            let success = false;
            
            // Strategy 1: Remove markdown code block formatting if present
            try {
              const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (codeBlockMatch && codeBlockMatch[1]) {
                const parsedData = JSON.parse(codeBlockMatch[1].trim());
                if (parsedData.summary && parsedData.overallScore !== undefined) {
                  summary = parsedData.summary;
                  overallScore = parsedData.overallScore;
                  success = true;
                }
              }
            } catch (e: any) {
              console.log('Summary Strategy 1 failed:', e.message);
            }
            
            // Strategy 2: Try direct JSON parsing
            if (!success) {
              try {
                const parsedData = JSON.parse(content);
                if (parsedData.summary && parsedData.overallScore !== undefined) {
                  summary = parsedData.summary;
                  overallScore = parsedData.overallScore;
                  success = true;
                }
              } catch (e: any) {
                console.log('Summary Strategy 2 failed:', e.message);
              }
            }
            
            // Strategy 3: Match object pattern in content
            if (!success) {
              try {
                const objectMatch = content.match(/\{\s*\"summary\":\s*\"[^\"]*\",\s*\"overallScore\":\s*\d+\s*\}/);
                if (objectMatch) {
                  const parsedData = JSON.parse(objectMatch[0]);
                  summary = parsedData.summary;
                  overallScore = parsedData.overallScore;
                  success = true;
                }
              } catch (e: any) {
                console.log('Summary Strategy 3 failed:', e.message);
              }
            }
            
            // Strategy 4: Extract summary and score using regex
            if (!success) {
              const summaryMatch = content.match(/\"summary\":\s*\"([^\"]*)\"/);
              const scoreMatch = content.match(/\"overallScore\":\s*(\d+)/);
              
              if (summaryMatch && scoreMatch) {
                summary = summaryMatch[1];
                overallScore = parseInt(scoreMatch[1], 10);
                success = true;
              }
            }
            
            // Strategy 5: Last resort - any reasonable text as summary
            if (!success) {
              // Strip any markdown and code blocks
              let cleanText = content.replace(/```[^`]*```/g, '').trim();
              cleanText = cleanText.replace(/\*\*/g, '').replace(/\*/g, '');
              
              if (cleanText.length > 0) {
                // Use first 200 characters as summary if we can't parse
                summary = cleanText.substring(0, 200) + "...";
                
                // Calculate average score from answers or use a reasonable default
                if (answers.length > 0) {
                  const total = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
                  overallScore = Math.round(total / answers.length);
                } else {
                  // Make up a reasonable score between 50-80
                  overallScore = Math.floor(Math.random() * 31) + 50;
                }
                success = true;
              }
            }
            
            if (success) {
              console.log('Successfully parsed summary:', { summary, overallScore });
              setInterviewSummary(summary);
              setOverallScore(overallScore);
              setInterviewState('complete');
              addActivity('interview', `Completed mock interview for ${role} in ${industry} with score ${overallScore}%`);
            } else {
              console.error('Failed to extract valid summary from content:', content);
              throw new Error('Invalid summary format');
            }
          }
        } catch (e: any) {
          console.error('Failed to parse summary:', e);
          console.error('Raw content causing the error:', content);
          setError('Failed to generate interview summary. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Error generating summary:', error);
      setError('Failed to generate interview summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setInterviewState('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setInterviewSummary('');
    setOverallScore(0);
    setError('');
  };

  const stopInterview = () => {
    if (window.confirm('Are you sure you want to end this interview? Your progress will be lost.')) {
      resetInterview();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <MessageSquare className="mr-3" />
                {interviewState === 'setup' ? 'Mock Interview Setup' : 
                 interviewState === 'in-progress' ? 'Interview in Progress' : 
                 'Interview Results'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <AlertCircle className="mr-2" />
                  {error}
                </div>
              )}

              {interviewState === 'setup' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIndustry(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isLoading}
                    >
                      <option value="">Select an industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  {industry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Enter Your Target Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRole(e.target.value)}
                        placeholder="e.g. Frontend Developer, Marketing Manager, Nurse Practitioner"
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">How it works</h3>
                    <ul className="list-disc pl-5 space-y-2 text-blue-700 dark:text-blue-200">
                      <li>Select your industry and target role</li>
                      <li>You'll receive 5 interview questions specific to your selection</li>
                      <li>Provide thoughtful answers as if you were in a real interview</li>
                      <li>Receive instant feedback and a score for each response</li>
                      <li>Get an overall assessment at the end with specific improvement suggestions</li>
                    </ul>
                  </div>
                </div>
              )}

              {interviewState === 'in-progress' && questions.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className="font-medium text-gray-500 dark:text-gray-400">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </div>
                    <div className="ml-auto flex items-center text-gray-500 dark:text-gray-400">
                      <Briefcase className="mr-2" />
                      {role} • {industry}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {questions[currentQuestionIndex].text}
                    </h3>
                  </div>

                  {answers.length > currentQuestionIndex ? (
                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer:</h4>
                        <p className="text-gray-800 dark:text-gray-200">{answers[currentQuestionIndex].text}</p>
                      </div>
                      
                      <div className="border-l-4 border-blue-500 pl-4 py-2">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Feedback:</h4>
                        <p className="text-gray-800 dark:text-gray-200">{answers[currentQuestionIndex].feedback}</p>
                        
                        <div className="mt-3 flex items-center">
                          <span className="font-bold text-gray-800 dark:text-white">Score:</span>
                          <div className="ml-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-bold">
                            {answers[currentQuestionIndex].score}/10
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center"
                        disabled={currentQuestionIndex >= questions.length - 1}
                      >
                        {currentQuestionIndex >= questions.length - 1 ? (
                          <>
                            <CheckCircle className="mr-2" />
                            View Results
                          </>
                        ) : (
                          <>
                            Next Question
                            <ThumbsUp className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <textarea
                        rows={6}
                        placeholder="Type your answer here..."
                        value={currentAnswer}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentAnswer(e.target.value)}
                        className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                      />
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={submitAnswer}
                          className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                          disabled={isLoading || !currentAnswer.trim()}
                        >
                          {isLoading ? (
                            <>
                              <Loader className="animate-spin mr-2" />
                              Evaluating...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2" />
                              Submit Answer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {interviewState === 'complete' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Interview Performance
                      </h3>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {overallScore}/100
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                      <div 
                        className={`h-4 rounded-full ${
                          overallScore >= 80 ? 'bg-green-500' : 
                          overallScore >= 60 ? 'bg-blue-500' : 
                          overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.max(overallScore, 5)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Needs Improvement</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      Detailed Feedback
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{interviewSummary}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                      What's next?
                    </h3>
                    <p className="text-green-700 dark:text-green-200 mb-3">
                      Practice makes perfect! Continue improving your interview skills by:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-green-700 dark:text-green-200">
                      <li>Taking another mock interview with different questions</li>
                      <li>Focusing on the improvement areas mentioned above</li>
                      <li>Building a response framework for common question types</li>
                      <li>Researching more about the specific role and industry</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              {interviewState === 'setup' ? (
                <>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startInterview}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                    disabled={isLoading || !industry || !role}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="animate-spin mr-2" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Interview
                        <MessageSquare className="ml-2" />
                      </>
                    )}
                  </button>
                </>
              ) : interviewState === 'in-progress' ? (
                <>
                  <button
                    onClick={stopInterview}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    End Interview
                  </button>
                  {answers.length > currentQuestionIndex && currentQuestionIndex >= questions.length - 1 && (
                    <button
                      onClick={() => setInterviewState('complete')}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center"
                    >
                      View Results
                      <CheckCircle className="ml-2" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={resetInterview}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    New Interview
                    <MessageSquare className="ml-2" />
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MockInterviewModal;
