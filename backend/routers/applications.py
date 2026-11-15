"""
Applications router: student job applications + OS queue integration.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import date

from backend.database import get_db
from backend.models import Application, Job, Student, JobEligibleDept, Selection, AuditLog, Company
from backend.eligibility import check_eligibility
from backend.auth import require_role

router = APIRouter()


class ApplicationOut(BaseModel):
    app_id: int
    student_id: int
    student_name: str
    student_email: str | None = None
    department: str | None = None
    cgpa: float | None = None
    backlogs: int | None = None
    skills: str | None = None
    job_id: int
    job_title: str
    company_name: str
    status: str
    applied_at: str | None = None
    package_lpa: float | None = None


class ApplicationCreate(BaseModel):
    student_id: int
    job_id: int


class StatusUpdate(BaseModel):
    status: str


@router.get("/", response_model=List[ApplicationOut])
def list_applications(db: Session = Depends(get_db)):
    """List all applications (admin can see all student details)."""
    from backend.models import Department
    apps = db.query(Application).all()
    result = []
    for a in apps:
        s = db.query(Student).filter(Student.student_id == a.student_id).first()
        dept_name = None
        if s:
            dept_name = db.query(Department.name).filter(Department.dept_id == s.dept_id).scalar()
        j = db.query(Job).filter(Job.job_id == a.job_id).first()
        c = db.query(Company.name).filter(Company.company_id == j.company_id).scalar() if j else None
        sel = db.query(Selection).filter(Selection.app_id == a.app_id).first()
        result.append(ApplicationOut(
            app_id=a.app_id,
            student_id=a.student_id,
            student_name=s.name if s else "",
            student_email=s.email if s else "",
            department=dept_name or "",
            cgpa=float(s.cgpa) if s and s.cgpa is not None else None,
            backlogs=s.backlogs if s else 0,
            skills=s.skills if s else "",
            job_id=a.job_id,
            job_title=j.title if j else "",
            company_name=c or "",
            status=a.status,
            applied_at=str(a.applied_at) if a.applied_at else None,
            package_lpa=float(sel.offer_package) if sel else (float(j.package_lpa) if j and j.package_lpa else None),
        ))
    return result



@router.get("/student/{student_id}", response_model=List[ApplicationOut])
def student_applications(student_id: int, db: Session = Depends(get_db)):
    """Get all applications for a specific student."""
    apps = db.query(Application).filter(Application.student_id == student_id).all()
    result = []
    for a in apps:
        j = db.query(Job).filter(Job.job_id == a.job_id).first()
        c = db.query(Company.name).filter(Company.company_id == j.company_id).scalar() if j else None
        sel = db.query(Selection).filter(Selection.app_id == a.app_id).first()
        result.append(ApplicationOut(
            app_id=a.app_id,
            student_id=a.student_id,
            student_name=db.query(Student.name).filter(Student.student_id == a.student_id).scalar() or "",
            job_id=a.job_id,
            job_title=j.title if j else "",
            company_name=c or "",
            status=a.status,
            applied_at=str(a.applied_at) if a.applied_at else None,
            package_lpa=float(sel.offer_package) if sel else None,
        ))
    return result


@router.post("/", response_model=dict)
def create_application(
    app_data: ApplicationCreate,
    db: Session = Depends(get_db),
):
    """
    Create an application.
    Checks eligibility (both in app and via DB trigger).
    Routes through OS queue simulation in future integration.
    """
    # Check if already exists
    existing = db.query(Application).filter(
        Application.student_id == app_data.student_id,
        Application.job_id == app_data.job_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Student has already applied for this job"
        )

    student = db.query(Student).filter(Student.student_id == app_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    job = db.query(Job).filter(Job.job_id == app_data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check eligibility with reasons (transparency goal)
    eligible, reasons = check_eligibility(db, student, job)
    if not eligible:
        raise HTTPException(
            status_code=403,
            detail="Student not eligible",
            headers={"X-Eligibility-Reasons": "; ".join(reasons)},
        )

    # Create application — DB trigger will also verify eligibility independently
    new_app = Application(
        student_id=app_data.student_id,
        job_id=app_data.job_id,
        status="APPLIED",
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    # NOTE: In Week 5, this will push to the OS thread-pool queue in C
    # and acquire a seat mutex before finalizing.

    return {
        "app_id": new_app.app_id,
        "status": new_app.status,
        "message": "Application submitted. Eligibility verified in both app and DB.",
    }


@router.patch("/{app_id}/status", response_model=ApplicationOut)
def update_status(app_id: int, update: StatusUpdate, db: Session = Depends(get_db)):
    """Update application status (recruiter/admin action)."""
    app_record = db.query(Application).filter(Application.app_id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app_record.status
    app_record.status = update.status
    db.commit()
    db.refresh(app_record)

    # The DB trigger (after_status_update) will also log this — demonstrating dual-layer consistency
    db_audit = AuditLog(
        app_id=app_id,
        old_status=old_status,
        new_status=update.status,
    )
    db.add(db_audit)
    db.commit()

    return ApplicationOut(
        app_id=app_record.app_id,
        student_id=app_record.student_id,
        student_name=db.query(Student.name).filter(Student.student_id == app_record.student_id).scalar() or "",
        job_id=app_record.job_id,
        job_title=db.query(Job.title).filter(Job.job_id == app_record.job_id).scalar() or "",
        company_name=db.query(Company.name).join(Job).filter(Job.job_id == app_record.job_id).scalar() or "",
        status=app_record.status,
        applied_at=str(app_record.applied_at) if app_record.applied_at else None,
        package_lpa=None,
    )


@router.get("/{app_id}/audit", response_model=List[dict])
def get_audit_log(app_id: int, db: Session = Depends(get_db)):
    """Get audit trail for an application."""
    logs = db.query(AuditLog).filter(AuditLog.app_id == app_id).all()
    return [{"old_status": l.old_status, "new_status": l.new_status, "changed_at": str(l.changed_at)} for l in logs]
