const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://oai.hconeai.com/v1",
  defaultHeaders: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`
  },
  maxRetries: 3,
  timeout: 60000
});

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://resume-builder-beryl.vercel.app',
      'https://careerquestai.com',
      'https://www.careerquestai.com'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add a pre-flight route for CORS
app.options('*', cors());

app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Add a simple root route
app.get('/', (req, res) => {
  res.send('CareerQuestAI Backend Server is running');
});

app.get('/test', (req, res) => {
  res.json({ message: 'Backend server is running correctly' });
});

// Career Research API endpoint
app.post('/api/career-research', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a query parameter' 
      });
    }

    console.log(`Processing career research request for query: ${query}`);
    
    // Check if user has API usage allowance (simplified version)
    // In production, implement proper API usage tracking with the database
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: `You are a career research assistant. Provide detailed information about careers or companies. 
            Format your response as JSON with the following structure:
            {
              "title": "Job title or company name",
              "averageSalary": "Average salary with $ symbol",
              "salaryRange": "Salary range with $ symbols",
              "companySize": "Company size (if applicable)",
              "employmentOutlook": "Employment outlook percentage or description",
              "growthRate": "Growth rate percentage",
              "skillsRequired": ["skill1", "skill2", "skill3"],
              "description": "Brief description",
              "additionalInfo": "Any other relevant information"
            }`
          },
          {
            role: "user",
            content: `Research information about: ${query}. If it's a company, provide company details. If it's a job title, provide career details.`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }
      
      // Parse the JSON response
      const parsedResults = JSON.parse(content);
      
      // Return the results to the client
      return res.json({
        success: true,
        data: parsedResults
      });
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to research career information',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error processing request',
      details: error.message
    });
  }
});

// Generic OpenAI proxy endpoint for all AI features
app.post('/api/openai-proxy', async (req, res) => {
  try {
    const { endpoint, payload, userId } = req.body;
    
    if (!endpoint || !payload) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: endpoint and payload' 
      });
    }

    console.log(`Processing OpenAI proxy request for endpoint: ${endpoint}`);
    console.log('Request origin:', req.headers.origin);
    console.log('Request user-agent:', req.headers['user-agent']);
    
    try {
      // We'll use the chat completions API as it's the most common
      const response = await openai.chat.completions.create(payload);
      
      // Return the raw response to the client
      return res.json({
        success: true,
        data: response
      });
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to process OpenAI request',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error processing request',
      details: error.message
    });
  }
});

// Specific endpoint for professional summary optimization
app.post('/api/optimize-summary', async (req, res) => {
  try {
    const { content, userId } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide content to optimize' 
      });
    }

    console.log('Processing professional summary optimization request');
    console.log('Request origin:', req.headers.origin);
    console.log('Request user-agent:', req.headers['user-agent']);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Pretend you are a professional resume writer and rewrite this for a professional summary section on a resume"
          },
          {
            role: "user",
            content: content
          }
        ],
      });
      
      const optimizedContent = response.choices[0].message.content;
      
      // Return the optimized content to the client
      return res.json({
        success: true,
        data: optimizedContent
      });
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to optimize summary',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error processing optimization request',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));