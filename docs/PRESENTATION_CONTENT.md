# Presentation Content — 15 Slides

## Slide 1 — Title
AI-Powered Resume Screening and Candidate Ranking System (TalentLens). Student, roll number, department, guide and institution.

## Slide 2 — Introduction
Recruitment teams receive many resumes. A structured tool can organize candidate evidence and support consistent initial review.

## Slide 3 — Problem Statement
Manual screening is time-consuming and difficult to standardize. Recruiters need searchable candidate information and job-specific comparison.

## Slide 4 — Existing System
Manual reading, email attachments and spreadsheets; limitations include repeated effort and fragmented status tracking.

## Slide 5 — Proposed System
A MERN application for job publishing, resume parsing, transparent matching and recruiter-led application management.

## Slide 6 — Objectives
Secure accounts, job management, PDF/DOCX extraction, skill identification, matching, ranking, status tracking and analytics.

## Slide 7 — Technology Stack
MongoDB, Express.js, React.js, Node.js, Mongoose, JWT, Multer, PDF Parse, Mammoth and JavaScript NLP services.

## Slide 8 — Architecture
Candidate/recruiter → React UI → Express API → authentication and services → MongoDB; resume parser → NLP engine → score explanation.

## Slide 9 — Main Modules
Authentication, job management, resume upload, screening engine, candidate/application workflow and analytics.

## Slide 10 — AI Methodology
Text normalization, tokenization, skill dictionary, TF-IDF, cosine similarity and weighted score.

## Slide 11 — Scoring Formula
Final = 0.45(required skills) + 0.15(preferred skills) + 0.15(experience) + 0.10(qualification) + 0.15(text similarity). All components are normalized 0–100.

## Slide 12 — Implementation Screenshots
Insert screenshots captured from the running landing page, recruiter dashboard, job form, resume upload, candidate pipeline and analytics page.

## Slide 13 — Testing and Results
Show actual automated test output and manual integration test evidence. Do not invent accuracy claims.

## Slide 14 — Advantages and Limitations
Advantages: structured workflow, explainable scores and centralized records. Limitations: heuristic extraction, scanned PDF OCR not included, human verification required.

## Slide 15 — Conclusion and Future Scope
TalentLens demonstrates MERN integration with NLP-inspired resume comparison. Future work includes OCR, semantic embeddings, secure object storage and bias audits.
