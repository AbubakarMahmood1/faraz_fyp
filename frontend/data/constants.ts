/**
 * Application-wide constants
 * Centralized location for dropdown options, fixed values, and configuration
 */

// User Roles
export const USER_ROLES = [
  { label: "Explorer", value: "explorer" },
  { label: "Expert", value: "expert" },
  { label: "Innovator", value: "innovator" },
  { label: "Investor", value: "investor" },
] as const;

// Gender Options
export const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer-not" },
] as const;

// Experience Levels
export const EXPERIENCE_LEVELS = [
  { label: "1-2 years", value: "1-2" },
  { label: "3-5 years", value: "3-5" },
  { label: "5-10 years", value: "5-10" },
  { label: "10+ years", value: "10+" },
] as const;

// Expertise Areas (for Experts and Innovators)
export const EXPERTISE_AREAS = [
  { label: "Artificial Intelligence & Machine Learning", value: "ai-ml" },
  { label: "Web Development", value: "web-dev" },
  { label: "Mobile Development", value: "mobile-dev" },
  { label: "Data Science & Analytics", value: "data-science" },
  { label: "Cybersecurity", value: "cybersecurity" },
  { label: "Cloud Computing & DevOps", value: "cloud-devops" },
  { label: "Blockchain & Cryptocurrency", value: "blockchain" },
  { label: "Internet of Things (IoT)", value: "iot" },
  { label: "UI/UX Design", value: "ui-ux" },
  { label: "Software Architecture", value: "software-architecture" },
  { label: "Database Management", value: "database" },
  { label: "Game Development", value: "game-dev" },
  { label: "AR/VR Development", value: "ar-vr" },
  { label: "Product Management", value: "product-management" },
  { label: "Business Strategy", value: "business-strategy" },
  { label: "Marketing & Growth", value: "marketing" },
  { label: "Financial Planning", value: "finance" },
  { label: "Legal & Compliance", value: "legal" },
  { label: "Other", value: "other" },
] as const;

// Technical Skills
export const TECHNICAL_SKILLS = [
  // Programming Languages
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },

  // Frontend
  { label: "React", value: "react" },
  { label: "Next.js", value: "nextjs" },
  { label: "Vue.js", value: "vuejs" },
  { label: "Angular", value: "angular" },
  { label: "HTML/CSS", value: "html-css" },
  { label: "Tailwind CSS", value: "tailwind" },

  // Backend
  { label: "Node.js", value: "nodejs" },
  { label: "Express.js", value: "expressjs" },
  { label: "Django", value: "django" },
  { label: "Flask", value: "flask" },
  { label: "Spring Boot", value: "spring-boot" },
  { label: ".NET", value: "dotnet" },

  // Databases
  { label: "MongoDB", value: "mongodb" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "MySQL", value: "mysql" },
  { label: "Redis", value: "redis" },
  { label: "Firebase", value: "firebase" },

  // Cloud & DevOps
  { label: "AWS", value: "aws" },
  { label: "Google Cloud", value: "gcp" },
  { label: "Azure", value: "azure" },
  { label: "Docker", value: "docker" },
  { label: "Kubernetes", value: "kubernetes" },
  { label: "CI/CD", value: "cicd" },

  // Mobile
  { label: "React Native", value: "react-native" },
  { label: "Flutter", value: "flutter" },
  { label: "iOS Development", value: "ios" },
  { label: "Android Development", value: "android" },

  // Other
  { label: "Git", value: "git" },
  { label: "GraphQL", value: "graphql" },
  { label: "REST APIs", value: "rest-api" },
  { label: "Testing (Jest, Cypress, etc.)", value: "testing" },
] as const;

// Investing Experience (for Investors)
export const INVESTING_EXPERIENCE = [
  { label: "Angel Investing", value: "angel" },
  { label: "Venture Capital", value: "vc" },
  { label: "Private Equity", value: "pe" },
  { label: "Crowdfunding", value: "crowdfunding" },
  { label: "Stock Market", value: "stock-market" },
  { label: "Real Estate", value: "real-estate" },
  { label: "Cryptocurrency", value: "crypto" },
  { label: "Startup Advisory", value: "advisory" },
  { label: "First-time Investor", value: "first-time" },
] as const;

// Countries (Common ones - extend as needed)
export const COUNTRIES = [
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Canada", value: "ca" },
  { label: "Pakistan", value: "pk" },
  { label: "India", value: "in" },
  { label: "China", value: "cn" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Australia", value: "au" },
  { label: "Japan", value: "jp" },
  { label: "Singapore", value: "sg" },
  { label: "UAE", value: "ae" },
  { label: "Other", value: "other" },
] as const;

// Application Constants
export const APP_CONFIG = {
  APP_NAME: "Innovation Platform",
  MAX_BIO_LENGTH: 500,
  MIN_BIO_LENGTH: 50,
  MAX_FILE_SIZE_MB: 5,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  REGISTRATION: {
    INNOVATOR: '/registeration/innovator',
    EXPERT: '/registeration/expert',
    INVESTOR: '/registeration/investor',
  },
  PASSWORD: {
    FORGOT: '/password/forgot',
    RESET: '/password/reset',
  },
} as const;
