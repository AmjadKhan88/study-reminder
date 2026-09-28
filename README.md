# StudyPilot

StudyPilot is a multi-platform learning assistant built to help students plan, study, and retain knowledge through AI-generated study schedules, flashcards, quizzes, and progress tracking.

This monorepo contains:

- Backend API: Node.js + Express + MongoDB + Qdrant
- Web frontend: React + Vite
- Mobile app: React Native + Expo

## Overview

StudyPilot turns a course outline or lecture material into a structured study plan. It supports:

- AI-generated daily study content
- Quiz generation and evaluation
- Flashcard generation for active recall
- Lecture note processing and summarization
- User progress tracking and streaks
- Study reminders and notifications
- Search and retrieval over course materials

## Architecture

```text
┌──────────────────────┐      ┌──────────────────────┐
│ React Web App        │      │ React Native App     │
│ (Vite + React)       │      │ (Expo + RN)          │
└──────────┬───────────┘      └──────────┬───────────┘
           │                               │
           └──────────────┬────────────────┘
                          │ HTTPS / REST API
                          ▼
                 ┌──────────────────────┐
                 │ Node.js API Server   │
                 │ Express + MongoDB    │
                 └──────────┬───────────┘
                            │
                 ┌──────────▼───────────┐
                 │ AI + Vector Services  │
                 │ Gemini / OpenAI /     │
                 │ Groq + Qdrant         │
                 └──────────────────────┘
```

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Qdrant vector database
- JWT authentication
- Helmet, CORS, rate limiting
- Node cron for reminder jobs
- Multi-provider AI integration: Gemini, OpenAI, Groq

### Frontend

- React 19
- Vite
- React Router
- Axios
- Zustand
- Tailwind CSS
- Framer Motion
- React Markdown with math/diagram support

### Mobile App

- React Native
- Expo
- Expo Notifications
- React Navigation
- Secure storage and async storage

## Repository Structure

```text
study-reminder/
├── backend/
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── mobile-app/
│   ├── src/
│   ├── App.tsx
│   ├── package.json
│   └── app.json
├── .gitignore
├── PROJECT_INSTRUCTIONS.md
└── README.md
```

## Features

### Student Workflow

- Create course plans tied to target dates and study duration
- Upload or paste syllabus and lecture notes
- Generate daily study modules from course content
- Review daily tasks and learning objectives
- Track completion and streaks
- Generate quizzes and flashcards from course material
- Search notes and related topics with semantic/vector retrieval

### AI Capabilities

- Multi-provider AI selection
- Course planning and content generation
- Summary generation from uploaded files
- Knowledge retrieval and contextual search
- Adaptive content recommendations based on study progress

### App Experience

- Responsive web dashboard
- Mobile-first experience
- Reminder system
- Progress visualization
- Authenticated user-specific data isolation

## Prerequisites

Before running the project, install:

- Node.js 18+ or 20+
- npm or yarn
- MongoDB instance
- Qdrant instance
- AI provider API keys (Gemini, OpenAI, or Groq)
- Optional: Expo CLI for mobile app development

## Environment Variables

### Backend

Create a .env file inside the backend directory with variables similar to:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/studypilot
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_ORIGIN=http://localhost:5173

GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key

QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
QDRANT_COLLECTION=studypilot_notes
GEMINI_EMBEDDING_MODEL=text-embedding-004

EMAIL_USER=your_email@example.com
EMAIL_APP_PASSWORD=your_app_password
EMAIL_FROM_NAME=StudyPilot
```

### Frontend

Create a .env file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Mobile App

Create an .env or use Expo environment variables as needed, for example:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Local Development

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../mobile-app
npm install
```

### 2) Start backend

```bash
cd backend
npm run dev
```

The backend runs on:

- http://localhost:5000
- Health check: http://localhost:5000/health

### 3) Start frontend

```bash
cd frontend
npm run dev
```

The web app usually runs at:

- http://localhost:5173

### 4) Start mobile app

```bash
cd mobile-app
npm start
```

Then run on Android/iOS emulator or a physical device with Expo.

## Useful Scripts

### Backend

```bash
npm run dev
npm run start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Mobile App

```bash
npm start
npm run android
npm run ios
npm run web
```

## Production Notes

- Use environment-specific secrets and never commit API keys to source control.
- Run MongoDB and Qdrant in a managed or production-grade environment.
- Configure CORS properly for deployed frontends and mobile clients.
- Use HTTPS in production and secure JWT secret management.
- Add monitoring and logging around AI and reminder jobs.

## Security and Data Handling

This project includes foundational safeguards such as:

- JWT authentication
- Password hashing
- CORS restrictions
- Rate limiting
- Input validation
- Secure cookie settings in production
- File upload validation for supported document types

## Roadmap Ideas

- Better analytics and learning insights
- Adaptive recommendations based on weak topics
- More study-reminder customization
- Richer mobile push notification flows
- Billing and subscription support
- Expanded AI provider abstraction and observability

## License

This project does not currently declare a license. Add one if you plan to distribute or publish it publicly.

## Contributing

Open a feature branch, make focused changes, and validate the relevant app area before submitting a pull request.

---

Built for AI-assisted learning workflows, course planning, and long-term study retention.
