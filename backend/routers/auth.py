"""
Auth router: login and register endpoints.
"""
from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, Student, Department
from backend.auth import authenticate_user, create_access_token, get_password_hash

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "student"  # student | admin
    name: str = "User"
    dept_id: int | None = 1
    cgpa: float | None = 8.0
    backlogs: int | None = 0
    skills: str | None = "Python, Web Development"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    name: str | None = None
    email: str | None = None
    ref_id: int | None = None
    student_id: int | None = None
    dept: str | None = None
    cgpa: float | None = None
    backlogs: int | None = None
    skills: str | None = None
    is_placed: bool | None = None


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        data={"sub": str(user.user_id), "role": user.role},
        expires_delta=timedelta(minutes=60),
    )

    name = "User"
    student_id = None
    dept_name = None
    cgpa = None
    backlogs = None
    skills = None
    is_placed = None

    if user.role == "student":
        student = None
        if user.ref_id:
            student = db.query(Student).filter(Student.student_id == user.ref_id).first()
        if not student:
            student = db.query(Student).filter(Student.email == user.email).first()
        if student:
            student_id = student.student_id
            name = student.name
            cgpa = float(student.cgpa) if student.cgpa is not None else None
            backlogs = student.backlogs
            skills = student.skills
            is_placed = student.is_placed
            d = db.query(Department).filter(Department.dept_id == student.dept_id).first()
            dept_name = d.name if d else "General"
    elif user.role == "admin":
        name = "Placement Administrator (TPO)"
    elif user.role == "recruiter":
        name = "Corporate Recruiter"

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.user_id,
        name=name,
        email=user.email,
        ref_id=user.ref_id,
        student_id=student_id,
        dept=dept_name,
        cgpa=cgpa,
        backlogs=backlogs,
        skills=skills,
        is_placed=is_placed,
    )


@router.post("/register", response_model=LoginResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    student_id = None
    dept_name = None
    cgpa = None
    backlogs = None
    skills = None
    is_placed = False

    if request.role == "student":
        # Find department or create fallback
        dept = None
        if request.dept_id:
            dept = db.query(Department).filter(Department.dept_id == request.dept_id).first()
        if not dept:
            dept = db.query(Department).first()
        if not dept:
            dept = Department(name="Computer Science")
            db.add(dept)
            db.flush()

        dept_name = dept.name
        cgpa = float(request.cgpa) if request.cgpa is not None else 8.0
        backlogs = request.backlogs or 0
        skills = request.skills or "Python, Web Development"

        new_student = Student(
            name=request.name,
            email=request.email,
            dept_id=dept.dept_id,
            cgpa=cgpa,
            backlogs=backlogs,
            skills=skills,
            is_placed=False,
        )
        db.add(new_student)
        db.flush()
        student_id = new_student.student_id

        new_user = User(
            email=request.email,
            password_hash=get_password_hash(request.password),
            role="student",
            ref_id=student_id,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
        name = request.name
    else:
        new_user = User(
            email=request.email,
            password_hash=get_password_hash(request.password),
            role="admin",
            ref_id=None,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
        name = request.name or "Placement Administrator"

    access_token = create_access_token(
        data={"sub": str(user.user_id), "role": user.role},
        expires_delta=timedelta(minutes=60),
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
        user_id=user.user_id,
        name=name,
        email=user.email,
        ref_id=user.ref_id,
        student_id=student_id,
        dept=dept_name,
        cgpa=cgpa,
        backlogs=backlogs,
        skills=skills,
        is_placed=is_placed,
    )
