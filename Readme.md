
# Nebula9 Newsroom

An AI-powered newsroom application that helps journalists research, draft, and manage articles with human editorial control.

## Project Overview
**Nebula9 Newsroom** is a full-stack AI application built to support modern journalism.
The system assists users in generating news articles by automating research, drafting, and image analysis, while keeping editors in control of the final content.

Unlike a simple chatbot, this project follows a human-in-the-loop workflow, where AI supports the journalist instead of replacing editorial judgment.

**Target Audience**:

**Journalists** – to speed up research and first-draft creation.

**Editors** – to review content, check sources, and manage article status.


## Architecture 
The application is split into frontend, backend, database, and AI agents for clarity and scalability.

### Frontend

**Framework:** Next.js (React)

**Styling:** Tailwind CSS

**Editor:** Tiptap rich text editor

**State Management:** React hooks and Axios

### Backend

**Framework:** FastAPI (Python)

**AI Workflow:** LangGraph

**LLMs:** Groq LPU (Llama-3.3-70b for text, Llama-4-Scout for Vision)

**Search & Research:** Tavily API

### Database

* Supabase (Managed by PostgreSQL)
* Stores articles, users, roles, and citations
* Uses Row Level Security (RLS) for access control

## AI Workflow

The AI system follows a step-by-step workflow similar to a real newsroom:

**1.Research Agent**

* Takes the story topic, angle, and audience.
* Searches the live web using Tavily.
* Collects reliable sources (URLs and titles).

**2.Writing Agent**

* Uses the research output to generate a structured article.
* Follows the selected length.
* Adds inline citations like [1], [2] linked to sources.

**3.Vision Analyst**

* Analyzes images using a vision model.
* Generates captions and descriptions for editorial use.

**4.Image Generation**

* Automatically creates a header image for each article.
* This approach reduces hallucinations by forcing the AI to rely only on retrieved data.

## Authentication & Roles
Authentication is handled using **Supabase Auth**.

* **Login options:** Google and GitHub

* **User roles:**
    * **Writer:** Can create and edit drafts
    * **Editor:** Can review content and manage article status

* Roles are assigned at the database level and reflected in the UI.

## Setup Instructions

### Prerequisites

* Node.js
* Python 3.10+
* Supabase account
* API keys for Groq and Tavily

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/nebula-newsroom.git
cd nebula-newsroom
```

### 2.Backend Setup
```bash
cd backend
```

#### Create virtual environment
```bash
 python -m venv venv
```
#### Activate virtual environment
* **Windows**
```bash
venv\Scripts\activate
```

* **Mac/Linux**
```bash
source venv/bin/activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Run Server
```bash
uvicorn main:app --reload
```
Backend runs on: http://127.0.0.1:8000

### 3.Frontend Setup
```bash
cd frontend
```
#### Install dependencies
```bash   
npm install
```
#### Run Development Server
```bash   
npm run dev
```
The frontend runs on http://localhost:3000

### 4. Environment Variables
Backend (backend/.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```



## Future Improvements

1.  **Real-Time Collaboration (Multi-User Editing):**
Implement **WebSockets** and **CRDTs (Y.js)** to allow Writers and Editors to work on the same draft simultaneously, similar to Google Docs.

2.  **Admin Dashboard & RBAC UI:**
Build a dedicated frontend interface for Admins to manage user roles (promote Writers to Editors) without needing direct database access.

3.  **DevOps & Deployment:**
**Dockerize** the FastAPI backend for consistent environments.
Set up a **CI/CD pipeline** (GitHub Actions) to automatically deploy the Frontend  and the Backend .

4.  **Custom Model Fine-Tuning:**
Fine-tune Llama-3 on a specific newsroom's historical archive to perfectly mimic their specific house style and voice.

