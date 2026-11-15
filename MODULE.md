# Placement Management System — Complete Module & File Guide (`MODULE.md`)

This guide explains **every single file** in the project, categorized by folder, what it does, and how it interacts with the rest of the application.

---

## 📁 1. Project Root

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`run.bat`** | **One-Click Master Launcher:** Automatically checks for Python virtual environments, launches the FastAPI backend in one terminal (`http://localhost:8000`), and launches the Vite React frontend in another terminal (`http://localhost:5173`). |
| **`start_all.bat`** | Alternative batch script to spin up both client and server development servers concurrently using Windows `cmd /k`. |
| **`ROLES.md`** | Documents the division of labor across all 4 team members (Chitranjan, Krish, Anushka, Mohit) across their DBMS and OS theoretical domains and implementation files. |
| **`CLAUDE.md`** | Development guidelines, architectural rules (e.g., eligibility logic in SQL triggers/procedures, C JSON communication), folder roadmap, and week-by-week implementation plan. |
| **`README.md`** | Project title and high-level overview documentation. |
| **`.gitignore`** | Tells Git which files to ignore, such as `node_modules/`, `venv/`, `__pycache__/`, `.env`, and build outputs (`dist/`, `.exe`). |

---

## 📁 2. Backend (`backend/`)

The backend is built with **FastAPI**, **SQLAlchemy ORM**, **JWT Authentication**, and **Pydantic**.

### Core Backend Files

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`main.py`** | **Application Entry Point:** Initializes the FastAPI app instance, configures CORS middleware (allowing frontend communication), registers all router blueprints (`/auth`, `/students`, `/companies`, `/jobs`, `/applications`, `/reports`, `/oslab`), and exposes health check endpoints (`/`, `/health`). |
| **`database.py`** | **Database Connection & Session Factory:** Configures the SQLAlchemy database engine (supporting MySQL and SQLite fallback), creates `SessionLocal` for transactional queries, defines `Base = declarative_base()`, and provides the `get_db()` dependency for route handlers. |
| **`models.py`** | **SQLAlchemy Database Models:** Defines the database tables as Python classes: `User` (credentials & roles), `Student` (CGPA, backlogs, department), `Company` (tier, contact), `Job` (salary, requirements, deadline), `JobEligibleDept` (allowed branches), `Application` (status funnel), `Selection` (offers), and `AuditLog` (status change history). |
| **`auth.py`** | **JWT & Password Security:** Handles bcrypt password hashing (`get_password_hash`, `verify_password`), generates signed JWT bearer tokens (`create_access_token`), and provides the `get_current_user` FastAPI dependency to authenticate and secure private endpoints. |
| **`eligibility.py`** | **Eligibility Rule Engine:** Checks whether a student is qualified to apply for a job based on minimum CGPA, active backlog threshold, allowed academic branches, and dream offer restrictions before writing an application to the database. |
| **`requirements.txt`** | Lists all Python package dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `python-jose`, `bcrypt`, `pytest`, `pymysql`, `cryptography`, etc. |
| **`pytest.ini`** | Test configuration file setting root directory and test discovery rules for automated test runs. |
| **`run.bat`** | Sub-launcher that activates `backend/venv`, installs dependencies, sets `PYTHONPATH`, and starts the Uvicorn ASGI server with live reloading. |

---

### Backend Routers (`backend/routers/`)

