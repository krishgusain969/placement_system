"""
Tests for eligibility checking.
"""
from fastapi import status
from backend.models import Student, Job
from backend.eligibility import check_eligibility


def test_eligible_student(db):
    """Student meets all criteria."""
    student = db.query(Student).first()
    job = db.query(Job).first()

    eligible, reasons = check_eligibility(db, student, job)
    assert eligible is True
    assert reasons == []


def test_low_cgpa_rejected(db):
    """Student with CGPA below minimum."""
    student = db.query(Student).first()
    student.cgpa = 5.0  # Below job's 7.5 minimum
    job = db.query(Job).first()

    eligible, reasons = check_eligibility(db, student, job)
    assert eligible is False
    assert any("CGPA" in r for r in reasons)


def test_too_many_backlogs(db):
    """Student with more backlogs than allowed."""
    student = db.query(Student).first()
    student.backlogs = 5  # Exceeds job's 1 max
    job = db.query(Job).first()

    eligible, reasons = check_eligibility(db, student, job)
    assert eligible is False
    assert any("backlogs" in r for r in reasons)


def test_wrong_department(db):
    """Student from non-eligible department."""
    from backend.models import Department
    student = db.query(Student).first()
    # Change student's department to one not eligible for the job
    student.dept_id = 999  # Non-existent department
    job = db.query(Job).first()

    eligible, reasons = check_eligibility(db, student, job)
    assert eligible is False
    assert any("department" in r.lower() for r in reasons)


def test_already_placed(db):
    """Student who is already placed cannot apply."""
    student = db.query(Student).first()
    student.is_placed = True
    job = db.query(Job).first()

    eligible, reasons = check_eligibility(db, student, job)
    assert eligible is False
    assert any("placed" in r.lower() for r in reasons)
