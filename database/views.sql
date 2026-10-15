-- Placement Management System - Views for Reporting

USE placement_system;

-- View 1: Department placement report
CREATE VIEW v_dept_placement AS
SELECT
    d.name AS department,
    COUNT(s.student_id) AS total_students,
    SUM(s.is_placed) AS placed_count,
    ROUND(100 * SUM(s.is_placed) / COUNT(s.student_id), 1) AS placement_pct,
    ROUND(AVG(sel.offer_package), 2) AS avg_package_lpa,
    MAX(sel.offer_package) AS max_package_lpa
FROM department d
JOIN student s ON s.dept_id = d.dept_id
LEFT JOIN application a ON a.student_id = s.student_id AND a.status = 'SELECTED'
LEFT JOIN selection sel ON sel.app_id = a.app_id
GROUP BY d.dept_id, d.name;

-- View 2: Company report
CREATE VIEW v_company_report AS
SELECT
    c.name AS company,
    c.tier,
    j.title AS job_title,
    j.package_lpa,
    COUNT(a.app_id) AS applicants,
    SUM(CASE WHEN a.status = 'SHORTLISTED' THEN 1 ELSE 0 END) AS shortlisted,
    SUM(CASE WHEN a.status = 'SELECTED' THEN 1 ELSE 0 END) AS selected,
    ROUND(AVG(sel.offer_package), 2) AS avg_offer_lpa,
    MAX(sel.offer_package) AS max_offer_lpa
FROM company c
JOIN job j ON j.company_id = c.company_id
LEFT JOIN application a ON a.job_id = j.job_id
LEFT JOIN selection sel ON sel.app_id = a.app_id
GROUP BY c.company_id, c.name, c.tier, j.job_id, j.title, j.package_lpa;

-- View 3: Eligible jobs for each student
CREATE VIEW v_eligible_jobs AS
SELECT
    s.student_id,
    s.name AS student_name,
    s.email,
    s.cgpa,
    s.backlogs,
    j.job_id,
    j.title AS job_title,
    j.company_id,
    c.name AS company_name,
    j.package_lpa
FROM student s
JOIN job_eligible_dept d ON d.dept_id = s.dept_id
JOIN job j ON j.job_id = d.job_id
JOIN company c ON c.company_id = j.company_id
WHERE s.cgpa >= j.min_cgpa
  AND s.backlogs <= j.max_backlogs
  AND j.deadline >= CURDATE()
  AND s.is_placed = FALSE;