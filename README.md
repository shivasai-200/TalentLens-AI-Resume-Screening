# TalentLens — AI-Powered Resume Screening System

A MERN-stack academic project for AI-assisted resume parsing, job matching, explainable candidate scoring and recruiter-led application management. The matching engine uses skill normalization, TF-IDF/cosine similarity and a transparent weighted score. It is decision support only; recruiters retain final hiring authority.

## Features
- Candidate and recruiter registration/login with JWT and bcrypt password hashing.
- Role-protected recruiter and candidate workspaces.
- Recruiter job creation and management.
- Public candidate job browsing and application submission with a required PDF resume.
- Candidate PDF/DOCX upload and text extraction.
- Structured extraction of contact information, skills and resume sections.
- Explainable job-specific matching score, matched/missing skills and ranking API.
- Application status workflow and recruiter analytics.
- Responsive React interface.

## Requirements
- Node.js 20.16+ or 22.3+ (required by the PDF parser).
- npm.
- MongoDB Community Server or MongoDB Atlas database.

## Setup
1. Extract the project ZIP and open a terminal in the project root.
2. Copy `.env.example` to `server/.env`. Configure `MONGO_URI`, `JWT_SECRET`, and optionally `PORT`, `CLIENT_URL`, `MAX_FILE_SIZE_MB`.
3. Install dependencies:
   ```bash
   npm install --prefix server
   npm install --prefix client
   ```
4. Start MongoDB locally or configure Atlas.
5. Start the API in terminal 1 from the project root:
   ```bash
   npm --prefix server run dev
   ```
6. Start React in terminal 2 from the project root:
   ```bash
   npm --prefix client run dev
   ```
7. Open http://localhost:5173/apply to browse active jobs and submit a candidate application. Recruiters can review submissions under Candidates. API health check: http://localhost:5000/api/health.

## Demo data
After configuring the database, from the `server` directory run `npm run seed`. Demo credentials:
- Recruiter: `recruiter@talentlens.demo` / `DemoPass123!`
- Candidate: `candidate1@talentlens.demo` / `DemoPass123!`
The seed script inserts synthetic demo profiles and applications. Demo resume records use synthetic text and do not have downloadable document files. Do not run the seed script against a database containing records you need to preserve: it clears demo-company jobs and demo-domain users and clears applications.

## Environment variables
See `.env.example`. Never commit `server/.env` or real secrets. Use a long random JWT secret. For deployment set `CLIENT_URL` to the deployed frontend origin and `VITE_API_URL` in the client build environment to the deployed API base ending in `/api`.

## AI matching method
The screening service computes: required skill coverage (45%), preferred skill coverage (15%), experience fit (15%), qualification evidence (10%), and TF-IDF cosine similarity (15%). Each component is normalized to 0–100. This is a transparent heuristic, not a validated hiring predictor. Resume extraction is pattern-based and should be reviewed by a person. Missing information is not proof that a candidate lacks a qualification.

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/jobs` is public and lists active openings; recruiter job management remains protected.
- `POST /api/jobs`, `GET/PUT/DELETE /api/jobs/:id`
- `POST /api/resumes/upload`, `GET /api/resumes/my`
- `POST /api/applications/submit` accepts multipart candidate contact details, experience, `jobId`, and a PDF `resume`.
- `POST /api/applications`, `GET /api/applications/my`, `GET /api/applications/recruiter`, `GET /api/applications/job/:jobId/rankings`, `GET /api/applications/:id/resume`, `PATCH /api/applications/:id/status`
- `GET /api/analytics/overview`
All protected routes require `Authorization: Bearer <token>`.

## Testing
Run `npm --prefix server test` from the project root. For a live smoke test, open `/apply`, submit a PDF to an active opening, then sign in as the recruiter and review it under Candidates. A MongoDB-backed end-to-end run was verified with an isolated temporary database; the automated unit suite covers matching scores.

## Important limitations and responsible use
- The application extracts text from text-based PDFs and DOCX files; scanned image-only PDFs require OCR, which is not included.
- Resume section extraction is heuristic and needs user/recruiter verification.
- Experience and qualification scoring use simple evidence patterns, not deep semantic verification.
- Do not use sensitive personal attributes in screening. Review candidate evidence and apply consistent criteria. Do not automatically reject applicants using the score.
- Local uploads are stored on the server filesystem. For production hosting, use private object storage and malware scanning, and implement retention/deletion policies.
- Configure a production JWT secret, HTTPS, database access controls, backups, and allowed origins before deployment.

## Academic customization checklist
Replace the placeholders in `docs/PROJECT_REPORT.md` with your name, roll number, department, faculty guide, institution and academic year. Capture screenshots from your running instance. Add actual test results and faculty-required formatting before submission.
