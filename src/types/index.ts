// ============================================================
// PLATFORM TYPES
// ============================================================

export type Role = "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "STUDENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type LessonType = "VIDEO" | "PDF" | "TEXT" | "LINK" | "ASSIGNMENT" | "PROJECT";
export type QuestionType = "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "FILL_BLANK" | "SCENARIO" | "CODING";
export type AttemptStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type CertificateType = "COURSE_COMPLETION" | "QUIZ_COMPLETION" | "PROJECT_COMPLETION";
export type AnnouncementType = "NOTICE" | "EVENT" | "WORKSHOP" | "HACKATHON" | "PLACEMENT" | "GENERAL";
export type JobType = "JOB" | "INTERNSHIP" | "HACKATHON" | "FREELANCE";
export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "SELECTED" | "REJECTED";
export type ResumeTemplate = "MODERN" | "PROFESSIONAL" | "MINIMAL" | "CREATIVE";

// ---- USER TYPES ----

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  status: UserStatus;
  phone?: string | null;
  image?: string | null;
  createdAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  college?: string;
  degree?: string;
  yearOfStudy?: number;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  totalPoints: number;
  streak: number;
  user: User;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  expertise: string[];
  bio?: string;
  experience: number;
  rating: number;
  user: User;
}

// ---- COURSE TYPES ----

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  level: CourseLevel;
  duration: number;
  isFree: boolean;
  isPublished: boolean;
  tags: string[];
  skills: string[];
  _count?: { modules: number; batches: number };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: number;
  order: number;
  isFree: boolean;
}

// ---- BATCH TYPES ----

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  trainerId: string;
  startDate: Date;
  endDate: Date;
  status: BatchStatus;
  capacity: number;
  course?: Course;
  trainer?: TrainerProfile;
  _count?: { batchStudents: number };
}

// ---- QUIZ TYPES ----

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  batchId?: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  negativeMarking: boolean;
  randomize: boolean;
  maxAttempts: number;
  isPublished: boolean;
  _count?: { questions: number; attempts: number };
}

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  marks: number;
  difficulty: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  status: AttemptStatus;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeTaken?: number;
}

// ---- RESUME TYPES ----

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  title?: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  location?: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  techStack: string[];
  link?: string;
  github?: string;
  bullets: string[];
}

export interface Skills {
  technical: string[];
  soft: string[];
  tools: string[];
  languages: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary?: string;
  experience: Experience[];
  education: Education[];
  skills: Skills;
  projects: Project[];
  achievements: string[];
  certifications: Array<{ name: string; issuer: string; date: string; url?: string }>;
}

export interface ATSReport {
  score: number;
  keywords: { found: string[]; missing: string[] };
  formatting: { score: number; issues: string[] };
  sections: { present: string[]; missing: string[] };
  suggestions: string[];
  breakdown: { keywords: number; experience: number; education: number; skills: number; formatting: number };
}

// ---- ANALYTICS TYPES ----

export interface DashboardStats {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  totalBatches: number;
  activeUsers: number;
  quizAttempts: number;
  certificatesIssued: number;
  growth: {
    students: number;
    quizzes: number;
    certificates: number;
  };
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// ---- AI TYPES ----

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  name: "gemini" | "openrouter" | "groq";
  available: boolean;
}

// ---- PROJECT BUILDER TYPES ----

export interface ProjectTemplate {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  techStack: string[];
  tags: string[];
  icon: string;
}

// ---- NOTIFICATION TYPES ----

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  link?: string;
  createdAt: Date;
}

// ---- API RESPONSE TYPES ----

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
