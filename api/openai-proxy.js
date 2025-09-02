// Vercel serverless function to proxy OpenAI API requests
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
    const { endpoint, payload } = req.body;
    
    if (!endpoint || !payload) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: endpoint and payload are required' 
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
    
    console.log(`Processing ${endpoint} request: ${JSON.stringify({
      model: payload.model,
      endpoint: endpoint,
      userAgent: req.headers['user-agent'] || 'Unknown'
    })}`);
    
    let result;
    
    // Route the request to the appropriate OpenAI endpoint
    if (endpoint === 'chat.completions') {
      // Remove response_format if model doesn't support it
      if (payload.response_format && payload.model !== 'gpt-4-turbo' && payload.model !== 'gpt-4-1106-preview') {
        console.log(`Removing unsupported response_format parameter for model ${payload.model}`);
        const { response_format, ...cleanedPayload } = payload;
        result = await openai.chat.completions.create(cleanedPayload);
      } else {
        result = await openai.chat.completions.create(payload);
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: `Unsupported endpoint: ${endpoint}` 
      });
    }
    
    // Return successful response
    return res.status(200).json({ 
      success: true, 
      data: result 
    });
    
  } catch (error) {
    console.error('Error in OpenAI proxy:', error);
    
    // Return error response
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while processing your request' 
    });
  }
}
