// Vercel serverless function for Follow-up Email Generator feature
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
    const { jobInfo, tone, stage } = req.body;
    
    if (!jobInfo || !tone || !stage) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: jobInfo, tone, and stage are required' 
      });
    }
    
    // Truncate inputs if they're too long to avoid timeouts
    const truncatedJobInfo = truncateText(jobInfo, 1000);
    const truncatedTone = truncateText(tone, 50);
    const truncatedStage = truncateText(stage, 100);
    
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
    
    // Create the follow-up email
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use faster model
      messages: [
        {
          role: "system",
          content: `You are an expert at writing professional follow-up emails. Create a ${truncatedTone} email for a candidate who is ${truncatedStage}.`
        },
        {
          role: "user",
          content: `Generate a follow-up email template for this job/interview: ${truncatedJobInfo}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800 // Reduced token count to speed up response
    });
    
    // Return successful response
    return res.status(200).json({ 
      success: true, 
      data: response
    });
    
  } catch (error) {
    console.error('Error in Follow-up Email API:', error);
    
    // Return error response with proper JSON formatting
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while processing your request' 
    });
  }
}
