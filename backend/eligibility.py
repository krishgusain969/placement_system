"""
Eligibility engine.

Returns specific reasons why a student fails a job's criteria,
supporting the transparency goal.
"""
from datetime import date
from typing import List, Tuple

from sqlalchemy.orm import Session
from backend.models import Student, Job, JobEligibleDept


def check_eligibility(db: Session, student: Student, job: Job) -> Tuple[bool, List[str]]:
    """
    Check if a student is eligible for a job.
    Returns (is_eligible: bool, reasons: list[str]).
    """
    reasons = []

    # CGPA check
    if student.cgpa < job.min_cgpa:
        reasons.append(
            f"CGPA {student.cgpa} is below the required {job.min_cgpa}"
        )

    # Backlog check
    if student.backlogs > job.max_backlogs:
        reasons.append(
            f"{student.backlogs} backlogs exceed the limit of {job.max_backlogs}"
        )

    # Deadline check
    if job.deadline and job.deadline < date.today():
        reasons.append(f"Application deadline {job.deadline} has passed")

    # Department eligibility check
    eligible_dept = (
        db.query(JobEligibleDept)
        .filter(
            JobEligibleDept.job_id == job.job_id,
            JobEligibleDept.dept_id == student.dept_id,
        )
        .first()
    )
    if not eligible_dept:
        reasons.append("Your department is not eligible for this job")

    # Already placed check (one offer per student rule)
    if student.is_placed:
        reasons.append("You have already been placed and cannot apply to new jobs")

    return (len(reasons) == 0, reasons)
