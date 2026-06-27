// ============================================================
// ZOD VALIDATORS
// ============================================================

import { z } from "zod";

// ---- AUTH ----

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
  role: z.enum(["STUDENT", "TRAINER"]).default("STUDENT"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

// ---- STUDENT ----

export const studentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  college: z.string().optional(),
  degree: z.string().optional(),
  yearOfStudy: z.number().min(1).max(6).optional(),
  courseId: z.string().optional(),
  batchId: z.string().optional(),
});

// ---- TRAINER ----

export const trainerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  expertise: z.array(z.string()).default([]),
  experience: z.number().min(0).default(0),
});

// ---- BATCH ----

export const batchSchema = z.object({
  name: z.string().min(2, "Batch name required"),
  courseId: z.string().min(1, "Course required"),
  trainerId: z.string().min(1, "Trainer required"),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
});

// ---- COURSE ----

export const courseSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(10, "Description required"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.number().min(1),
  isFree: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

// ---- MODULE ----

export const moduleSchema = z.object({
  courseId: z.string().min(1, "Course required"),
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  order: z.number().min(1).default(1),
});

// ---- LESSON ----

export const lessonSchema = z.object({
  moduleId: z.string().min(1, "Module required"),
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "TEXT", "LINK", "CODING", "ASSIGNMENT"]),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  pdfUrl: z.string().url().optional().or(z.literal("")),
  duration: z.number().min(1).optional(),
  order: z.number().min(1).default(1),
  isFree: z.boolean().default(false),
});

// ---- QUIZ ----

export const quizSchema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().optional(),
  courseId: z.string().optional(),
  batchId: z.string().optional(),
  duration: z.number().min(1, "Duration required"),
  passingScore: z.number().min(1).max(100),
  totalMarks: z.number().min(1),
  negativeMarking: z.boolean().default(false),
  negativeValue: z.number().default(0.25),
  randomize: z.boolean().default(true),
  maxAttempts: z.number().min(1).default(3),
});

export const questionSchema = z.object({
  type: z.enum(["MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "FILL_BLANK", "SCENARIO", "CODING"]),
  question: z.string().min(5),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
  marks: z.number().min(1).default(1),
  difficulty: z.number().min(1).max(5).default(1),
});

// ---- RESUME ----

export const personalInfoSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  location: z.string(),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  title: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  isCurrent: z.boolean().default(false),
  location: z.string().optional(),
  bullets: z.array(z.string()),
});

export const educationSchema = z.object({
  institution: z.string().min(2),
  degree: z.string().min(2),
  field: z.string(),
  startYear: z.number(),
  endYear: z.number(),
  gpa: z.string().optional(),
});

// ---- ANNOUNCEMENT ----

export const announcementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  type: z.enum(["NOTICE", "EVENT", "WORKSHOP", "HACKATHON", "PLACEMENT", "GENERAL"]),
  targetRoles: z.array(z.enum(["STUDENT", "TRAINER", "ADMIN", "SUPER_ADMIN"])).default(["STUDENT"]),
  pinned: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

// ---- JOB ----

export const jobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string(),
  type: z.enum(["JOB", "INTERNSHIP", "HACKATHON", "FREELANCE"]),
  description: z.string().min(20),
  requirements: z.array(z.string()).default([]),
  salary: z.string().optional(),
  link: z.string().url().optional(),
  deadline: z.string().optional(),
});

// ---- TYPE EXPORTS ----

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type TrainerInput = z.infer<typeof trainerSchema>;
export type BatchInput = z.infer<typeof batchSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type JobInput = z.infer<typeof jobSchema>;
