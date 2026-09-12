# 🏛️ IPR Portal — Intellectual Property Rights & Patent Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![LangChain](https://img.shields.io/badge/LangChain-AI%20Agent-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3--70B-F05A28)](https://groq.com/)

A full-stack, enterprise-grade web application designed for academic institutions, universities, and research organizations to manage, search, analyze, and track intellectual property assets, patents, and innovations.

The portal provides end-to-end patent lifecycle tracking (`APPLIED` ➔ `PUBLISHED` ➔ `GRANTED`), multi-inventor institutional affiliation mapping, real-time analytics with dynamic pivot tables and charts, client-side fuzzy search, one-click PDF report generation, and an **AI-powered Natural Language SQL Chatbot** that queries the patent database in real time using Groq and LangChain.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Data Model & Schema](#-data-model--schema)
- [API Overview](#-api-overview)
- [Getting Started (Local Development)](#-getting-started-local-development)
  - [Prerequisites](#prerequisites)
  - [1. Clone & Setup Backend](#1-clone--setup-backend)
  - [2. Setup Frontend](#2-setup-frontend)
  - [3. Excel Data Ingestion & Seeding](#3-excel-data-ingestion--seeding)
- [Environment Variables](#-environment-variables)
- [Production Deployment](#-production-deployment)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
  - [Production Checklist](#production-checklist)
- [License](#-license)

---

## ✨ Key Features

### 1. 📋 Comprehensive Patent Registry & Lifecycle Management
- **Full Lifecycle Tracking**: Categorizes patents by status (`APPLIED`, `PUBLISHED`, `GRANTED`) and patent type (`UTILITY`, `DESIGN`).
- **Complete Metadata Storage**: Tracks application numbers, publication/grant numbers, title, applicant name, session, filing date, publication date, country, institute affiliation, Google Drive document archives, and official web links.
- **Relational Inventor Hierarchy**: Supports multiple inventors per patent with granular roles (`STUDENT`, `ASSISTANT_PROFESSOR`, `ASSOCIATE_PROFESSOR`, `PROFESSOR`) linked to multiple academic departments (e.g., Computer Science, Electronics, Mechanical Engineering).

### 2. 🔍 Typo-Tolerant Search & Granular Filtering
- **Levenshtein Fuzzy Matching**: Smart client-side search across patent titles, application numbers, and inventor names that tolerates spelling mistakes and typos.
- **Multi-Factor Filters**: Instantly slice and filter patents by Year, Status, Patent Type, Country, Applicant Name, Department, and Designation.
- **Interactive Card & Grid Views**: Quick access to patent details, external links, Google Drive dossiers, and direct edit/deletion actions for authorized users.

### 3. 📊 Interactive Analytics & 2D Pivot Reporting
- **Server-Side Aggregations**: Prisma `groupBy` analytics dynamically generating multi-dimensional pivot tables:
  - **Published vs. Granted** by Year
  - **Utility vs. Design** by Year
  - **Year-wise Utility Patent Breakdown**
  - **Country-wise Utility Patent Distribution**
- **Data Visualizations**: Responsive charts built with Recharts displaying trends, status breakdowns, and institutional distributions.
- **One-Click PDF Export**: Download formatted, print-ready PDF reports for both the filtered Patent Registry and the Pivot Summary Analysis tables using `jspdf` and `jspdf-autotable`.

### 4. 🤖 AI-Powered SQL Database Chatbot
- **Natural Language to SQL**: Floating AI assistant available across all authenticated views.
- **Autonomous Agent**: Powered by **LangChain** (`SqlToolkit`, `createSqlAgent`) with **Groq's LLaMA 3.3-70B Versatile** model (`llama-3.3-70b-versatile`).
- **Safe Read-Only Queries**: Translates questions like *"How many utility patents were granted in 2024?"* or *"List patents affiliated with CSE"* into SQL queries against a read-only PostgreSQL connection and returns human-readable responses.

### 5. 🔐 Role-Based Access Control (RBAC) & Security
- **Roles**: `ADMIN`, `FACULTY`, and `STUDENT`.
- **JWT Authentication**: Secure authentication with support for both HTTP-only cookies and `Authorization: Bearer <token>` headers.
- **Ownership Protection**: Patent modification/deletion is restricted to `ADMIN` users or the original creator.
- **Security Headers**: Hardened with CORS origin whitelisting, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict referrer policies.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Browser / Client     │
                                  │  (React 19 + Vite SPA) │
                                  └───────────┬────────────┘
                                              │
                       REST APIs / JWT Auth   │   Dual Transport:
                       & JSON Payloads        │   Bearer Token + Cookie
                                              ▼
                                  ┌────────────────────────┐
                                  │  Express 5 API Server  │
                                  │   (Node.js / Modular)  │
                                  └─────┬────────────┬─────┘
                                        │            │
                    Prisma ORM (CRUD,   │            │  TypeORM + LangChain SQL Agent
                    Aggregations, Auth) │            │  (Groq LLaMA 3.3-70B)
                                        ▼            ▼
                         ┌──────────────────────────────────┐
                         │      PostgreSQL Database         │
                         │  (Patents, Users, Inventors,     │
                         │   Departments, Pivot Indices)    │
                         └──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Lucide React, Recharts, jsPDF, jspdf-autotable, Axios, Sonner, Vanilla CSS (Dark/Light mode) |
| **Backend** | Node.js 18+, Express 5, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`), TypeORM, bcrypt, jsonwebtoken, cookie-parser, cors |
| **AI & LLM** | LangChain (`@langchain/classic`, `@langchain/core`, `@langchain/groq`), Groq Cloud (`llama-3.3-70b-versatile`) |
| **Database** | PostgreSQL with relational foreign keys, cascade triggers, and compound indexes |
| **Data Processing** | SheetJS (`xlsx`) for automated Excel batch ingestion and parsing |
| **DevOps & Hosting**| Docker, Vercel (Frontend SPA), Cloud PostgreSQL |

---

## 📂 Repository Structure

```text
IPR/
├── IPR_Data_For_Project.xlsx  # Master institutional Excel sheet with patent records
├── README.md                  # Project documentation (this file)
│
├── Backend/                   # Express 5 REST API & Database Service
│   ├── Dockerfile             # Container image definition
│   ├── API.md                 # Detailed REST endpoint documentation
│   ├── patents_insert.sql     # Raw SQL fallback data dump
│   ├── seed.js                # Legacy Excel seeder script
│   ├── server.js              # Server entry point & graceful shutdown
│   ├── package.json           # Backend dependencies and scripts
│   ├── prisma.config.ts       # Prisma 7 CLI configuration
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (User, Patent, Inventor, Dept)
│   │   ├── migrations/        # SQL migration history
│   │   └── seed.js            # Structured relational seeder from Excel
│   └── src/
│       ├── app.js             # Express application configuration & middleware
│       ├── ai/
│       │   ├── sqlAgent.js    # LangChain + Groq SQL Agent setup
│       │   └── testAgent.js   # CLI test harness for the AI agent
│       ├── config/
│       │   └── prisma.js      # Singleton Prisma Client instance
│       ├── controllers/
│       │   ├── ai.controller.js      # Controller for /api/ai/ask-database
│       │   ├── auth.controller.js    # Register, login, and token generation
│       │   └── patent.controller.js  # Patent CRUD & 4-table pivot summary
│       ├── lib/
│       │   └── token.js       # JWT generation and cookie utilities
│       ├── middleware/
│       │   └── auth.js        # JWT verification & role authorization
│       └── routes/
│           ├── ai.routes.js     # AI endpoints
│           ├── auth.routes.js   # Authentication endpoints
│           └── patent.routes.js # Patent management & analytics endpoints
│
└── Frontend/                  # Vite + React Single-Page Application
    ├── index.html             # HTML root template
    ├── package.json           # Frontend dependencies and scripts
    ├── vite.config.js         # Vite configuration with /api reverse proxy
    ├── vercel.json            # Vercel SPA routing rewrite rules
    └── src/
        ├── main.jsx           # React DOM root mounting
        ├── App.jsx            # Router, global navigation, and theme state
        ├── index.css          # Design system, CSS variables, & responsive grid
        ├── api/
        │   ├── aiApi.js       # Axios wrapper for AI chatbot
        │   ├── authApi.js     # Axios wrapper for authentication
        │   └── patentApi.js   # Axios wrapper for patent CRUD & analytics
        ├── components/
        │   ├── Button.jsx     # Reusable styled UI button
        │   ├── ChatBot.jsx    # Floating AI database assistant component
        │   ├── Navbar.jsx     # Top bar with navigation, theme toggle & logout
        │   └── PatentCard.jsx # Patent summary card with badge & actions
        ├── pages/
        │   ├── AddPatentForm.jsx  # Multi-step patent creation and editing form
        │   ├── Admin.jsx          # Administrative registry dashboard
        │   ├── Analysis.jsx       # Analytics dashboard with pivot tables & charts
        │   ├── Auth.jsx           # User login and registration page
        │   ├── Chart.jsx          # Recharts visualizations
        │   ├── Dashboard.jsx      # Main patent search, filter & export view
        │   └── PatentDetails.jsx  # Detailed patent view with inventor breakdown
        └── utils/
            └── downloadPdf.js # jsPDF generator for Registry & Pivot analysis
```

---

## 🗄️ Data Model & Schema

The relational schema is defined in [Backend/prisma/schema.prisma](file:///c:/web-dev-master/IPR/Backend/prisma/schema.prisma):

```mermaid
erDiagram
    USER ||--o{ PATENT : "owns / creates"
    PATENT ||--o{ PATENT_INVENTOR : "contains"
    PATENT_INVENTOR ||--o{ INVENTOR_DEPARTMENT : "belongs to"
    DEPARTMENT ||--o{ INVENTOR_DEPARTMENT : "categorizes"

    USER {
        int id PK
        string name
        string email UK
        string password
        Role role "ADMIN | FACULTY | STUDENT"
        string department
        Designation designation
    }

    PATENT {
        int id PK
        string applicationNo UK
        PatentStatus status "APPLIED | PUBLISHED | GRANTED"
        string patentTitle
        string applicantName
        datetime filedDate
        datetime publicationDate
        string publicationNo UK
        int year
        PatentType patentType "UTILITY | DESIGN"
        string patentSession
        string country
        string driveLink
        string weblink
        int userId FK
    }

    PATENT_INVENTOR {
        int id PK
        string name
        Designation designation "STUDENT | ASSISTANT_PROFESSOR | ASSOCIATE_PROFESSOR | PROFESSOR"
        string instituteAffiliation
        int patentId FK
    }

    DEPARTMENT {
        int id PK
        string name UK
    }

    INVENTOR_DEPARTMENT {
        int inventorId PK, FK
        int departmentId PK, FK
    }
```

### Indexed Columns for Query Optimization
To guarantee low latency for complex pivot aggregations, the following composite indexes are configured:
- `@@index([year, status])`
- `@@index([patentType, year, status])`
- `@@index([patentType, country, status])`
- `@@index([userId])`

---

## 🔌 API Overview

Detailed request/response payloads are documented in [Backend/API.md](file:///c:/web-dev-master/IPR/Backend/API.md).

### Base URL
- Local: `http://localhost:5000`
- Production: Configured via `CLIENT_URL` / platform host

### Authentication
Protected endpoints require either an HTTP-only session cookie or the Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### Endpoint Summary

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check status (`{"status":"ok"}`) |
| `POST` | `/api/auth/register` | Public | Register a new user (`STUDENT`, `FACULTY`, or `ADMIN`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT token |
| `POST` | `/api/auth/logout` | Public | Clear session cookie |
| `GET` | `/api/patents` | Authenticated | Retrieve all patents with structured inventor list |
| `GET` | `/api/patents/:id` | Authenticated | Retrieve complete patent details by ID |
| `POST` | `/api/patents` | Authenticated | Create a new patent record with inventors & departments |
| `PUT` | `/api/patents/:id` | Authenticated | Update patent record fields or inventors |
| `DELETE`| `/api/patents/:id` | Admin / Owner | Delete a patent record |
| `GET` | `/api/patents/analysis/summary` | Authenticated | Generate the 4-table pivot analytics data with optional filters |
| `POST` | `/api/ai/ask-database` | Authenticated | Ask natural-language questions to the database via AI agent |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- [PostgreSQL](https://www.postgresql.org/) database (local instance or cloud database such as Supabase / Neon / AWS RDS)
- [Groq Cloud API Key](https://console.groq.com/) (free tier available for LLaMA 3.3)

---

### 1. Clone & Setup Backend

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your local environment variables:
   Create a `.env` file inside `Backend/` based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development

   # PostgreSQL Connection string
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ipr_portal?schema=public"

   # JWT secret (any string in development; 32+ characters required in production)
   JWT_SECRET="super-secret-development-key-32-chars-long"

   # Allowed frontend origins for CORS
   CLIENT_URL="http://localhost:5173"

   # AI Chatbot database credentials (can use the same DB locally)
   DB_HOST="localhost"
   DB_PORT=5432
   DB_USER="postgres"
   DB_PASSWORD="password"
   DB_NAME="ipr_portal"

   # Groq API key for the AI SQL agent
   GROQ_API_KEY="gsk_your_groq_api_key_here"
   ```

4. Run Prisma database migrations to create all tables:
   ```bash
   npm run db:deploy
   # or for development schema syncing:
   npx prisma migrate dev --name init
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5000`. Test the health check at `http://localhost:5000/health`.

---

### 2. Setup Frontend

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment:
   Create a `.env` file in `Frontend/`:
   ```env
   # In local dev, leave empty to use Vite's automatic /api proxy to localhost:5000
   VITE_API_URL=
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

### 3. Excel Data Ingestion & Seeding

The repository includes a master Excel sheet with 100+ historical patent records: `IPR_Data_For_Project.xlsx`.

To populate your PostgreSQL database with the complete dataset and structured inventor-department relationships:

1. From the `Backend` directory, ensure database migrations have been run.
2. Execute the Prisma relational seed script:
   ```bash
   node prisma/seed.js
   ```
3. The script will:
   - Create standard departments (`Computer Science`, `Electronics`, `Mechanical Engineering`).
   - Read each row in `IPR_Data_For_Project.xlsx`.
   - Normalize dates, application numbers, publication numbers, and patent classifications.
   - Automatically associate structured inventors and infer department tagging based on patent domain keywords.

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection URI for Prisma ORM |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens (32+ chars in production) |
| `CLIENT_URL` | Yes | Allowed frontend origin URL(s) for CORS (comma-separated if multiple) |
| `PORT` | No | Port number for Express server (defaults to `5000`) |
| `NODE_ENV` | No | Set to `production` or `development` |
| `GROQ_API_KEY` | Optional | Groq Cloud API key for the LangChain AI Chatbot |
| `DB_HOST` | Optional | Database host for the AI SQL agent |
| `DB_PORT` | Optional | Database port for the AI SQL agent (`5432`) |
| `DB_USER` | Optional | Database user for the AI agent (read-only user recommended) |
| `DB_PASSWORD` | Optional | Password for the AI agent database user |
| `DB_NAME` | Optional | Database name for the AI agent |

### Frontend (`Frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production | Base URL of deployed backend without trailing slash (e.g. `https://api.yourdomain.com`). Leave empty in local dev to utilize Vite proxy. |

---

## 🚢 Production Deployment

### Backend Deployment

The backend can be deployed to any container or Node.js hosting platform (Railway, Render, AWS ECS, Fly.io, DigitalOcean).

1. **Environment Variables**:
   Set `NODE_ENV=production`, along with `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), `CLIENT_URL`, and optionally Groq/DB credentials.

2. **Build and Pre-Deploy Steps**:
   ```bash
   npm ci
   npm run db:generate
   npm run db:deploy
   npm start
   ```

3. **Docker Support**:
   A multi-stage `Dockerfile` is provided in `Backend/Dockerfile`.
   ```bash
   docker build -t ipr-backend ./Backend
   docker run -p 5000:5000 --env-file ./Backend/.env ipr-backend
   ```

4. **Health Check**:
   Configure your hosting provider's liveness check to `GET /health`.

---

### Frontend Deployment (Vercel)

The frontend is optimized for static hosting platforms like Vercel:

1. Connect your repository to Vercel and configure the root directory as `Frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-domain.com`
5. The included `Frontend/vercel.json` automatically manages client-side routing fallback for React Router.

---

### Production Checklist

- [x] **Database Security**: Use a managed PostgreSQL provider with SSL enabled (`sslmode=require`).
- [x] **Least-Privilege AI User**: In production, create a dedicated read-only PostgreSQL role for the AI chatbot (`DB_USER`) granting only `SELECT` permissions on `Patent`, `PatentInventor`, and `Department`.
- [x] **Cryptographic Secret**: Ensure `JWT_SECRET` is a cryptographically strong string with at least 32 characters.
- [x] **Strict CORS**: Point `CLIENT_URL` on the backend strictly to the deployed frontend domain (e.g., `https://ipr-psi-six.vercel.app`).
- [x] **Health Check Verification**: Verify that `https://your-backend-domain.com/health` responds with `{"status":"ok"}`.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

