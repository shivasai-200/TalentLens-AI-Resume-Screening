# Testing Report — Execution Record

## Automated tests
Run from `server/`: `npm test`. The Node test suite checks: (1) a strong skill match scores higher than a weak match, (2) missing required skills appear in the explanation, and (3) the score stays within 0–100.

| Test ID | Scenario | Expected result | Actual result | Status |
|---|---|---|---|---|
| AI-01 | Strong vs weak skill match | Strong profile receives higher score | Strong profile scored higher | Passed |
| AI-02 | Missing required skills | Missing skills are listed | Missing required skills appeared in the explanation | Passed |
| AI-03 | Score bounds | Score is 0–100 | Scores remained within 0–100 | Passed |
| INT-01 | Candidate registration/login | Token and profile returned | Fill after local integration test | Not yet verified |
| INT-02 | Recruiter creates job | Job persists in MongoDB | Fill after local integration test | Not yet verified |
| INT-03 | Candidate uploads PDF | Text, contact information and skills extracted | Text PDF parsed and skills extracted | Passed |
| INT-04 | Candidate applies | Application and score persisted | Application, resume and matching result persisted | Passed |
| INT-05 | Recruiter updates status | Status persists and candidate sees it | Fill after local integration test | Not yet verified |
| INT-06 | Public application to recruiter review | Candidate is listed, PDF is downloadable, duplicate is blocked | All checks passed with a temporary MongoDB database | Passed |

The public application integration flow was executed on 2026-11-06 against a uniquely named temporary database, which was dropped after the test. The generated resume PDF and uploaded test file were removed afterward.

Do not change status to Passed until the test is run and observed. Attach screenshots or logs required by the course.
