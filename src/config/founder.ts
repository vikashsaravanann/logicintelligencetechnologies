/**
 * Verified founder profile — public, company-approved information only.
 */
export const FOUNDER = {
  name: 'Vikash Saravanan',
  professionalName: 'Vikash Saravanan',
  alternateNames: ['Vikash S'],
  title: 'Founder & Lead Systems Engineer',
  company: 'Logic Intelligence Technologies',
  location: 'Coimbatore, Tamil Nadu, India',
  executiveOverview:
    'Vikash Saravanan is an AI systems engineer, full-stack developer, and the Founder of Logic Intelligence Technologies.',
  shortBio:
    'Vikash Saravanan is an AI and Data Science engineer and the Founder of Logic Intelligence Technologies, an independent technology startup focused on autonomous systems and full-stack architecture. Specializing in Python, FastAPI, React, and headless browser orchestration, he architects automated pipelines that reduce manual digital work. He is currently pursuing a Bachelor of Technology in Artificial Intelligence and Data Science at Rathinam Technical Campus in Coimbatore.',
  longBio:
    'Vikash Saravanan is a software engineer and technology entrepreneur working at the intersection of artificial intelligence and applied systems engineering. As the Founder and Lead Systems Engineer of Logic Intelligence Technologies, he operates an independent technology venture focused on robust web applications, intelligent API integrations, and autonomous Robotic Process Automation tools.\n\nHe is pursuing a Bachelor of Technology in Artificial Intelligence and Data Science at Rathinam Technical Campus in Coimbatore from 2025 to 2029. His engineering philosophy emphasizes deterministic scaffolding, strict schema validation, state-machine-driven automation, and maintainable production architecture rather than superficial AI wrappers.\n\nA central focus of his current work is headless browser orchestration using Python and Playwright. By integrating Large Language Model APIs into structured automation architectures, he develops systems capable of interpreting dynamic web interfaces, making context-aware decisions, and executing controlled workflows.\n\nBeyond his software ventures, Vikash is involved in applied AI initiatives, including structured data-collection work related to robot-learning models.',
  companyOverview:
    'Logic Intelligence Technologies is an independent technology venture focused on custom software development, intelligent automation, and AI integration. The company builds scalable digital infrastructure, full-stack applications, autonomous workflow systems, and intelligent backend integrations for practical business use cases.',
  companyCapabilities: {
    fullStackArchitecture:
      'Developing high-performance web platforms using React, Next.js, FastAPI, Supabase, PostgreSQL, and modern cloud deployment infrastructure.',
    autonomousRpaEngineering:
      'Designing headless automation systems that interact with dynamic web interfaces to execute structured data-entry and workflow tasks.',
    intelligentApiOrchestration:
      'Embedding custom AI logic into existing enterprise backends to support automated decision-making, structured processing, and workflow execution.',
  },
  education: {
    degree: 'Bachelor of Technology in Artificial Intelligence and Data Science',
    institution: 'Rathinam Technical Campus',
    location: 'Coimbatore, Tamil Nadu, India',
    timeline: '2025–2029',
  },
  timeline: '2025–2029',
  credentials: [
    {
      title: 'Data Analytics Professional Internship',
      institution: 'Edu Tantr',
      type: 'Internship',
    },
    {
      title: 'The Joy of Computing using Python',
      issuingOrganization: 'NPTEL',
      type: 'Certification',
    },
  ],
  expertise: {
    programmingLanguages: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML5', 'CSS3'],
    backendAndApiEngineering: ['FastAPI', 'Node.js', 'REST API design', 'Structured backend architecture'],
    frontendEngineering: ['React.js', 'Next.js', 'Tailwind CSS'],
    databaseAndCloudInfrastructure: ['Supabase', 'PostgreSQL', 'Vercel', 'Git', 'GitHub'],
    automationAndAi: [
      'Playwright',
      'Headless browser orchestration',
      'Robotic Process Automation',
      'LLM API integration',
    ],
  },
  projects: [
    {
      name: 'The Omni-Apply Autonomous Workflow Engine',
      url: 'https://github.com/vikashsaravanann/omni-apply',
      description:
        'The Omni-Apply Autonomous Workflow Engine is a Robotic Process Automation system designed to navigate and execute structured web workflows. The system analyzes live DOM structures, identifies contextual form fields and screening prompts, routes structured information to an LLM API, and executes controlled data-entry workflows using schema-based automation.',
      technologies: [
        'Python',
        'Playwright',
        'Large Language Model orchestration APIs',
        'Headless browser architecture',
        'Structured configuration schemas',
        'Deterministic workflow execution',
      ],
    },
  ],
  initiatives: [
    {
      project: 'Project Bumblebee',
      organization: 'Deccan Experts',
      role: 'Shortlisted Participant / Contributor',
      description:
        'Contributed to a specialized data-collection initiative focused on generating structured, high-fidelity datasets for training modern robot-learning models.',
    },
  ],
  portfolioUrl: 'https://vikashsaravanann.github.io/startupwithvikash/',
  companyUrl: 'https://www.logicintelligencetechnologies.in/',
  linkedinUrl: 'https://www.linkedin.com/in/vikash-saravanan-j7528/',
  githubUrl: 'https://github.com/vikashsaravanann',
  instagramUrl: 'https://www.instagram.com/vikash.saravanann',
  imageUrl: 'https://www.logicintelligencetechnologies.in/images/founder/vikash-saravanan-profile.webp',
  ogImageUrl: 'https://www.logicintelligencetechnologies.in/images/founder/vikash-saravanan-og.webp',
  schemaId: 'https://www.logicintelligencetechnologies.in/#founder',
} as const;

export type FounderConfig = typeof FOUNDER;
