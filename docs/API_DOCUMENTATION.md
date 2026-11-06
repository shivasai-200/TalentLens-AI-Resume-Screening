# API Documentation
Base URL: `http://localhost:5000/api`
Protected endpoints use `Authorization: Bearer <JWT>`. JSON bodies use `Content-Type: application/json`, except multipart resume uploads. Public applications accept PDF files up to `MAX_FILE_SIZE_MB` (5 MB by default), validate the PDF signature, extract resume text and skills, calculate the explainable match score, and save both resume and application records.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | Public | Create account |
| POST | /auth/login | Public | Authenticate |
| GET | /auth/me | Any signed-in user | Current profile |
| GET | /jobs | Public | List active jobs; optional `?search=`. Authenticated recruiters see their own jobs. |
| POST | /jobs | Recruiter | Create job |
| GET | /jobs/:id | Signed-in user | Job detail |
| PUT | /jobs/:id | Owning recruiter | Update job |
| DELETE | /jobs/:id | Owning recruiter | Delete job |
| POST | /resumes/upload | Candidate | Multipart field `resume` |
| GET | /resumes/my | Candidate | Own resume records |
| POST | /applications | Candidate | Apply using latest uploaded resume; body `{ "jobId": "..." }` |
| POST | /applications/submit | Public | Multipart fields `name`, `email`, `phone`, `experienceYears`, `jobId`, and PDF file field `resume` |
| GET | /applications/my | Candidate | Own applications |
| GET | /applications/recruiter | Recruiter | Recruiter applications |
| GET | /applications/recent | Recruiter | Recent applications |
| GET | /applications/job/:jobId/rankings | Owning recruiter | Job-specific ranked applications |
| GET | /applications/:id/resume | Recruiter | Download an application PDF belonging to the recruiter |
| PATCH | /applications/:id/status | Recruiter | Body `{ "status": "shortlisted" }` |
| GET | /analytics/overview | Recruiter | Aggregate metrics |
| GET | /health | Public | API health |

## Example registration
`POST /auth/register` body: `{ "name":"Demo User", "email":"demo@example.com", "password":"StrongPass123", "role":"candidate" }`. Response includes a JWT and safe user object.

## Example application status update
`PATCH /applications/:id/status` body: `{ "status":"under review" }`. Allowed values: applied, under review, shortlisted, interview, selected, rejected.

## Common errors
- 400 invalid input, invalid identifier, invalid file or parser failure.
- 401 missing/invalid/expired token or invalid credentials.
- 403 insufficient role.
- 404 missing resource.
- 409 duplicate email or duplicate application.
- 500 unexpected server error.
