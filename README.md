# CareerQuestAI - AI-Powered Career Development Platform

CareerQuestAI is a comprehensive career development platform that leverages artificial intelligence to help users create professional resumes, prepare for interviews, and manage their job search process effectively.

## 🌟 Features

### 📄 Resume Builder
- **Multiple Templates**: Choose from various professional templates:
  - Modern
  - Classic
  - Compact
  - Elegant
  - Creative
  - Minimalist
  - Professional
- **AI-Powered Optimization**: Automatically enhance resume content for better ATS compatibility
- **Real-time Preview**: See changes instantly as you edit
- **Customization Options**:
  - Line spacing
  - Font size
  - Color schemes
  - Section arrangement
- **Export Options**: Download as PDF
- **Save & Edit**: Store multiple versions of your resume

### 📝 Resume Tools
- **Resume Tailor**: AI-powered tool to customize resumes for specific job postings
- **Cover Letter Generator**: Create targeted cover letters using AI
- **Follow-up Email Generator**: Generate professional follow-up emails
- **LinkedIn Profile Optimizer**: Enhance your LinkedIn profile with AI suggestions

### 💼 Job Application Tracker
- **Application Dashboard**: Track all job applications in one place
- **Status Management**: Monitor application stages:
  - Upcoming interviews
  - Completed rounds
  - Offers received
  - Rejections
- **Salary Information**: Track salary ranges for applications
- **Notes System**: Add private notes for each application
- **Analytics**: View success rates and application statistics

### 🎯 Interview Preparation
- **AI Interview Simulator**: Practice with AI-powered mock interviews
- **Question Bank**: Access comprehensive interview question database:
  - General questions
  - Technical questions
  - Industry-specific questions
  - Behavioral questions
- **Custom Preparation**: Tailored interview prep based on job description
- **Performance Analytics**: Get feedback on your interview responses

### 📊 Dashboard Features
- **Overview Statistics**:
  - Total applications
  - Active applications
  - Success rate
  - Response rate
- **Recent Activity**: Track your latest actions
- **Quick Actions**: Easy access to common tasks
- **Upcoming Interviews**: View scheduled interviews

### 📝 Notes Management
- **Create & Organize**: Keep track of important information
- **Categories**: Organize notes by type
- **Rich Text Editor**: Format notes with basic styling
- **Search & Filter**: Easily find specific notes

### 🔐 Account Management
- **Secure Authentication**: Email and password-based login
- **Data Export**: Download all your data
- **Account Settings**: Customize your experience
- **API Usage Tracking**: Monitor your AI feature usage

### 🎨 User Interface
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Intuitive Navigation**: Easy-to-use interface
- **Real-time Updates**: See changes instantly

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/careerquestai.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OPENAI_API_KEY=your_openai_key
```

4. Start the development server:
```bash
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**:
  - React
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - Lucide Icons

- **Backend**:
  - Supabase
  - OpenAI API
  - Node.js
  - Express

- **Database**:
  - PostgreSQL (via Supabase)

- **Authentication**:
  - Supabase Auth

- **Storage**:
  - Supabase Storage

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and API clients
├── pages/         # Main application pages
└── types/         # TypeScript type definitions
```

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Secure authentication flow
- API rate limiting
- Data encryption
- Secure file storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Supabase for backend infrastructure
- React and Vite teams
- All contributors and users

## 📞 Support

For support, please open an issue in the GitHub repository or contact support@careerquestai.com