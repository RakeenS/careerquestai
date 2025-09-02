import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Save } from 'lucide-react';
import openai, { createProxyOpenAIClient } from '../lib/openai';

// Import the OpenAI types to fix the type errors
import type { ChatCompletionMessageParam } from 'openai/resources';

interface Message {
  role: 'human' | 'assistant';
  content: string;
}

const InterviewSimulation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { industry, position } = location.state || {};

  useEffect(() => {
    sendInitialMessage();
  }, []);

  const getOpenAIClient = () => {
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );
    return isMobile ? createProxyOpenAIClient() : openai;
  };

  const sendInitialMessage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const openaiClient = getOpenAIClient();
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `You are an AI interviewer for a ${position} role in the ${industry} industry. Start the interview by asking your first question. Do not introduce yourself or mention that you are an AI, just ask the first interview question directly.`
      };
      
      const response = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [systemMessage],
      });

      const aiMessage: Message = { 
        role: 'assistant', 
        content: response.choices[0].message.content || "Let's begin the interview. What motivated you to apply for this position?" 
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error("Error in sendInitialMessage:", error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const newMessages = [...messages, { role: 'human' as const, content: message }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const openaiClient = getOpenAIClient();
      
      // Convert our app message types to OpenAI's expected message format
      const apiMessages: ChatCompletionMessageParam[] = newMessages.map(msg => ({
        role: msg.role === 'human' ? 'user' : 'assistant', 
        content: msg.content
      }));
      
      // Add the system message
      const systemMessage: ChatCompletionMessageParam = {
        role: "system",
        content: `You are an AI interviewer for a ${position} role in the ${industry} industry. Conduct a professional interview.`
      };
      
      const response = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [systemMessage, ...apiMessages],
      });

      const aiMessage: Message = { 
        role: 'assistant', 
        content: response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Let's continue with the next question." 
      };
      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Interview Simulation: {position} in {industry}</h1>
      <div className="bg-white shadow-md rounded-lg p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'human' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'human' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center">AI is thinking...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Type your response..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </form>
      <button className="mt-4 flex items-center justify-center w-full bg-green-500 text-white px-4 py-2 rounded">
        <Save className="mr-2" />
        Save Interview Notes
      </button>
    </div>
  );
};

export default InterviewSimulation;