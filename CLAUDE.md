# Placement Management System - CLAUDE.md

## Project Goal

A 3-layer web app: React frontend, FastAPI backend, MySQL database,
plus a **C OS Lab module** for scheduling, synchronization, and deadlock demos.

## Tech Stack

- **Frontend**: React + Vite + Tailwind + Chart.js
- **Backend**: Python + FastAPI + SQLAlchemy + JWT + bcrypt
- **Database**: MySQL 8 (triggers, stored procedures, views)
- **OS Lab**: C (CPU scheduling, semaphores, deadlock detection)

## Rules

1. All eligibility logic lives in **SQL** (is_eligible function), never in app code.
2. Triggers handle audit log, ineligible blocking, and offer rules.
3. OS module (C) is invoked via CLI and communicates with backend via JSON files.
4. Never hardcode secrets — use environment variables.
5. Every endpoint has a pytest test.
6. Commit after each working step.

## Folder Structure

```
placement-system/
├── database/     # schema.sql, triggers.sql, procedures.sql, views.sql, seed.sql, seed.py
├── backend/      # FastAPI app (main.py, routers/, auth.py, eligibility.py)
├── os_lab/       # C source: scheduler, sync, deadlock demos
├── frontend/     # React + Vite + Tailwind app
├── docs/         # ER diagram, API docs, report
└── CLAUDE.md
```

## Week-by-Week Roadmap

- **Week 1**: Requirements, ER diagram, schema, seed data, GitHub repo
- **Week 2**: Triggers, functions, procedures, views; FastAPI auth + CRUD
- **Week 3**: Eligibility endpoints, application flow; frontend login + student pages
- **Week 4**: OS module in C (scheduler, sync, deadlock); CLI tests
- **Week 5**: OS Lab UI; connect POST /applications to queue; reports + charts
- **Week 6**: Testing, bug fixes, README, report, viva practice
- **Docker**: `docker compose up --build` launches MySQL 8, FastAPI backend (with C OS lab compiled), and Nginx React frontend.