# Placement Management System - API Documentation

## Authentication

### POST /auth/login
Login with email and password, returns JWT token.

**Request:**
```json
{
  "email": "admin@placement.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "role": "admin",
  "user_id": 1
}
```

## Students

### GET /students/
List all students (admin only).

### GET /students/{id}
Get a student's profile.

### PATCH /students/{id}
Update student profile (CGPA, backlogs, skills).

## Companies

### GET /companies/
List all companies.

### POST /companies/
Create a new company (admin only).

### GET /companies/{id}
Get company details.

## Jobs

### GET /jobs/
List all jobs.

### POST /jobs/
Create a job posting (admin only).

### GET /jobs/{id}
Get job details.

### GET /jobs/{id}/eligible-students
Get students eligible for this job (recruiter view).

## Applications

### POST /applications/
Apply to a job. Checks eligibility in both app code and DB trigger.

**Request:**
```json
{
  "student_id": 1,
  "job_id": 5
}
```

**Response (success):**
```json
{
  "app_id": 1,
  "status": "APPLIED",
  "message": "Application submitted. Eligibility verified in both app and DB."
}
```

**Response (ineligible - 403):**
```json
{
  "detail": "Student not eligible"
}
```
Header `X-Eligibility-Reasons` contains the specific failure reasons.

### PATCH /applications/{id}/status
Update application status (recruiter/admin).

### GET /applications/{id}/audit
Get audit trail for an application.

## Reports

### GET /reports/department
Department-wise placement report (uses `v_dept_placement` view).

### GET /reports/company
Company-wise report (uses `v_company_report` view).

### GET /reports/package-distribution
Offers by LPA bracket.

### GET /reports/funnel
Application funnel counts.

### GET /reports/unplaced-students
Students without offers.

## OS Lab

### GET /oslab/schedule?algo=fcfs
Run CPU scheduler on interview queue. Returns Gantt chart data.

**Query params:**
- `algo`: fcfs, sjf, sjf-p, rr, priority
- `time_quantum`: time quantum for Round Robin (default 4)

### GET /oslab/sync-demo
Run race condition demo (seats without lock → race; with lock → correct).

### GET /oslab/deadlock
Run deadlock detection (wait-for graph cycle detection).

### GET /oslab/concurrent-test?seats=5&applicants=50
Fire concurrent applications and report how many succeeded.
