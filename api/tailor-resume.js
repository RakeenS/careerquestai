// Vercel serverless function for Resume Tailor feature
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
    const { jobInfo, resumeContent } = req.body;
    
    if (!jobInfo || !resumeContent) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: jobInfo and resumeContent are required' 
      });
    }
    
    // Truncate inputs if they're too long to avoid timeouts
    const truncatedJobInfo = truncateText(jobInfo, 1500);
    const truncatedResumeContent = truncateText(resumeContent, 2500);
    
    // Initialize OpenAI client with API key from environment variables
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://oai.hconeai.com/v1",
      defaultHeaders: {
        "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
      },
      maxRetries: 1, // Reduce retries to save time
      timeout: 25000  // Even shorter timeout
    });
    
    console.log(`Processing resume tailor request: ${JSON.stringify({
      originalJobInfoLength: jobInfo.length,
      truncatedJobInfoLength: truncatedJobInfo.length,
      originalResumeContentLength: resumeContent.length,
      truncatedResumeContentLength: truncatedResumeContent.length,
      userAgent: req.headers['user-agent'] || 'Unknown'
    })}`);
    
    // If inputs are very large, use an even more aggressive approach
    if (jobInfo.length + resumeContent.length > 8000) {
      // Super optimized direct approach for very large inputs
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Use the faster model
        messages: [
          {
            role: "system",
            content: "You are an expert at tailoring resumes to match job descriptions. Be extremely concise and focus only on the most important points."
          },
          {
            role: "user",
            content: `Create a tailored resume based on this job description:\n\n${truncatedJobInfo}\n\nOriginal Resume:\n\n${truncatedResumeContent}\n\nKeep the same format as the original resume but highlight relevant skills and experience. Be concise.`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500 // Limit response size
      });
      
      return res.status(200).json({ 
        success: true, 
        data: response
      });
    }
    
    // First extract only the most critical skills/requirements from job description
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use the faster model
      messages: [
        {
          role: "system",
          content: "Extract only the 5-7 most critical skills and requirements from this job description. Be extremely brief."
        },
        {
          role: "user",
          content: truncatedJobInfo
        }
      ],
      temperature: 0.3,
      max_tokens: 300 // Very limited response size
    });
    
    const keyPoints = analysisResponse.choices[0].message.content;
    
    // Now use the key points with the resume - also create a simplified resume if it's long
    let resumeForTailoring = truncatedResumeContent;
    
    // If resume is very long, extract just the core experience and skills first
    if (truncatedResumeContent.length > 1500) {
      const resumeExtractionResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "Extract only the most important professional experience, skills, and education from this resume. Keep section structure."
          },
          {
            role: "user",
            content: truncatedResumeContent
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });
      
      resumeForTailoring = resumeExtractionResponse.choices[0].message.content;
    }
    
    // Now tailor the resume with these simplified inputs
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5 instead of GPT-4 for speed
      messages: [
        {
          role: "system",
          content: "You are an expert at tailoring resumes to match job requirements. Focus only on highlighting relevant experience and skills."
        },
        {
          role: "user",
          content: `Create a tailored resume based on these key job requirements:\n\n${keyPoints}\n\nResume Content:\n\n${resumeForTailoring}\n\nMaintain the same format structure as the original resume, just highlight relevant experience and add keywords.`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500 // Limit response size
    });
    
    // Return successful response
    return res.status(200).json({ 
      success: true, 
      data: response
    });
    
  } catch (error) {
    console.error('Error in Resume Tailor API:', error);
    
    // Return error response with proper JSON formatting
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while processing your request' 
    });
  }
}
