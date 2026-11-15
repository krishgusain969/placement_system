"""
SQLAlchemy models for the Placement Management System.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DECIMAL, Date, Boolean, Text, DateTime, func
from sqlalchemy.orm import relationship
try:
    from database import Base
except ImportError:
    from backend.database import Base



class Department(Base):
    __tablename__ = "department"

    dept_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    students = relationship("Student", back_populates="department")
    job_eligible = relationship("JobEligibleDept", back_populates="department")


class Student(Base):
    __tablename__ = "student"

    student_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), nullable=False)
    cgpa = Column(DECIMAL(3, 2))
    backlogs = Column(Integer, default=0)
    skills = Column(Text)
    is_placed = Column(Boolean, default=False)

    department = relationship("Department", back_populates="students")
    applications = relationship("Application", back_populates="student")


class Company(Base):
    __tablename__ = "company"

    company_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    sector = Column(String(100))
    tier = Column(String(20))

    jobs = relationship("Job", back_populates="company")


class Job(Base):
    __tablename__ = "job"

    job_id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("company.company_id"), nullable=False)
    title = Column(String(100), nullable=False)
    package_lpa = Column(DECIMAL(6, 2))
    min_cgpa = Column(DECIMAL(3, 2))
    max_backlogs = Column(Integer, default=0)
    deadline = Column(Date)
    tier = Column(String(20))

    company = relationship("Company", back_populates="jobs")
    eligible_depts = relationship("JobEligibleDept", back_populates="job")
    applications = relationship("Application", back_populates="job")


class JobEligibleDept(Base):
    __tablename__ = "job_eligible_dept"

    job_id = Column(Integer, ForeignKey("job.job_id"), primary_key=True)
    dept_id = Column(Integer, ForeignKey("department.dept_id"), primary_key=True)

    job = relationship("Job", back_populates="eligible_depts")
    department = relationship("Department", back_populates="job_eligible")


class Application(Base):
    __tablename__ = "application"

    app_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job.job_id"), nullable=False)
    status = Column(String(20), default="APPLIED")
    applied_at = Column(DateTime, server_default=func.CURRENT_TIMESTAMP())

    student = relationship("Student", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    audit_logs = relationship("AuditLog", back_populates="application")


class Selection(Base):
    __tablename__ = "selection"

    selection_id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("application.app_id"), unique=True, nullable=False)
    offer_package = Column(DECIMAL(6, 2))
    offer_date = Column(DateTime, server_default=func.CURRENT_TIMESTAMP())
    accepted = Column(Boolean, default=False)

    application = relationship("Application")


class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey("application.app_id"), nullable=False)
    old_status = Column(String(20))
    new_status = Column(String(20))
    changed_at = Column(DateTime, default=func.now())

    application = relationship("Application", back_populates="audit_logs")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # student, recruiter, admin
    ref_id = Column(Integer)  # references student_id or company_id