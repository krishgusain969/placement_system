# Placement Management System — Team Roles & Responsibilities

This document clearly explains each member's assigned **DBMS** and **Operating Systems (OS)** modules, what each person actually did, and which specific files contain their work.

---

## Quick Reference Summary

| Team Member | DBMS Module | OS Module | Key Files Worked On |
| :--- | :--- | :--- | :--- |
| **Chitranjan** | Reports & Analytics | Multithreading & Concurrency | `views.sql`, `reports.py`, `Dashboard.jsx`, `threads.c`, `concurrent.c` |
| **Krish** | Student & Eligibility Management | Process Synchronization | `procedures.sql`, `eligibility.py`, `students.py`, `sync.c`, `Students.jsx`, `Login.jsx` |
| **Anushka** | Database Design & Schema Architecture | CPU Scheduling | `schema.sql`, `triggers.sql`, `models.py`, `scheduler.c`, `OSLab.jsx` |
| **Mohit** | Company & Job Opening Management | Deadlock Handling & Recovery | `companies.py`, `jobs.py`, `applications.py`, `deadlock.c`, `Jobs.jsx`, `AdminPortal.jsx` |

---

## Detailed Member Breakdown

### 1. Chitranjan

#### DBMS Module: Reports and Analytics
* **What Chitranjan Did:**
  * Created SQL views and queries to calculate placement statistics like department-wise placement rate, highest salary package, and average salary across branches.
  * Used SQL concepts including `JOIN`, `GROUP BY`, aggregate functions (`COUNT`, `AVG`, `MAX`), views, and subqueries.
  * Connected analytics queries to backend API endpoints and rendered dynamic visual charts (bar charts and doughnut charts) on the main dashboard.
* **Files Worked On:**
  * `views.sql` — SQL views for placement stats, department comparisons, and CTC brackets.
  * `reports.py` — Python FastAPI router providing analytics data endpoints.
  * `Dashboard.jsx` — Frontend dashboard page displaying analytics charts and recruitment funnel.

#### OS Module: Multithreading and Concurrency
* **What Chitranjan Did:**
  * Designed the multithreading logic to handle multiple student placement applications at the same time.
  * Implemented POSIX thread creation, argument passing, and thread lifecycles in C to simulate parallel recruiter screening pipelines.
  * Covered core concepts: processes vs. threads, concurrency vs. parallelism, and thread safety.
* **Files Worked On:**
  * `threads.c` — Low-level C code creating and managing worker threads.
  * `concurrent.c` — C program testing concurrent task execution without crashing system memory.

---

### 2. Krish

#### DBMS Module: Student and Eligibility Management
* **What Krish Did:**
  * Designed the student database structure and academic records (CGPA, active backlogs, department, resume data).
  * Built the eligibility verification logic: checks whether a student meets the minimum CGPA, belongs to an allowed department, has fewer backlogs than permitted, and hasn't already accepted a higher-tier offer.
  * Implemented an SQL stored procedure and deterministic function (`is_eligible`) so that eligibility rules run directly inside the database engine.
  * Added student authentication, login role switching, and privacy rules so students can only see their own application data.
* **Files Worked On:**
  * `procedures.sql` — SQL stored procedure and `is_eligible` function.
  * `eligibility.py` — Python layer verifying criteria before students apply.
  * `students.py` — Python API router for adding, updating, and fetching student records.
  * `Students.jsx` — Frontend page showing the student directory and eligibility status.
  * `Login.jsx` — Frontend login/signup page with role switching (Admin vs. Student).

#### OS Module: Process Synchronization
* **What Krish Did:**
  * Solved the synchronization and race condition issue that occurs when multiple students apply for the last remaining interview seat at the exact same millisecond.
  * Demonstrated what happens **without locks** (race condition where seat count becomes negative).
  * Solved the issue using **Mutex Locks** and **Semaphores** to ensure Mutual Exclusion and protect the Critical Section so that seat allocations remain accurate and safe.
