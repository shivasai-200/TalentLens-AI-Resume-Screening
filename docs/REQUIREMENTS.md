# Software Requirements Specification

## Actors
- Candidate: manages profile, uploads resume, applies to active jobs, views application statuses.
- Recruiter: manages job openings, reviews applicants, views scores and changes application stages.

## Functional requirements
FR-01 The system shall register users with candidate or recruiter roles.
FR-02 The system shall authenticate users and protect role-specific routes.
FR-03 Recruiters shall create, view, update and delete their own job postings.
FR-04 Candidates shall view active jobs and submit one application per job.
FR-05 Candidates shall upload PDF/DOCX resumes within the configured size limit.
FR-06 The server shall extract readable document text and store structured extraction results.
FR-07 The system shall identify supported skills and compare them with job criteria.
FR-08 The system shall return a matching score, component breakdown and explanation.
FR-09 Recruiters shall view applications for their jobs and update statuses.
FR-10 Candidates shall view their application history.
FR-11 Recruiters shall view aggregate application metrics.

## Non-functional requirements
Security: hashed passwords, JWT checks, role authorization, validated uploads, environment-based secrets.
Usability: responsive pages, meaningful feedback, accessible labels and understandable empty states.
Maintainability: modular routes, controllers/services separation where practical, consistent naming.
Reliability: API error handling and parser failure handling.

## Out of scope
Automated hiring decisions, psychometric assessment, OCR, external background checks, paid AI APIs and production compliance certification.
