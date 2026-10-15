# Entity-Relationship Diagram

```
┌─────────────┐        ┌──────────┐
│  department │        │   job    │
├─────────────┤        ├──────────┤
│ dept_id (PK)│◄──┐    │ job_id (PK)│
│ name        │   │    │ company_id(FK)│
└─────────────┘   │    │ title    │
                  │    │ package  │
                  │    │ min_cgpa │
┌─────────────┐   │    │ max_backlogs│
│   student   │   │    │ deadline │
├─────────────┤   │    │ tier     │
│ student_id(PK)│   │    └──────────┘
│ name        │   │         │
│ email       │   │         │
│ dept_id (FK)├────┘       │
│ cgpa        │            │
│ backlogs    │            │
│ skills      │            │
│ is_placed   │            │
└─────────────┘            │
         │                  │
         │         ┌────────┘
         │         │
┌────────────────┐ │    ┌─────────────────────┐
│   company      │◄┘    │ job_eligible_dept   │
├────────────────┤      ├─────────────────────┤
│ company_id (PK)│      │ job_id (FK)        │
│ name           │      │ dept_id (FK)       │
│ sector         │      └─────────────────────┘
│ tier           │
└────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ application  │    │  selection   │    │   users      │    │   audit_log  │
├──────────────┤    ├──────────────┤    ├──────────────┤    ├──────────────┤
│ app_id (PK)  │◄──►│ selection_id │    │ user_id (PK) │    │ log_id (PK)  │
│ student_id(FK) │    │ app_id (UK)  │    │ email        │    │ app_id (FK)  │
│ job_id (FK)  │    │ offer_pkg   │    │ password_hash│    │ old_status   │
│ status ENUM  │    │ offer_date   │    │ role         │    │ new_status   │
│ applied_at   │    │ accepted     │    │ ref_id       │    │ changed_at   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

## Relationships

- **department** (1) → (many) **student** — `student.dept_id` → `department.dept_id`
- **company** (1) → (many) **job** — `job.company_id` → `company.company_id`
- **job** (1) → (many) **job_eligible_dept** — `job_eligible_dept.job_id` → `job.job_id`
- **department** (1) → (many) **job_eligible_dept** — `job_eligible_dept.dept_id` → `department.dept_id`
- **student** (1) → (many) **application** — `application.student_id` → `student.student_id`
- **job** (1) → (many) **application** — `application.job_id` → `job.job_id`
- **application** (1) → (0 or 1) **selection** — `selection.app_id` → `application.app_id`
- **application** (1) → (many) **audit_log** — `audit_log.app_id` → `application.app_id`
- **users** role-based: student → student_id, recruiter → company_id, admin → NULL
