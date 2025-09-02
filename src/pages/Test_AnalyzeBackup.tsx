// This is a backup of the original analyzeResume function
// from Test.tsx before modifications

const analyzeResume = async () => {
  try {
    // CRITICAL FIX: Check authentication directly with Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;
    console.log(`Resume analysis requested. Supabase auth check - User authenticated: ${isAuthenticated}`);
    
    // Make sure React state matches Supabase auth state
    if (isAuthenticated !== isUserLoggedIn) {
      console.log('Fixing auth state discrepancy');
      setIsUserLoggedIn(isAuthenticated);
    }
    
    // Check both authentication and subscription status
    if (!isAuthenticated || !subscriptionStatus.isPremium) {
      // Remember that we wanted to do an analysis for later retry
      window.sessionStorage.setItem('pendingAnalysis', 'true');
      setLastRequestedFeature('analyze');
      setShowPremiumModal(true);
      return; // Exit if user doesn't have access or an active subscription
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    // If we can't verify auth, assume not logged in and show modal
    setLastRequestedFeature('analyze');
    setShowPremiumModal(true);
    return;
  }
  
  try {
    setIsAnalyzingResume(true);
    
    // Extract resume content as plaintext
    const personalInfo = resumeData.personalInfo;
    const experienceSections = resumeData.experience.map((exp, i) => {
      return `Experience ${i+1}:\n- Title: ${exp.title}\n- Company: ${exp.company}\n- Location: ${exp.location}\n- Period: ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}\n- Description: ${exp.description}`;
    }).join('\n\n');
    
    // Add education sections if visible
    const educationSections = visibleSections.includes('education') ? 
      resumeData.education.map((edu, i) => {
        return `Education ${i+1}:\n- Degree: ${edu.degree}\n- Institution: ${edu.institution}\n- Location: ${edu.location}\n- Period: ${edu.startDate} - ${edu.current ? 'Present' : edu.endDate}\n- Description: ${edu.description}`;
      }).join('\n\n') : '';
    
    // Combine all resume content
    const resumeContent = `
      RESUME CONTENT\n\n
      Personal Information:\n
      - Name: ${personalInfo.fullName}\n
      - Title: ${personalInfo.title}\n
      - Email: ${personalInfo.email}\n
      - Phone: ${personalInfo.phone}\n
      - Location: ${personalInfo.location}\n
      - Website: ${personalInfo.website}\n\n
      Professional Summary:\n
      ${personalInfo.summary}\n\n
      ${experienceSections}\n\n
      ${educationSections ? educationSections : ''}
    `;
    
    // Get OpenAI client
    const openaiClient = await getOpenAIClient();
    
    // Call OpenAI API to analyze the resume
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert ATS (Applicant Tracking System) resume analyzer. You will evaluate resumes for ATS compatibility, keyword optimization, and provide actionable feedback to improve the resume's chances of passing ATS filters. You should provide a score on a scale of 1-100 and specific recommendations."
        },
        {
          role: "user",
          content: `Please analyze this resume for ATS compatibility and provide feedback. I need:
          1. An overall ATS compatibility score (1-100).
          2. General feedback about the resume's effectiveness for ATS systems.
          3. A list of 3-5 specific improvement suggestions to make the resume more ATS-friendly.
          
          Here's the resume content:
          
          ${resumeContent}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    // Parse and structure the analysis response
    const analysisText = response.choices[0]?.message?.content || '';
    
    // Extract score using regex
    const scoreMatch = analysisText.match(/(\d{1,3})\s*\/\s*100|score[:\s]*([\d]{1,3})/i);
    const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 70; // Default to 70 if no score found
    
    // Extract general feedback
    let feedback = "";
    const feedbackMatch = analysisText.match(/general feedback:?\s*([\s\S]*?)(?=specific|improvement|suggest|\d\.\s|$)/i);
    if (feedbackMatch && feedbackMatch[1]) {
      feedback = feedbackMatch[1].trim();
    } else {
      // Fallback - use first paragraph if structured feedback not found
      const paragraphs = analysisText.split('\n\n');
      feedback = paragraphs[0];
    }
    
    // Extract improvement tips
    const tips: string[] = [];
    const tipsSection = analysisText.match(/(?:specific improvements|suggestions|tips|recommendations):?\s*([\s\S]*?)(?=$)/i);
    
    if (tipsSection && tipsSection[1]) {
      // Look for numbered or bulleted list items
      const listItems = tipsSection[1].match(/(?:\d+\.|-|\*)\s*([^\n]+)/g);
      if (listItems) {
        tips.push(...listItems.map((item: string) => item.replace(/^(?:\d+\.|-|\*)\s*/, '').trim()));
      }
    }
    
    // If no tips were extracted using the structured approach, try to extract numbered items from the full text
    if (tips.length === 0) {
      const numListItems = analysisText.match(/\d+\.\s*([^\n]+)/g);
      if (numListItems) {
        tips.push(...numListItems.map((item: string) => item.trim()));
      }
    }
    
    // Fallback if still no tips
    if (tips.length === 0) {
      tips.push(
        "Add more industry-specific keywords to your resume",
        "Ensure your job titles are standard and recognizable",
        "Quantify achievements with numbers and metrics",
        "Use a simple, ATS-friendly format without complex tables or graphics"
      );
    }
    
    // Set the analysis results
    setResumeAnalysis({
      score,
      feedback,
      tips: tips.slice(0, 5) // Limit to 5 tips
    });
    
    // Show the analysis modal
    setShowAnalysisModal(true);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    setOptimizationError('Failed to analyze resume. Please try again.');
  } finally {
    setIsAnalyzingResume(false);
  }
}; 