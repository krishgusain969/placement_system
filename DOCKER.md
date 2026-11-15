# Docker Setup Guide - Placement Management System

This project is fully containerized using Docker and Docker Compose. It includes:
1. **Database (`db`)**: MySQL 8.0 initialized with schema, procedures, triggers, views, and seed data.
2. **Backend (`backend`)**: Python FastAPI backend with C compiler (`gcc`, `make`) to automatically build and run the C OS Lab binaries (Scheduler, Sync, Deadlock detection).
3. **Frontend (`frontend`)**: React + Vite + Tailwind production build served via Nginx with reverse proxy to `/api`.

---

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

## Quick Start

### 1. Build and Start All Containers
From the project root directory, run:
```bash
docker compose up --build
```
Or run in detached (background) mode:
```bash
docker compose up -d --build
```

### 2. Access the Applications
- **Frontend Web UI**: [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MySQL Database**: `localhost:3306`
  - User: `placement_user`
  - Password: `placement_password`
  - Database: `placement_system`

---

## Demo Credentials

- **Admin Account**:
  - Email: `admin@placement.edu`
  - Password: `admin123`
- **Student Account**:
  - Email: `rahul@college.edu`
  - Password: `student123`

---

## Useful Commands

- **Stop all containers**:
  ```bash
  docker compose down
  ```
- **Stop containers and remove volumes (fresh database reset)**:
  ```bash
  docker compose down -v
  ```
- **View backend logs**:
  ```bash
  docker compose logs -f backend
  ```
- **Access backend bash shell**:
  ```bash
  docker compose exec backend bash
  ```
- **Access MySQL shell**:
  ```bash
  docker compose exec db mysql -u placement_user -pplacement_password placement_system
  ```
