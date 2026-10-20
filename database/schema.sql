-- Placement Management System - Schema
-- 3NF design with PK/FK/CHECK constraints

CREATE DATABASE IF NOT EXISTS placement_system;
USE placement_system;

-- Department table
CREATE TABLE department (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Student table
CREATE TABLE student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    dept_id INT NOT NULL,
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0 AND 10),
    backlogs INT DEFAULT 0 CHECK (backlogs >= 0),
    skills TEXT,
    is_placed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);

-- Company table
CREATE TABLE company (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sector VARCHAR(100),
    tier ENUM('DREAM', 'SUPER_DREAM', 'NORMAL') DEFAULT 'NORMAL'
);

-- Job table
CREATE TABLE job (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    package_lpa DECIMAL(6,2),
    min_cgpa DECIMAL(3,2),
    max_backlogs INT DEFAULT 0,
    deadline DATE,
    tier ENUM('DREAM', 'SUPER_DREAM', 'NORMAL') DEFAULT 'NORMAL',
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

-- Job eligible department (many-to-many)
CREATE TABLE job_eligible_dept (
    job_id INT,
    dept_id INT,
    PRIMARY KEY (job_id, dept_id),
    FOREIGN KEY (job_id) REFERENCES job(job_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);

-- Application table
CREATE TABLE application (
    app_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('APPLIED','SHORTLISTED','INTERVIEWED','SELECTED','REJECTED') DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, job_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (job_id) REFERENCES job(job_id)
);

-- Audit log table (tracks application status transitions)
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (app_id) REFERENCES application(app_id) ON DELETE CASCADE
);

-- Selection table (one application -> 0 or 1 selection)
CREATE TABLE selection (
    selection_id INT AUTO_INCREMENT PRIMARY KEY,
    app_id INT UNIQUE,
    offer_package DECIMAL(6,2),
    offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (app_id) REFERENCES application(app_id)
);

-- Users table (for auth)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student','recruiter','admin') NOT NULL,
    ref_id INT  -- references student_id or company_id
);