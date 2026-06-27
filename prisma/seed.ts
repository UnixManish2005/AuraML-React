// ============================================================
// DATABASE SEED - Sample data for development
// ============================================================

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash passwords
  const adminPass = await bcrypt.hash("Admin@123", 12);
  const trainerPass = await bcrypt.hash("Trainer@123", 12);
  const studentPass = await bcrypt.hash("Student@123", 12);

  // ---- ADMIN ----
  const adminUser = await db.user.upsert({
    where: { email: "admin@auraml.com" },
    update: { password: adminPass, role: "SUPER_ADMIN", status: "ACTIVE" },
    create: {
      name: "Super Admin",
      email: "admin@auraml.com",
      password: adminPass,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  await db.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, department: "Management" },
  });

  // ---- TRAINERS ----
  const trainerUsers = await Promise.all([
    db.user.upsert({
      where: { email: "trainer@auraml.com" },
      update: { password: trainerPass, role: "TRAINER", status: "ACTIVE" },
      create: { name: "Priya Sharma", email: "trainer@auraml.com", password: trainerPass, role: "TRAINER", status: "ACTIVE" },
    }),
    db.user.upsert({
      where: { email: "trainer2@auraml.com" },
      update: { password: trainerPass, role: "TRAINER", status: "ACTIVE" },
      create: { name: "Rahul Verma", email: "trainer2@auraml.com", password: trainerPass, role: "TRAINER", status: "ACTIVE" },
    }),
  ]);

  const trainers = await Promise.all(trainerUsers.map((u, i) =>
    db.trainer.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        expertise: i === 0 ? ["Machine Learning", "Python", "Deep Learning"] : ["Data Science", "NLP", "Statistics"],
        bio: "Experienced AI/ML trainer with industry background",
        experience: i === 0 ? 5 : 3,
        rating: i === 0 ? 4.8 : 4.6,
      },
    })
  ));

  // ---- COURSES ----
  const courses = await Promise.all([
    db.course.upsert({
      where: { slug: "python-fundamentals" },
      update: {},
      create: {
        title: "Python Fundamentals",
        slug: "python-fundamentals",
        description: "Master Python programming from scratch with hands-on projects",
        level: "BEGINNER",
        duration: 40,
        isFree: true,
        isPublished: true,
        tags: ["Python", "Programming", "Beginner"],
        skills: ["Python", "OOP", "File Handling", "Libraries"],
      },
    }),
    db.course.upsert({
      where: { slug: "machine-learning-complete" },
      update: {},
      create: {
        title: "Machine Learning Complete",
        slug: "machine-learning-complete",
        description: "Comprehensive ML course covering algorithms, math, and real projects",
        level: "INTERMEDIATE",
        duration: 80,
        isFree: false,
        isPublished: true,
        tags: ["ML", "AI", "Python", "Scikit-learn"],
        skills: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation"],
      },
    }),
    db.course.upsert({
      where: { slug: "deep-learning-nlp" },
      update: {},
      create: {
        title: "Deep Learning & NLP",
        slug: "deep-learning-nlp",
        description: "Neural networks, transformers, and modern NLP techniques",
        level: "ADVANCED",
        duration: 100,
        isFree: false,
        isPublished: true,
        tags: ["Deep Learning", "NLP", "TensorFlow", "Transformers"],
        skills: ["Neural Networks", "CNN", "RNN", "BERT", "GPT"],
      },
    }),
    db.course.upsert({
      where: { slug: "data-science-bootcamp" },
      update: {},
      create: {
        title: "Data Science Bootcamp",
        slug: "data-science-bootcamp",
        description: "End-to-end data science: from EDA to deployment",
        level: "INTERMEDIATE",
        duration: 60,
        isFree: false,
        isPublished: true,
        tags: ["Data Science", "Pandas", "Matplotlib", "SQL"],
        skills: ["EDA", "Data Visualization", "Feature Engineering", "Model Deployment"],
      },
    }),
  ]);

  // ---- BATCHES ----
  const batches = await Promise.all([
    db.batch.upsert({
      where: { id: "batch-aiml-a" },
      update: {},
      create: {
        id: "batch-aiml-a",
        name: "AIML Batch A - Jan 2025",
        courseId: courses[1].id,
        trainerId: trainers[0].id,
        startDate: new Date("2025-01-15"),
        endDate: new Date("2025-06-15"),
        status: "ACTIVE",
        capacity: 30,
        description: "Morning batch for working professionals",
      },
    }),
    db.batch.upsert({
      where: { id: "batch-python-a" },
      update: {},
      create: {
        id: "batch-python-a",
        name: "Python Batch A - Feb 2025",
        courseId: courses[0].id,
        trainerId: trainers[1].id,
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-05-01"),
        status: "ACTIVE",
        capacity: 25,
        description: "Weekend batch for beginners",
      },
    }),
  ]);

  // ---- STUDENTS ----
  const studentData = [
    { name: "Arjun Patel", email: "student@auraml.com" },
    { name: "Priya Singh", email: "student2@auraml.com" },
    { name: "Rahul Kumar", email: "student3@auraml.com" },
    { name: "Ananya Sharma", email: "student4@auraml.com" },
    { name: "Vikram Nair", email: "student5@auraml.com" },
  ];

  for (const [i, s] of studentData.entries()) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: { password: studentPass, role: "STUDENT", status: "ACTIVE" },
      create: { name: s.name, email: s.email, password: studentPass, role: "STUDENT", status: "ACTIVE" },
    });

    const student = await db.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        college: ["IIT Bombay", "NIT Pune", "VIT Vellore", "BITS Pilani", "Delhi University"][i],
        degree: "B.Tech",
        yearOfStudy: (i % 4) + 1,
        skills: ["Python", "ML"][i % 2 === 0 ? 0 : 1] ? ["Python", "ML"] : ["Python"],
        totalPoints: (i + 1) * 250,
        streak: i + 1,
      },
    });

    await db.userAnalytics.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, quizzesTaken: i * 3, avgQuizScore: 60 + i * 5 },
    });

    // Add to batch
    await db.batchStudent.upsert({
      where: { batchId_studentId: { batchId: batches[i % 2].id, studentId: student.id } },
      update: {},
      create: { batchId: batches[i % 2].id, studentId: student.id },
    });
  }

  // ---- QUIZ ----
  const quiz = await db.quiz.upsert({
    where: { id: "quiz-python-basics" },
    update: {},
    create: {
      id: "quiz-python-basics",
      title: "Python Basics Assessment",
      description: "Test your foundational Python knowledge",
      courseId: courses[0].id,
      batchId: batches[1].id,
      duration: 20,
      passingScore: 60,
      totalMarks: 10,
      randomize: true,
      maxAttempts: 3,
      isPublished: true,
    },
  });

  // Questions
  const questionsData = [
    { type: "MCQ" as const, question: "What is the output of `print(type([]))`?", options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "<class 'dict'>"], correctAnswer: "<class 'list'>", explanation: "[] creates an empty list in Python", marks: 1, difficulty: 1 },
    { type: "TRUE_FALSE" as const, question: "Python is a compiled language.", options: undefined, correctAnswer: "False", explanation: "Python is an interpreted language", marks: 1, difficulty: 1 },
    { type: "MCQ" as const, question: "Which of the following is used to define a function in Python?", options: ["func", "def", "function", "define"], correctAnswer: "def", explanation: "The `def` keyword is used to define functions in Python", marks: 1, difficulty: 1 },
    { type: "FILL_BLANK" as const, question: "The ________ function is used to get the length of a list in Python.", options: undefined, correctAnswer: "len", explanation: "len() returns the number of items in an object", marks: 1, difficulty: 1 },
    { type: "MCQ" as const, question: "What does `//` operator do in Python?", options: ["Division", "Floor division", "Modulo", "Power"], correctAnswer: "Floor division", explanation: "// performs integer (floor) division", marks: 1, difficulty: 2 },
  ];

  for (const [i, q] of questionsData.entries()) {
    await db.question.upsert({
      where: { id: `q-python-${i + 1}` },
      update: {},
      create: {
        id: `q-python-${i + 1}`,
        quizId: quiz.id,
        type: q.type,
        question: q.question,
        options: q.options ?? Prisma.JsonNull,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        difficulty: q.difficulty,
        order: i + 1,
      },
    });
  }

  // ---- ANNOUNCEMENTS ----
  await db.announcement.upsert({
    where: { id: "ann-1" },
    update: {},
    create: {
      id: "ann-1",
      authorId: adminUser.id,
      title: "Welcome to AuraML Platform! 🎉",
      content: "We are thrilled to launch our AI-powered learning platform. Start exploring courses, use the AI tutor, build your resume, and track your progress. Best of luck on your learning journey!",
      type: "GENERAL",
      targetRoles: ["STUDENT", "TRAINER"],
      isPublished: true,
      pinned: true,
    },
  });

  await db.announcement.upsert({
    where: { id: "ann-2" },
    update: {},
    create: {
      id: "ann-2",
      authorId: adminUser.id,
      title: "AI/ML Hackathon 2025 - Register Now! 🚀",
      content: "Exciting news! We are organizing a 48-hour AI/ML hackathon. Prizes worth ₹1,00,000 up for grabs. Teams of 2-4 members. Registration closes January 20, 2025.",
      type: "HACKATHON",
      targetRoles: ["STUDENT"],
      isPublished: true,
      pinned: false,
    },
  });

  // ---- JOBS ----
  await db.job.upsert({
    where: { id: "job-1" },
    update: {},
    create: {
      id: "job-1",
      title: "Data Science Intern",
      company: "TechCorp India",
      location: "Bangalore, India (Hybrid)",
      type: "INTERNSHIP",
      description: "Join our data science team to work on real ML projects. You will analyse large datasets, build predictive models, and present insights to stakeholders.",
      requirements: ["Python", "Pandas", "Scikit-learn", "SQL", "Statistics basics"],
      salary: "₹15,000 - ₹25,000/month",
      link: "https://example.com/apply",
      deadline: new Date("2025-02-28"),
      isActive: true,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Demo Accounts:");
  console.log("   Admin:   admin@auraml.com    / Admin@123");
  console.log("   Trainer: trainer@auraml.com  / Trainer@123");
  console.log("   Student: student@auraml.com  / Student@123");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect());
