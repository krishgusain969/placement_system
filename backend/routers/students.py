"""
Students router: profile management.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Student, Department, User
from backend.auth import require_role

router = APIRouter()


class StudentOut(BaseModel):
    student_id: int
    name: str
    email: str
    dept_id: int
    dept_name: str
    cgpa: float
    backlogs: int
    skills: str
    is_placed: bool

    class Config:
        from_attributes = True


class StudentCreate(BaseModel):
    name: str
    email: str
    dept_id: int | None = None
    dept_name: str | None = None
    cgpa: float = 8.0
    backlogs: int = 0
    skills: str = ""
    password: str | None = "student123"


class StudentUpdate(BaseModel):
    name: str | None = None
    cgpa: float | None = None
    backlogs: int | None = None
    skills: str | None = None
    dept_id: int | None = None


@router.get("/departments/list")
def list_departments(db: Session = Depends(get_db)):
    """List all college departments."""
    depts = db.query(Department).all()
    return [{"dept_id": d.dept_id, "name": d.name} for d in depts]


@router.get("/", response_model=List[StudentOut])
def list_students(db: Session = Depends(get_db)):
    """List all students (admin only in frontend UI)."""
    students = db.query(Student).all()
    return [
        StudentOut(
            student_id=s.student_id,
            name=s.name,
            email=s.email,
            dept_id=s.dept_id,
            dept_name=db.query(Department.name).filter(Department.dept_id == s.dept_id).scalar() or "General",
            cgpa=float(s.cgpa) if s.cgpa is not None else 0.0,
            backlogs=s.backlogs,
            skills=s.skills or "",
            is_placed=s.is_placed,
        )
        for s in students
    ]


@router.post("/", response_model=StudentOut)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    """Add a new student (admin action)."""
    existing = db.query(Student).filter(Student.email == student.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists")

    dept = None
    if student.dept_id:
        dept = db.query(Department).filter(Department.dept_id == student.dept_id).first()
    elif student.dept_name:
        dept = db.query(Department).filter(Department.name.ilike(f"%{student.dept_name}%")).first()
    if not dept:
        dept = db.query(Department).first()
    if not dept:
        dept = Department(name="Computer Science & Engineering")
        db.add(dept)
        db.flush()

    new_s = Student(
        name=student.name,
        email=student.email,
        dept_id=dept.dept_id,
        cgpa=student.cgpa,
        backlogs=student.backlogs,
        skills=student.skills,
        is_placed=False,
    )
    db.add(new_s)
    db.flush()

    # Also register login user account for the student
    if not db.query(User).filter(User.email == student.email).first():
        from backend.auth import get_password_hash
        user = User(
            email=student.email,
            password_hash=get_password_hash(student.password or "student123"),
            role="student",
            ref_id=new_s.student_id,
        )
        db.add(user)

    db.commit()
    db.refresh(new_s)

    return StudentOut(
        student_id=new_s.student_id,
        name=new_s.name,
        email=new_s.email,
        dept_id=new_s.dept_id,
        dept_name=dept.name,
        cgpa=float(new_s.cgpa),
        backlogs=new_s.backlogs,
        skills=new_s.skills or "",
        is_placed=new_s.is_placed,
    )


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    """Get a single student's profile."""
    s = db.query(Student).filter(Student.student_id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")

    dept_name = db.query(Department.name).filter(Department.dept_id == s.dept_id).scalar() or "General"
    return StudentOut(
        student_id=s.student_id,
        name=s.name,
        email=s.email,
        dept_id=s.dept_id,
        dept_name=dept_name,
        cgpa=float(s.cgpa) if s.cgpa is not None else 0.0,
        backlogs=s.backlogs,
        skills=s.skills or "",
        is_placed=s.is_placed,
    )


@router.patch("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    update: StudentUpdate,
    db: Session = Depends(get_db),
):
    """Update student profile (own or admin)."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if update.name:
        student.name = update.name
    if update.cgpa is not None:
        student.cgpa = update.cgpa
    if update.backlogs is not None:
        student.backlogs = update.backlogs
    if update.skills:
        student.skills = update.skills
    if update.dept_id is not None:
        student.dept_id = update.dept_id

    db.commit()
    db.refresh(student)
    dept_name = db.query(Department.name).filter(Department.dept_id == student.dept_id).scalar() or "General"
    return StudentOut(
        student_id=student.student_id,
        name=student.name,
        email=student.email,
        dept_id=student.dept_id,
        dept_name=dept_name,
        cgpa=float(student.cgpa) if student.cgpa is not None else 0.0,
        backlogs=student.backlogs,
        skills=student.skills or "",
        is_placed=student.is_placed,
    )


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    s = db.query(Student).filter(Student.student_id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student not found")
    from backend.models import Application
    db.query(Application).filter(Application.student_id == student_id).delete()
    db.query(User).filter(User.ref_id == student_id, User.role == "student").delete()
    db.delete(s)
    db.commit()
    return {"message": "Student deleted successfully", "student_id": student_id}
