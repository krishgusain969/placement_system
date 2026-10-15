-- Placement Management System - Triggers
-- Transparency feature: audit log + eligibility enforcement

USE placement_system;

-- Trigger 1: Block ineligible applications
DELIMITER $$

CREATE TRIGGER before_apply
BEFORE INSERT ON application
FOR EACH ROW
BEGIN
    IF NOT is_eligible(NEW.student_id, NEW.job_id) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student not eligible for this job';
    END IF;
END$$

-- Trigger 2: Log every status change (audit trail)
CREATE TRIGGER after_status_update
AFTER UPDATE ON application
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_log (app_id, old_status, new_status, changed_at)
        VALUES (OLD.app_id, OLD.status, NEW.status, NOW());
    END IF;
END$$

-- Trigger 3: Mark student placed on selection
CREATE TRIGGER after_selection
AFTER INSERT ON selection
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;
    SELECT a.student_id INTO v_student_id
    FROM application a WHERE a.app_id = NEW.app_id;

    -- Mark student as placed
    UPDATE student SET is_placed = TRUE WHERE student_id = v_student_id;
END$$

DELIMITER ;