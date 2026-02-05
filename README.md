AI Resume Analyzer & Screening System

An intelligent web application that analyzes resumes using AI, NLP, and Machine Learning to match candidates with job descriptions.
The system supports two roles — Candidate and Recruiter — and provides automated resume scoring, skill matching, ATS analysis, and candidate comparison dashboards.

🚀 Features
Candidate (User) Panel

User Registration & Login

Upload Resume (PDF / DOCX / Text)

Paste or Upload Job Description

Resume vs JD Match Score

Skill Match & Missing Skills Detection

ATS Compatibility Score

Resume Improvement Suggestions

Charts & Graphs Visualization

Role Prediction (Data Scientist / ML Engineer / SDE etc.)

Download Resume Analysis Report

Recruiter (HR) Panel

Recruiter Registration & Login

Post Job Descriptions

Upload Multiple Resumes

Automated Resume Screening

Candidate Ranking & Shortlisting

Skill & Experience Comparison

ATS Score Breakdown

Project & Certification Analysis

Resume Heatmap

Interview Question Suggestions

Export Candidate Reports

🧠 AI / NLP Capabilities

Resume Parsing

Skill Extraction

Named Entity Recognition (NER)

Keyword Matching

Cosine Similarity Scoring

Role Classification

ATS Optimization Logic

🛠 Tech Stack
Frontend

React

TypeScript

Tailwind CSS

shadcn-ui

Chart.js / Plotly (for graphs)

Backend

Python

Flask / Django

REST APIs

AI / NLP Libraries

spaCy

Scikit-learn

NLTK

Sentence-Transformers

TF-IDF / Embeddings

Database

PostgreSQL / MySQL / MongoDB

Deployment

Vercel / Render / Railway / AWS

📂 Project Structure (Frontend)
src/
 ├── pages/
 │   ├── Login.tsx
 │   ├── UserDashboard.tsx
 │   ├── RecruiterDashboard.tsx
 │   ├── AnalyzeResult.tsx
 │   └── CompareCandidates.tsx
 ├── components/
 │   ├── ResumeUpload.tsx
 │   ├── SkillChart.tsx
 │   ├── CandidateTable.tsx
 │   └── ATSMeter.tsx
 └── App.tsx

⚙️ Installation & Setup
Prerequisites

Node.js

npm

Python 3.9+

Git

Frontend Setup
git clone <YOUR_GIT_URL>
cd <PROJECT_NAME>
npm install
npm run dev

Backend Setup
cd backend
pip install -r requirements.txt
python app.py

📊 Scoring Logic (Example)
Total Score =
  Skill Match (40%)
+ Experience Match (25%)
+ Project Relevance (20%)
+ Education Match (10%)
+ ATS Format (5%)

🎯 Target Roles

Data Scientist

Machine Learning Engineer

Data Analyst

Software Development Engineer (SDE)

Backend Developer

🔮 Future Enhancements

LinkedIn Profile Analyzer

Voice Resume Analysis

Chatbot Career Assistant

Salary Prediction

Real-time Email Notifications

Plagiarism Detection

🤝 Contribution

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

📄 License

This project is for educational and portfolio purposes.
