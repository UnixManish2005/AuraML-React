# 🎓 AuraML Platform — Production-Ready EdTech SaaS

A complete, enterprise-grade EdTech SaaS platform for AI, Machine Learning, Data Science, and Python training — built with Next.js 15, TypeScript, Prisma, and Google Gemini AI.

> **Inspired by**: Coursera + DataCamp + LeetCode + Kaggle + LinkedIn Learning

---

## 🚀 Features

### 👨‍💼 Admin Panel
- **Dashboard** — KPI cards, real-time analytics, charts
- **Student Management** — Add, edit, suspend, bulk import (CSV/Excel)
- **Trainer Management** — Assign courses and batches
- **Batch Management** — Create and manage student groups
- **Course Management** — Create courses with modules, lessons, videos, PDFs
- **Quiz Management** — MCQ, True/False, Fill-in-blank, Coding questions
- **Analytics** — Platform-wide stats, pass rates, completion rates
- **Announcements** — Post events, hackathons, placements
- **Job/Placement Portal** — Post jobs and internships

### 👨‍🏫 Trainer Portal
- View assigned batches
- Create and publish quizzes
- Track student performance

### 👨‍🎓 Student Portal
- **Dashboard** — Progress, streak, leaderboard
- **Course Player** — Watch videos, read notes, download assignments
- **Quiz Engine** — Timed quizzes with negative marking, auto-submission
- **AI Tutor (EduBot)** — Powered by Gemini — ask any Python/ML question
- **ML Learning Lab** — Interactive visual experiments (Linear Regression, K-Means, Decision Trees)
- **ATS Resume Builder** — Multi-step builder with AI writing + ATS scoring
- **Project Generator** — AI-generated project blueprints (House Price Prediction, Sentiment Analysis, etc.)
- **Certificates** — Auto-issued, QR-verifiable
- **Jobs & Internships** — One-click apply

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **UI Components** | Custom + Radix UI primitives |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **State** | Zustand |
| **Auth** | Auth.js v5 (JWT sessions) |
| **ORM** | Prisma |
| **Database** | PostgreSQL (Supabase) |
| **Storage** | Supabase Storage |
| **AI** | Google Gemini 1.5 Flash (primary), OpenRouter, Groq (fallback) |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
edtech-platform/
├── prisma/
│   ├── schema.prisma          # Complete database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── (landing)/         # Public landing page
│   │   ├── auth/              # Login, Register, Forgot Password
│   │   ├── admin/             # Admin portal pages
│   │   ├── trainer/           # Trainer portal pages
│   │   ├── student/           # Student portal pages
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── admin/             # Admin UI components
│   │   ├── student/           # Student UI components
│   │   ├── trainer/           # Trainer UI components
│   │   ├── quiz/              # Quiz builder & engine
│   │   ├── resume/            # Resume builder steps
│   │   ├── lab/               # ML lab visualizations
│   │   ├── shared/            # Shared components
│   │   └── ui/                # Base UI primitives
│   ├── lib/
│   │   ├── ai/                # AI provider (Gemini/OpenRouter/Groq)
│   │   ├── auth/              # Auth.js config + helpers
│   │   ├── db/                # Prisma client
│   │   ├── utils/             # Utility functions
│   │   └── validators/        # Zod schemas
│   ├── types/                 # TypeScript types
│   ├── styles/                # Global CSS
│   └── middleware.ts          # Route protection
├── .env.example               # Environment variable template
├── package.json
├── tailwind.config.ts
└── next.config.ts
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase free tier)
- Google Gemini API key (free at ai.google.dev)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/edtech-platform.git
cd edtech-platform
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Auth
AUTH_SECRET="your-32-char-secret"
AUTH_URL="http://localhost:3000"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# AI (get free key at https://ai.google.dev)
GEMINI_API_KEY="your-gemini-api-key"

# Optional AI fallbacks
OPENROUTER_API_KEY="your-openrouter-key"
GROQ_API_KEY="your-groq-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Accounts

After seeding, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@auraml.com | Admin@123 |
| Trainer | trainer@auraml.com | Trainer@123 |
| Student | student@auraml.com | Student@123 |

---

## 🗄️ Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **Settings → Database** → Copy connection strings
3. Paste into `.env.local` as `DATABASE_URL` and `DIRECT_URL`
4. Run `npm run db:push` to create all tables
5. Run `npm run db:seed` to populate with sample data

### Storage Setup
1. In Supabase → **Storage** → Create buckets:
   - `videos` (public)
   - `pdfs` (public)
   - `avatars` (public)
2. Set bucket policies to allow public read

---

## 🤖 AI Setup

