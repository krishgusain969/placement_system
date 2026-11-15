"""
Jobs router: job listings, creation, and eligibility check.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from datetime import date

from backend.database import get_db
from backend.models import Job, JobEligibleDept, Company, Application, Student
from backend.eligibility import check_eligibility

router = APIRouter()


class JobOut(BaseModel):
    job_id: int
    company_id: int
    company_name: str
    title: str
    package_lpa: float
    min_cgpa: float
    max_backlogs: int
    deadline: date | None = None
    tier: str | None = None


class JobCreate(BaseModel):
    company_id: int
    title: str
    package_lpa: float = Field(gt=0)
    min_cgpa: float = Field(ge=0, le=10)
    max_backlogs: int = Field(ge=0)
    deadline: date
    tier: str = "NORMAL"
    eligible_depts: List[int] = []


class EligibilityCheck(BaseModel):
    eligible: bool
    reasons: List[str]


@router.get("/", response_model=List[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    return [
        JobOut(
            job_id=j.job_id,
            company_id=j.company_id,
            company_name=db.query(Company.name).filter(Company.company_id == j.company_id).scalar() or "",
            title=j.title,
            package_lpa=float(j.package_lpa),
            min_cgpa=float(j.min_cgpa),
            max_backlogs=j.max_backlogs,
            deadline=j.deadline,
            tier=j.tier,
        )
        for j in jobs
    ]


@router.post("/", response_model=JobOut)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
):
    # Check company exists
    company = db.query(Company).filter(Company.company_id == job.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    db_job = Job(
        company_id=job.company_id,
        title=job.title,
        package_lpa=job.package_lpa,
        min_cgpa=job.min_cgpa,
        max_backlogs=job.max_backlogs,
        deadline=job.deadline,
        tier=job.tier,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # Add eligible departments
    for dept_id in job.eligible_depts:
        db.add(JobEligibleDept(job_id=db_job.job_id, dept_id=dept_id))
    db.commit()

    return JobOut(
        job_id=db_job.job_id,
        company_id=db_job.company_id,
        company_name=company.name,
        title=db_job.title,
        package_lpa=float(db_job.package_lpa),
        min_cgpa=float(db_job.min_cgpa),
        max_backlogs=db_job.max_backlogs,
        deadline=db_job.deadline,
        tier=db_job.tier,
    )


@router.get("/{job_id}/eligible-students", response_model=List[dict])
def eligible_students(job_id: int, db: Session = Depends(get_db)):
    """Get all students eligible for a job (recruiter/admin view)."""
    eligible = (
        db.query(Student)
        .join(JobEligibleDept, Student.dept_id == JobEligibleDept.dept_id)
        .filter(
            JobEligibleDept.job_id == job_id,
            Student.is_placed == False,
        )
        .all()
    )
    return [{"student_id": s.student_id, "name": s.name, "cgpa": float(s.cgpa)} for s in eligible]


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    j = db.query(Job).filter(Job.job_id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    company = db.query(Company).filter(Company.company_id == j.company_id).first()
    return JobOut(
        job_id=j.job_id,
        company_id=j.company_id,
        company_name=company.name if company else "",
        title=j.title,
        package_lpa=float(j.package_lpa),
        min_cgpa=float(j.min_cgpa),
        max_backlogs=j.max_backlogs,
        deadline=j.deadline,
        tier=j.tier,
    )
