/**
 * Verified founder profile — public, company-approved information only.
 */
export const FOUNDER = {
  fullName: 'Vikash Saravanan',
  professionalName: 'Vikash Saravanan',
  shortName: 'Vikash S',
  title: 'Founder & Lead Systems Engineer',
  organization: 'Logic Intelligence Technologies',
  location: 'Coimbatore / Karur, Tamil Nadu, India',
  education: {
    degree: 'Bachelor of Technology in Artificial Intelligence and Data Science',
    institution: 'Rathinam Technical Campus',
    location: 'Coimbatore, Tamil Nadu, India',
    expectedGraduation: '2029',
  },
  specializations: [
    'Artificial Intelligence',
    'Data Science',
    'Full-stack software engineering',
    'Robotic Process Automation',
    'Workflow automation',
    'Systems architecture',
    'Headless browser automation',
    'AI-enabled software systems',
  ] as const,
  shortBio:
    'Vikash Saravanan is an AI and data science engineer and the Founder of Logic Intelligence Technologies. His work focuses on full-stack software engineering, intelligent automation, workflow systems, and scalable application architecture.',
  extendedBio:
    'Vikash Saravanan is a software engineer, AI researcher, and entrepreneur based in Tamil Nadu, India. He is the Founder and Lead Systems Engineer at Logic Intelligence Technologies, a technology company focused on scalable software platforms, intelligent automation, and production-oriented workflow systems.\n\nHe is pursuing a Bachelor of Technology in Artificial Intelligence and Data Science at Rathinam Technical Campus in Coimbatore. His engineering approach emphasizes structured system design, deterministic workflows, schema validation, state-based automation, and maintainable software architecture.\n\nHis technical work includes full-stack web applications, AI-enabled backend systems, headless browser automation, robotic process automation, and cloud-based applications using modern frontend, backend, database, and deployment technologies.',
  oneLine:
    'AI systems engineer, full-stack developer, and Founder of Logic Intelligence Technologies, specializing in intelligent automation and production software systems.',
  images: {
    // Production paths: use assets already on main until public/images/founder/* binaries are pushed.
    profile: '/assets/founder.jpg',
    profileJpg: '/assets/founder.jpg',
    square: '/assets/founder.jpg',
    squareJpg: '/assets/founder.jpg',
    banner: '/assets/og-banner.jpg',
    og: '/assets/og-banner.jpg',
    alt: 'Vikash Saravanan, Founder and Lead Systems Engineer at Logic Intelligence Technologies.',
  },
  links: {
    portfolio: 'https://vikashsaravanann.github.io/startupwithvikash/',
    corporate: 'https://www.logicintelligencetechnologies.in/',
    linkedin: 'https://www.linkedin.com/in/vikash-saravanan-j7528/',
    github: 'https://github.com/vikashsaravanann',
    instagram: 'https://www.instagram.com/vikash.saravanann',
  },
  projects: [
    {
      name: 'Omni-Apply Autonomous Workflow Engine',
      url: 'https://github.com/vikashsaravanann/omni-apply',
      description:
        'Autonomous workflow engine for structured application and process automation.',
      technologies: [
        'Python',
        'Playwright',
        'LLM orchestration',
        'Headless browser automation',
        'Structured schemas',
        'Deterministic workflow execution',
      ],
    },
  ],
} as const;

export type FounderConfig = typeof FOUNDER;