### Google Gemini (Recommended — Free)
1. Visit [ai.google.dev](https://ai.google.dev)
2. Create API key
3. Add to `.env.local` as `GEMINI_API_KEY`
4. **Free tier**: 15 RPM, 1 million tokens/day

### OpenRouter (Fallback — Free Models Available)
1. Visit [openrouter.ai](https://openrouter.ai)
2. Create account → Generate API key
3. Add to `.env.local` as `OPENROUTER_API_KEY`
4. Uses `meta-llama/llama-3.1-8b-instruct:free` by default

### Groq (Fallback — Ultra Fast Free Tier)
1. Visit [console.groq.com](https://console.groq.com)
2. Create API key
3. Add to `.env.local` as `GROQ_API_KEY`

The system automatically falls back: **Gemini → OpenRouter → Groq**

---

## 🚀 Deployment (Vercel + Supabase)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/edtech-platform.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Visit [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Add all environment variables from `.env.local`
4. Set `AUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)
5. Deploy!

### 3. Post-Deployment

```bash
# Run migrations on production database
npx prisma migrate deploy

# Seed production database (optional)
npm run db:seed
```

---

## 📊 Database Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | All users (admin/trainer/student) |
| `students` | Student profiles |
| `trainers` | Trainer profiles |
| `admins` | Admin profiles |
| `courses` | Course catalog |
| `modules` | Course sections |
| `lessons` | Individual lessons |
| `batches` | Student groups |
| `batch_students` | Batch enrollment |
| `quizzes` | Quiz definitions |
| `questions` | Quiz questions |
| `answers` | Student answers |
| `quiz_attempts` | Attempt records + scores |
| `student_progress` | Course progress tracking |
| `certificates` | Issued certificates |
| `resume_profiles` | ATS resume data |
| `project_builds` | AI-generated projects |
| `chat_messages` | AI tutor conversations |
| `announcements` | Platform announcements |
| `notifications` | User notifications |
| `jobs` | Job/internship listings |
| `job_applications` | Student applications |
| `user_analytics` | Per-user analytics |
| `platform_analytics` | Platform-wide metrics |

---

## 🔐 Role-Based Access Control

| Feature | Super Admin | Admin | Trainer | Student |
|---------|-------------|-------|---------|---------|
| Manage Students | ✅ | ✅ | ❌ | ❌ |
| Manage Trainers | ✅ | ✅ | ❌ | ❌ |
| Create Batches | ✅ | ✅ | ❌ | ❌ |
| Create Courses | ✅ | ✅ | ❌ | ❌ |
| Create Quizzes | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ (own) | ❌ |
| Take Quizzes | ❌ | ❌ | ❌ | ✅ |
| AI Tutor | ❌ | ❌ | ❌ | ✅ |
| Resume Builder | ❌ | ❌ | ❌ | ✅ |
| ML Lab | ❌ | ❌ | ❌ | ✅ |

---

## 🧪 API Reference

### Authentication
```
POST /api/auth/register    — Create account
POST /api/auth/[...nextauth] — Auth.js handler
```

### Admin
```
GET/POST   /api/admin/students         — List / Create students
PATCH/DELETE /api/admin/students/[id]  — Update / Delete student
GET/POST   /api/admin/batches          — List / Create batches
GET/POST   /api/admin/courses          — List / Create courses
GET/POST   /api/admin/trainers         — List / Create trainers
GET/POST   /api/admin/announcements    — List / Create announcements
```

### Quizzes
```
GET/POST   /api/quizzes            — List / Create quizzes
GET        /api/quizzes/[id]       — Get quiz with questions
POST       /api/quizzes/[id]/attempt — Submit quiz attempt
```

### AI
```
POST /api/ai/chat              — AI Tutor chat
POST /api/ai/resume-write      — AI resume content generation
POST /api/ai/generate-project  — AI project blueprint
POST /api/resume/ats-score     — ATS resume analysis
```

### Resume & Jobs
```
GET/POST/PUT /api/resume        — Resume CRUD
GET/POST     /api/jobs          — Jobs list / create
POST         /api/jobs/[id]/apply — Apply to job
```

---

## 🎨 Customization

### Colors & Branding
Edit `src/styles/globals.css` CSS variables:
```css
:root {
  --primary: 220.9 39.3% 11%;   /* Change primary color */
  --brand-primary: 217 91% 60%;  /* Brand blue */
}
```

### AI Provider Priority
Edit `src/lib/ai/provider.ts`:
```typescript
const providers = [
  { name: "gemini", fn: () => callGemini(...) },
  { name: "openrouter", fn: () => callOpenRouter(...) },
  { name: "groq", fn: () => callGroq(...) },
];
```

### Adding New Quiz Types
Extend `QuestionType` enum in `prisma/schema.prisma` and add rendering logic in `src/app/student/quizzes/[id]/attempt/page.tsx`.

---

## 📈 Scaling for Production

1. **Database**: Upgrade to Supabase Pro for connection pooling
2. **AI**: Use Gemini Pro for higher rate limits
3. **Storage**: Supabase Storage → AWS S3 for large video files
4. **Caching**: Add Redis for session caching and rate limiting
5. **Email**: Add Resend/SendGrid for transactional emails
6. **CDN**: Vercel Edge Network handles this automatically

---

## 🐛 Troubleshooting

### "Prisma client not found"
```bash
npm run db:generate
```

### "Database connection failed"
- Check `DATABASE_URL` format — must include `?pgbouncer=true`
- Ensure Supabase project is not paused

### "AI generation failed"
- Verify at least one API key is set in `.env.local`
- Check Gemini key at [ai.google.dev](https://ai.google.dev)

### Auth redirect loop
- Ensure `AUTH_URL` matches your actual domain
- Regenerate `AUTH_SECRET` with `openssl rand -base64 32`

---

## 📝 License

MIT License — Free for personal and commercial use.

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org) — React framework
- [Prisma](https://prisma.io) — Database ORM
- [Supabase](https://supabase.com) — Database & Storage
- [Auth.js](https://authjs.dev) — Authentication
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Recharts](https://recharts.org) — Charts
- [Google Gemini](https://ai.google.dev) — AI capabilities
- [Lucide](https://lucide.dev) — Icons
