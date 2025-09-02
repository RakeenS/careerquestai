// Vercel serverless function to handle career research requests
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
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameter: query' 
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
    
    console.log(`Processing career research request for: ${query} (user: ${userId || 'anonymous'})`);
    
    // Make request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a career research expert who provides detailed, factual information about careers and companies.
          
You must return the information in a structured format with the following exact keys:
- description: Brief overview of the career or company
- averageSalary: The average salary with currency symbol (e.g. "$75,000")
- salaryRange: The typical salary range with currency symbols (e.g. "$65,000 - $95,000")
- outlook: The employment outlook as one of: "Excellent", "Good", "Fair", or "Poor"
- growthRate: The projected growth rate as a percentage (e.g. "12%")
- skills: An array of 5-8 key skills, with each skill being a short phrase
- education: The typical education requirements
- experience: The typical experience requirements
- relatedCareers: An array of 3-5 related careers or companies

Format your response as a valid JSON object with these exact keys.
Do not include any explanation or text outside of the JSON structure.`
        },
        {
          role: "user",
          content: `Provide detailed career research information for: ${query}`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    const researchResults = response.choices[0].message.content || '{}';
    
    // Parse the JSON response
    let parsedResults;
    try {
      parsedResults = JSON.parse(researchResults);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      // Fallback to text response if JSON parsing fails
      parsedResults = { description: researchResults };
    }
    
    // Return successful response
    return res.status(200).json({ 
      success: true, 
      data: {
        results: parsedResults
      }
    });
    
  } catch (error) {
    console.error('Error in career research:', error);
    
    // Return error response
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while researching this career' 
    });
  }
}
