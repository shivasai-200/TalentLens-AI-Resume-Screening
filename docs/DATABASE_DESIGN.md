# Database Design

## Collections and relationships
```mermaid
erDiagram
 USER ||--o{ JOB : creates
 USER ||--o{ RESUME : uploads
 USER ||--o{ APPLICATION : submits
 JOB ||--o{ APPLICATION : receives
 RESUME ||--o{ APPLICATION : used_for
 USER { ObjectId _id string name string email string password string role }
 JOB { ObjectId _id ObjectId recruiterId string title string description }
 RESUME { ObjectId _id ObjectId candidateId string originalFilename string extractedText }
 APPLICATION { ObjectId _id ObjectId candidateId ObjectId recruiterId ObjectId jobId ObjectId resumeId number matchingScore string status }
```

## Indexes
- User email unique index.
- Application compound unique index on candidateId + jobId to prevent duplicate applications.
- Job recruiterId index.
- Resume candidateId index.

Passwords are stored as bcrypt hashes. Resume extracted text is excluded from default Resume query projections and explicitly selected only during screening.