* **Files Worked On:**
  * `sync.c` — Low-level C program demonstrating the race condition and fixing it with mutex locks and semaphores.
  * `os_lab.py` — Python router that runs `sync.exe` via subprocess and reads the simulation results.

---

### 3. Anushka

#### DBMS Module: Database Design and Schema Architecture
* **What Anushka Did:**
  * Designed the complete relational database schema: defined all tables, columns, primary keys, foreign keys, and relationships.
  * Applied database normalization (1NF, 2NF, 3NF) to eliminate data redundancy and prevent insert/update/delete anomalies.
  * Added database integrity constraints and SQL Triggers that automatically block ineligible students from applying and maintain an audit log of all changes.
  * Defined the corresponding SQLAlchemy models in Python so the backend matches the database schema.
* **Files Worked On:**
  * `schema.sql` — Core SQL script creating tables (`students`, `companies`, `jobs`, `applications`, `users`, `audit_log`).
  * `triggers.sql` — Database triggers enforcing placement rules and recording audit events.
  * `models.py` — Python SQLAlchemy database models matching the relational tables.
  * `seed.py` & `seed.sql` — Mock data generation scripts to populate the database with sample students and companies.

#### OS Module: CPU Scheduling
* **What Anushka Did:**
  * Implemented CPU scheduling algorithms in C to simulate how an interview queue or online test evaluation system prioritizes students.
  * Programmed algorithms: First-Come First-Served (**FCFS**), Shortest Job First (**SJF**), **Priority Scheduling**, and **Round Robin** with a time quantum.
  * Calculated turnaround time ($TAT = CT - AT$) and waiting time ($WT = TAT - BT$) for each process and generated Gantt chart timelines.
* **Files Worked On:**
  * `scheduler.c` — Low-level C program implementing the scheduling algorithms and outputting Gantt chart JSON.
  * `OSLab.jsx` — Frontend interactive GUI where users choose an algorithm, run the C scheduler, and view the visual Gantt chart.

---

### 4. Mohit

#### DBMS Module: Company and Job Opening Management
* **What Mohit Did:**
  * Managed all recruiter and job drive data: company profile, job roles, salary CTC, tier classification (`MASS`, `CORE`, `DREAM`, `SUPER_DREAM`), vacancies, and application deadlines.
  * Built the application pipeline workflow tracking student progress across stages: `APPLIED` ➔ `SHORTLISTED` ➔ `INTERVIEWED` ➔ `SELECTED` / `REJECTED`.
  * Created the dedicated Admin Portal allowing placement officers to add/edit companies, post new job drives, and update student selection statuses.
* **Files Worked On:**
  * `companies.py` — Python router to add, update, list, and delete companies.
  * `jobs.py` — Python router to post job drives and check application criteria.
  * `applications.py` — Python router to submit student applications and update selection stages.
  * `Jobs.jsx` — Frontend jobs page where students browse drives and apply.
  * `PostJob.jsx` — Frontend page to post a new job drive.
  * `AdminPortal.jsx` — Full administrative control panel for companies, jobs, and applications.

#### OS Module: Deadlock Handling
* **What Mohit Did:**
  * Modeled and solved deadlocks that can happen when concurrent interview processes compete for shared resources (such as interview rooms, panels, and test terminals).
  * Covered the 4 Coffman conditions for deadlocks: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.
  * Implemented Dijkstra's **Banker's Algorithm** in C for deadlock avoidance (checking safe states before granting resources).
  * Built Resource Allocation Graph (**RAG**) cycle detection to detect circular wait deadlocks and simulate process recovery.
* **Files Worked On:**
  * `deadlock.c` — Low-level C program implementing the Banker's Algorithm and cycle detection on resource graphs.
  * `os_lab.py` (deadlock endpoint) — Python bridge that executes `deadlock.exe` and returns the safety sequence to the frontend.