Each router defines a group of REST API endpoints:

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`auth.py`** | **Authentication Endpoints:**<br>• `POST /auth/login`: Verifies user credentials, validates bcrypt passwords, and returns a JWT access token along with user role and student profile details.<br>• `POST /auth/register`: Allows new users (Students or Admins) to sign up, creating their credentials and student profile simultaneously.<br>• `GET /auth/me`: Fetches the currently authenticated user profile from their Bearer token. |
| **`students.py`** | **Student Management Endpoints:**<br>• `GET /students/`: Returns the list of all students (with department, CGPA, and placement status filters).<br>• `GET /students/{id}`: Fetches complete academic profile for an individual student.<br>• `POST /students/`: Admin endpoint to enroll a new student.<br>• `PUT /students/{id}`: Updates CGPA, skills, or backlog count.<br>• `DELETE /students/{id}`: Admin endpoint to remove a student record.<br>• `GET /students/departments/list`: Fetches unique departments. |
| **`companies.py`** | **Company Management Endpoints:**<br>• `GET /companies/`: Lists registered recruiting companies.<br>• `POST /companies/`: Admin endpoint to add a new hiring partner.<br>• `PUT /companies/{id}`: Admin endpoint to edit company profile, contact, or tier.<br>• `DELETE /companies/{id}`: Admin endpoint to delete a company.<br>• `GET /companies/{id}`: Returns company profile and active job openings. |
| **`jobs.py`** | **Job Posting & Drives Endpoints:**<br>• `GET /jobs/`: Lists active placement drives with salary, tier, and minimum eligibility criteria.<br>• `POST /jobs/`: Allows TPO Admins to publish a new job opening with allowed branches and cutoff rules.<br>• `GET /jobs/{id}`: Fetches details for a specific drive.<br>• `GET /jobs/{id}/eligible`: Evaluates which students meet the criteria for this specific job. |
| **`applications.py`** | **Application Workflow Endpoints:**<br>• `POST /applications/`: Submits an application for a student after checking eligibility rules and blocking duplicates.<br>• `GET /applications/`: Fetches applications (all applications for Admin, or only the logged-in student's applications).<br>• `PUT /applications/{id}/status`: Advances an applicant through recruitment stages (`APPLIED` ➔ `SHORTLISTED` ➔ `INTERVIEWED` ➔ `SELECTED` / `REJECTED`).<br>• `GET /applications/student/{id}`: Retrieves application history for a specific student. |
| **`reports.py`** | **Placement Analytics Endpoints:**<br>• `GET /reports/summary`: Returns overall campus KPI metrics (placement rate, highest offer, average CTC, active recruiters).<br>• `GET /reports/departments`: Aggregates placement percentages and average packages grouped by branch.<br>• `GET /reports/funnel`: Returns candidate counts at each application stage.<br>• `GET /reports/packages`: Groups offers into salary brackets (e.g. 5-10 LPA, 10-20 LPA). |
| **`os_lab.py`** | **OS Simulation Bridge Endpoints:**<br>• Connects the low-level C programs to FastAPI using `subprocess.run()`.<br>• `GET /oslab/schedule`: Executes `scheduler.exe` with algorithms (`fcfs`, `sjf`, `rr`) and returns Gantt chart JSON.<br>• `GET /oslab/sync-demo`: Executes `sync.exe` to run the race condition vs. mutex demonstration.<br>• `GET /oslab/deadlock`: Executes `deadlock.exe` to run Banker's safety algorithm and RAG cycle detection.<br>• `GET /oslab/concurrent-test`: Runs the multithreaded concurrent test program. |

---

### Backend Tests (`backend/tests/`)

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`conftest.py`** | **Test Setup & Fixtures:** Configures an isolated in-memory SQLite database (`sqlite:///:memory:`), creates all tables, seeds test departments, students, companies, and jobs, and sets up FastAPI's `TestClient`. |
| **`test_auth.py`** | Unit tests for user registration, valid login, invalid password rejection, JWT token generation, and the `/auth/me` protected endpoint. |
| **`test_eligibility.py`** | Tests the business rules: confirms high-CGPA students qualify, low-CGPA students get rejected, active backlogs block application, and department constraints are enforced. |
| **`test_jobs.py`** | Tests job drive creation, fetching active drives, and retrieving eligible candidate pools for a job. |
| **`test_applications.py`** | Tests student application submission, duplicate prevention, status transitions (`APPLIED` ➔ `SELECTED`), and audit logging. |

---

## 📁 3. Database (`database/`)

Stores the relational schema, SQL stored procedures, triggers, views, and data seeding scripts.

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`schema.sql`** | **Relational Table Definitions:** DDL script creating `departments`, `students`, `companies`, `jobs`, `job_eligible_dept`, `applications`, `selections`, `users`, and `audit_log` tables with foreign keys and check constraints. |
| **`procedures.sql`** | **Stored Procedures & Functions:** Contains the deterministic SQL function `is_eligible(student_id, job_id)` that computes whether a student satisfies the CGPA, backlog, and department requirements directly in MySQL. |
| **`triggers.sql`** | **Integrity Triggers:**<br>• `before_application_insert`: Verifies eligibility and aborts insertion if requirements are not met.<br>• `after_application_update`: Automatically inserts old and new status values into the `audit_log` table whenever an applicant moves stages. |
| **`views.sql`** | **SQL Views for Analytics:** Pre-computes complex queries using `JOIN` and `GROUP BY` (`placement_stats_view`, `department_summary_view`, `company_hiring_view`) to speed up reporting queries. |
| **`seed.sql`** | SQL insert statements containing starter records for departments, standard companies (e.g. Google, Microsoft, Infosys), and demo jobs. |
| **`seed.py`** | **Realistic Data Generator:** Python script using `Faker` to generate hundreds of realistic students, mixed CGPA values, backlogs, applications, and placement offers for testing. |
| **`seed_generated.sql`** | The raw SQL output file generated by `seed.py` ready to be imported directly into MySQL. |
| **`README.md`** | Documentation explaining database setup, running migrations, and seeding instructions. |

---

## 📁 4. Operating Systems Lab (`os_lab/`)

Contains low-level **C programs** implementing operating system algorithms, multithreading, and synchronization routines.

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`src/scheduler.c`** | **CPU Scheduling Algorithms:** Implements First-Come First-Served (**FCFS**), Shortest Job First (**SJF**), **Priority Scheduling**, and **Round Robin** with time quantum. Computes Turnaround Time, Waiting Time, and generates Gantt chart output serialized to `output/schedule.json`. |
| **`src/sync.c`** | **Process Synchronization & Race Condition Demo:** Simulates concurrent threads trying to claim the last available job interview seat. Demonstrates how lack of synchronization leads to negative seat counts (race condition), and then shows how POSIX mutex locks and semaphores ensure mutual exclusion. Writes results to `output/sync_demo.json`. |
| **`src/deadlock.c`** | **Deadlock Detection & Banker's Algorithm:** Implements Dijkstra's Banker's Algorithm to check if resource allocations are in a safe state, and builds a Resource Allocation Graph (RAG) to detect circular waits among competing interview processes. Writes results to `output/deadlock.json`. |
| **`src/threads.c`** | **POSIX Multithreading:** Implements thread creation, lifecycle management, and argument passing to process student test submissions concurrently. |
| **`src/concurrent.c`** | **Concurrency Stress Test:** Spawns high volumes of worker threads simulating simultaneous applications to verify thread safety and race-free resource allocation. Writes to `output/concurrent.json`. |
| **`Makefile`** | Compilation script that uses `gcc` to build all C source files into standalone binaries (`bin/scheduler.exe`, `bin/sync.exe`, `bin/deadlock.exe`, `bin/concurrent.exe`). |
| **`README.md`** | Explains compilation flags, C library requirements, and manual execution commands. |

---

## 📁 5. Frontend (`frontend/`)

Built with **React**, **Vite**, **Tailwind CSS**, and **Chart.js**.

### Core Frontend Setup

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`src/main.jsx`** | **React DOM Root:** Mounts the React application tree into the HTML document root (`index.html`). |
| **`src/App.jsx`** | **Routing & Route Protection:** Defines the application layout, configures React Router (`/`, `/login`, `/jobs`, `/applications`, `/students`, `/admin`, `/post-job`, `/oslab`), and protects routes so unauthenticated visitors are redirected to `/login` and admin routes are restricted to admins. |
| **`src/index.css`** | **Global Styling:** Configures Tailwind CSS directives, dark-mode styling variables, glassmorphic card utilities, custom scrollbars, and typography rules. |
| **`package.json`** | Defines frontend NPM packages: `react`, `react-router-dom`, `lucide-react`, `chart.js`, `react-chartjs-2`, `vite`, `tailwindcss`. |
| **`vite.config.js`** | Configuration file for Vite build tool and development server. |

---

### Frontend Context & Services

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`src/context/AuthContext.jsx`** | **Authentication State Provider:** Manages logged-in user state, JWT tokens in `localStorage`, login credentials validation, account registration, role detection (`admin` vs. `student`), and sign-out actions across the entire component tree. |
| **`src/services/api.js`** | **Axios / Fetch API Client:** Centralized HTTP service containing functions to call every backend endpoint: `loginUser`, `registerUser`, `fetchJobs`, `fetchStudents`, `addCompany`, `updateCompany`, `deleteCompany`, `addStudent`, `updateStudent`, `deleteStudent`, `createJob`, `applyForJob`, `fetchReports`, and `runOSSchedule`. |

---

### Frontend Components & Pages

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`src/components/Navbar.jsx`** | **Global Navigation Bar:** Displays brand logo, navigation links, user profile details, role badges (e.g. `Admin`, `Student`), and Sign In / Sign Out buttons. Displays the "Admin Portal" link only when an Admin is logged in. |
| **`src/pages/Login.jsx`** | **Login & Sign-Up Page:** The initial entry screen. Features tabs for Sign In and Create Account (with role selection: TPO Administrator vs Student, plus Department, CGPA, and Backlogs), along with 1-click Demo buttons for quick testing. |
| **`src/pages/Dashboard.jsx`** | **Analytics & Operations Dashboard:** Tailored to the logged-in user. Displays KPI cards, interactive Chart.js Bar & Doughnut charts for department placement rates and salary brackets, recruitment funnel progress, and active drives. |
| **`src/pages/Jobs.jsx`** | **Drive Listings Page:** Shows all open campus recruitment drives with tier badges, salary packages, eligibility requirements, and an instant "Apply" button with real-time eligibility checking. |
| **`src/pages/Applications.jsx`** | **Application Tracking Page:**<br>• For **Students**: Shows "My Placement Portfolio" with their own student metrics card and **only the applications they personally submitted**.<br>• For **Admins**: Shows all candidate applications with controls to advance stages (`SHORTLISTED`, `INTERVIEWED`, `SELECTED`, `REJECTED`). |
| **`src/pages/Students.jsx`** | **Student Roster (Admin Only):** Displays the full student database, allowing admins to search, filter by department, inspect academic performance, and view placement statuses. Access is restricted for non-admin students. |
| **`src/pages/AdminPortal.jsx`** | **TPO Admin Console:** Comprehensive management center with 4 tabs:<br>1. *Companies:* Add new recruiters, edit details, or delete companies.<br>2. *Students:* Enroll new students, update CGPA/backlogs, or remove records.<br>3. *Post Drives:* Create new job drives linked to registered companies.<br>4. *All Applications:* Global applicant status updater. |
| **`src/pages/PostJob.jsx`** | Dedicated form page for placement coordinators to post new company job drives with eligibility criteria and deadlines. |
| **`src/pages/OSLab.jsx`** | **OS Simulation GUI:** Interactive laboratory allowing users to trigger CPU scheduling simulations (FCFS, SJF, Priority, Round Robin), view real-time Gantt charts, run synchronization race condition demos, and view deadlock avoidance graphs. |

---

## 📁 6. Documentation (`docs/`)

| File Name | Purpose & Explanation |
| :--- | :--- |
| **`docs/ER_diagram.md`** | Visual Entity-Relationship (ER) diagram, table schemas, primary/foreign key connections, and cardinality relationships across the database. |
| **`docs/api.md`** | Reference documentation of all REST API endpoints, request bodies, query parameters, and sample responses. |
