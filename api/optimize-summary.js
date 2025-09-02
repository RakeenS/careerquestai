// Vercel serverless function to optimize professional summaries
// This avoids CORS issues and API key exposure in the client

import OpenAI from 'openai';

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
    const { content, userId } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: content' 
      });
    }
    
    // Initialize OpenAI client with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
      },
      maxRetries: 3,
      timeout: 60000
    });
    
    console.log(`Processing summary optimization request for user: ${userId || 'anonymous'}`);
    
    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer."
        },
        {
          role: "user",
          content: `Pretend you are a professional resume writer and rewrite this for a professional summary section on a resume: ${content}`
        }
      ],
    });
    
    const optimizedContent = response.choices[0].message.content || '';
    
    // Return successful response
    return res.status(200).json({ 
      success: true, 
      data: {
        optimizedContent
      }
    });
    
  } catch (error) {
    console.error('Error in optimize summary:', error);
    
    // Return error response
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while optimizing your summary' 
    });
  }
}
