// Vercel serverless function for Cover Letter Generator feature
// This helps avoid the timeout limit in serverless functions

import OpenAI from 'openai';

// Function to truncate text if it's too long
function truncateText(text, maxLength = 2000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "... [content truncated for processing]";
}

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  
  try {
    const { name, jobUrl } = req.body;
    
    if (!name || !jobUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: name and jobUrl are required' 
      });
    }
    
    // Truncate inputs if they're too long to avoid timeouts
    const truncatedName = truncateText(name, 100);
    const truncatedJobUrl = truncateText(jobUrl, 2000);
    
    // Initialize OpenAI client with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
      },
      maxRetries: 0, // No retries to save time
      timeout: 8000  // Shorter timeout to ensure we don't exceed Vercel's 10s limit
    });
    
    console.log(`Processing chat.completions request: ${JSON.stringify({
      model: "gpt-3.5-turbo",
      endpoint: "chat.completions",
      userAgent: req.headers['user-agent'] || 'Unknown'
    })}`);
    
    // For longer job descriptions, use a two-step approach
    if (jobUrl.length > 800) {
      // Step 1: Extract only the key job requirements and company information
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use faster model
        messages: [
          {
            role: "system",
            content: "Extract only the most important job requirements, company information, and role details from this job description. Be extremely brief."
          },
          {
            role: "user",
            content: truncatedJobUrl
          }
        ],
        temperature: 0.3,
        max_tokens: 300 // Very limited response size
      });
      
      const keyJobInfo = analysisResponse.choices[0].message.content;
      
      // Step 2: Generate the cover letter using the extracted information
      const coverLetterResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use faster model
        messages: [
          {
            role: "system",
            content: "You are an expert at writing professional cover letters. Create a concise, well-structured cover letter. Focus on key qualifications."
          },
          {
            role: "user",
            content: `Write a professional cover letter for ${truncatedName} applying to this job with these key details: ${keyJobInfo}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000 // Reduce token count to save time
      });
      
      // Return successful response
      return res.status(200).json({ 
        success: true, 
        data: coverLetterResponse
      });
    } else {
      // For shorter job descriptions, use a direct approach
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use faster model instead of GPT-4
        messages: [
          {
            role: "system",
            content: "You are an expert at writing professional cover letters. Create a concise, well-structured cover letter."
          },
          {
            role: "user",
            content: `Write a professional cover letter for ${truncatedName} applying to this job: ${truncatedJobUrl}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000 // Reduced from 1500 to speed up response
      });
      
      // Return successful response
      return res.status(200).json({ 
        success: true, 
        data: response
      });
    }
  } catch (error) {
    console.error('Error in Cover Letter API:', error);
    
    // Return error response with proper JSON formatting
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while processing your request' 
    });
  }
}
