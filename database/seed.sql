-- Placement Management System - Seed Data
-- 4 departments, 8 companies, 12 jobs

USE placement_system;

-- Departments
INSERT INTO department (name) VALUES
('Computer Science & Engineering'),
('Electronics & Communication Engineering'),
('Mechanical Engineering'),
('Civil Engineering');

-- Companies
INSERT INTO company (name, sector, tier) VALUES
('TechCorp', 'Software', 'DREAM'),
('DataMasters', 'Analytics', 'DREAM'),
('InnovateX', 'Tech', 'SUPER_DREAM'),
('BuildRight', 'Construction', 'NORMAL'),
('MediCore', 'Healthcare', 'SUPER_DREAM'),
('FinEdge', 'Finance', 'NORMAL'),
('EduSmart', 'EdTech', 'NORMAL'),
('CloudNine', 'Cloud', 'SUPER_DREAM');

-- Jobs
INSERT INTO job (company_id, title, package_lpa, min_cgpa, max_backlogs, deadline, tier) VALUES
(1, 'Senior Software Engineer', 24.00, 8.5, 0, '2026-12-15', 'DREAM'),
(1, 'Software Engineer', 18.00, 7.5, 1, '2026-12-15', 'SUPER_DREAM'),
(2, 'Data Scientist', 20.00, 8.0, 0, '2026-12-20', 'DREAM'),
(2, 'Data Analyst', 12.00, 7.0, 2, '2026-12-20', 'NORMAL'),
(3, 'Product Engineer', 16.00, 7.5, 1, '2026-12-10', 'SUPER_DREAM'),
(4, 'Site Engineer', 6.50, 6.5, 3, '2026-12-25', 'NORMAL'),
(5, 'Biotech R&D', 14.00, 7.0, 1, '2026-12-18', 'NORMAL'),
(6, 'Quantitative Analyst', 19.00, 8.5, 0, '2026-12-22', 'SUPER_DREAM'),
(7, 'Learning Platform Dev', 10.00, 7.0, 2, '2026-12-30', 'NORMAL'),
(8, 'Cloud Solutions Architect', 22.00, 8.0, 0, '2026-12-12', 'DREAM'),
(3, 'Junior Developer', 8.00, 6.5, 3, '2026-12-10', 'NORMAL'),
(4, 'Civil Design Engineer', 7.50, 7.0, 2, '2026-12-28', 'NORMAL');

-- Job eligible departments
-- TechCorp roles open to CSE and ECE
INSERT INTO job_eligible_dept (job_id, dept_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1), (3, 2),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 3),
(6, 3), (6, 4),
(7, 1), (7, 3),
(8, 1), (8, 2),
(9, 1), (9, 2),
(10, 1),
(11, 1), (11, 3),
(12, 3), (12, 4);

-- Students (10 sample students)
INSERT INTO student (name, email, dept_id, cgpa, backlogs, skills, is_placed) VALUES
('Rahul Sharma', 'rahul.sharma@student.edu', 1, 8.8, 0, 'Python, SQL, React', FALSE),
('Priya Patel', 'priya.patel@student.edu', 1, 9.2, 0, 'Java, Spring, MySQL', FALSE),
('Amit Kumar', 'amit.kumar@student.edu', 2, 7.5, 1, 'C++, Data Structures', FALSE),
('Neha Singh', 'nehasingh@student.edu', 1, 6.8, 2, 'HTML, CSS, JavaScript', FALSE),
('Rohan Mehta', 'rohan.mehta@student.edu', 3, 7.8, 0, 'SolidWorks, AutoCAD', FALSE),
('Sneha Reddy', 'sneha.reddy@student.edu', 1, 8.3, 0, 'Machine Learning, Python', FALSE),
('Kunal Joshi', 'kunal.joshi@student.edu', 1, 9.5, 0, 'System Design, Go', FALSE),
('Pooja Verma', 'pooja.verma@student.edu', 4, 7.2, 3, 'Structural Analysis', FALSE),
('Deepak Nair', 'deepak.nair@student.edu', 2, 8.0, 0, 'IoT, Embedded C', FALSE),
('Anjali Bose', 'anjali.bose@student.edu', 3, 7.0, 1, 'Thermodynamics, MATLAB', FALSE);

-- Users (for auth)
INSERT INTO users (email, password_hash, role, ref_id) VALUES
('student@student.edu', '$2b$12$placeholder_student_hash', 'student', 1),
('recruiter@company.edu', '$2b$12$placeholder_recruiter_hash', 'recruiter', 1),
('admin@placement.edu', '$2b$12$placeholder_admin_hash', 'admin', NULL);