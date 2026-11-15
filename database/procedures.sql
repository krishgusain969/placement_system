-- Placement Management System - Stored Procedures & Functions
-- This file contains all reusable database logic for eligibility checks,
-- student selection rules, and enforcement of placement constraints.

USE placement_system;

DELIMITER $$

-- Checks whether a student is eligible to apply for a given job.
-- Validates academic, backlog, deadline, department, and placement status rules.
CREATE FUNCTION is_eligible(p_student INT, p_job INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM student s
        JOIN job j ON j.job_id = p_job
        JOIN job_eligible_dept d ON d.job_id = j.job_id AND d.dept_id = s.dept_id
        WHERE s.student_id = p_student
          AND s.cgpa >= j.min_cgpa
          AND s.backlogs <= j.max_backlogs
          AND j.deadline >= CURDATE()
          AND s.is_placed = FALSE  -- cannot apply once placed
    );
END$$

-- Ensures the student can only move to a job tier that is allowed by
-- the current placement tier progression rule.
CREATE FUNCTION check_tier_rule(p_student INT, p_job INT)
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE stu_tier VARCHAR(20);
    DECLARE job_tier VARCHAR(20);

    -- Get student's current tier (from any existing selection)
    SELECT j.tier INTO stu_tier
    FROM student s
    JOIN application a ON s.student_id = a.student_id
    JOIN job j ON a.job_id = j.job_id
    JOIN selection sel ON sel.app_id = a.app_id
    WHERE s.student_id = p_student
    LIMIT 1;

    SELECT tier INTO job_tier FROM job WHERE job_id = p_job;

    -- If no existing selection, allowed
    IF stu_tier IS NULL THEN
        RETURN TRUE;
    END IF;

    -- DREAM > SUPER_DREAM > NORMAL
    IF (stu_tier = 'NORMAL' AND job_tier IN ('SUPER_DREAM','DREAM')) OR
       (stu_tier = 'SUPER_DREAM' AND job_tier = 'DREAM') OR
       (stu_tier = job_tier) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END$$

-- Selects a student for a job offer in a single transactional flow.
-- The operation is wrapped in a transaction so any failure triggers rollback.
CREATE PROCEDURE select_student(
    IN p_app_id INT,
    IN p_package DECIMAL(6,2)
)
MODIFIES SQL DATA
BEGIN
    DECLARE v_student_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Get the student_id from the application
    SELECT student_id INTO v_student_id
    FROM application
    WHERE app_id = p_app_id
    FOR UPDATE;

    -- Block second offer rule
    IF EXISTS (
        SELECT 1 FROM selection s
        JOIN application a ON s.app_id = a.app_id
        WHERE a.student_id = v_student_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student already has an offer';
    END IF;

    -- Update application status
    UPDATE application
    SET status = 'SELECTED'
    WHERE app_id = p_app_id;

    -- Insert selection record
    INSERT INTO selection (app_id, offer_package, accepted)
    VALUES (p_app_id, p_package, FALSE);

    COMMIT;
END$$

-- Prevents duplicate offers by rejecting any insertion that would create
-- a second selection for the same student.
CREATE TRIGGER before_selection_insert
BEFORE INSERT ON selection
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;

    SELECT a.student_id INTO v_student_id
    FROM application a WHERE a.app_id = NEW.app_id;

    -- Check if student already has a selection
    IF EXISTS (
        SELECT 1 FROM selection s
        JOIN application a ON s.app_id = a.app_id
        WHERE a.student_id = v_student_id
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student already has an offer (one offer per student rule)';
    END IF;
END$$

DELIMITER ;