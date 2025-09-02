// Default resume data structure
export const defaultResumeData = {
  personalInfo: {
    name: "John Doe",
    fullName: "John Doe",
    title: "Software Developer",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    website: "johndoe.com",
    summary: "Experienced software developer with 5+ years of experience building web applications. Proficient in JavaScript, TypeScript, React, and Node.js. Passionate about creating user-friendly interfaces and optimizing application performance."
  },
  sectionOrder: ["personalInfo", "experience", "education", "skills", "projects", "certifications"],
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Developer",
      company: "Tech Solutions Inc.",
      position: "Senior Software Developer",
      startDate: "2020-01",
      endDate: "Present",
      current: true,
      location: "San Francisco, CA",
      description: "• Developed and maintained front-end applications using React and TypeScript\n• Collaborated with design team to implement responsive UI components\n• Improved application performance by 40% through code optimization\n• Led a team of 3 junior developers and mentored new hires"
    },
    {
      id: "exp-2",
      title: "Front-End Developer",
      company: "WebDev Startup",
      position: "Front-End Developer",
      startDate: "2018-03",
      endDate: "2019-12",
      current: false,
      location: "San Jose, CA",
      description: "• Built interactive web applications using JavaScript and React\n• Implemented responsive design principles for mobile compatibility\n• Collaborated with back-end team to integrate REST APIs\n• Participated in code reviews and implemented best practices"
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014-09",
      endDate: "2018-05",
      current: false,
      location: "Berkeley, CA",
      description: "Graduated with honors. Coursework included Software Development, Data Structures, Algorithms, and Web Development."
    }
  ],
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "HTML5",
    "CSS3",
    "Git",
    "REST APIs",
    "Redux",
    "PostgreSQL"
  ],
  projects: [
    {
      id: "proj-1",
      title: "E-commerce Platform",
      description: "Developed a full-stack e-commerce application with React, Node.js, and PostgreSQL. Implemented user authentication, product catalog, shopping cart, and payment processing features.",
      link: "github.com/johndoe/ecommerce"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2021-06",
      description: "Certification for developing, deploying, and debugging cloud-based applications using AWS."
    }
  ]
};
