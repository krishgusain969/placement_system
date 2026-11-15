"""
Shared test fixtures.
"""
import datetime
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.database import get_db
from backend.models import (
    Base, Department, Student, Company, Job,
    JobEligibleDept, Application, Selection, AuditLog, User
)
from sqlalchemy.pool import StaticPool
from backend.auth import get_password_hash

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.create_all(engine)
    session = TestingSessionLocal()
    seed_data(session)

    yield session

    session.close()
    Base.metadata.drop_all(engine)


@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    del app.dependency_overrides[get_db]


def seed_data(db):
    """Insert minimal seed data for tests."""
    # Departments
    cs = Department(name="Computer Science")
    ec = Department(name="Electronics")
    db.add_all([cs, ec])
    db.commit()

    # Student
    student = Student(
        name="Test Student",
        email="test@student.edu",
        dept_id=cs.dept_id,
        cgpa=8.5,
        backlogs=0,
        skills="Python, SQL",
        is_placed=False,
    )
    db.add(student)
    db.commit()

    # Company
    company = Company(name="TestCorp", sector="Software", tier="DREAM")
    db.add(company)
    db.commit()

    # Job
    job = Job(
        company_id=company.company_id,
        title="Software Engineer",
        package_lpa=18.0,
        min_cgpa=7.5,
        max_backlogs=1,
        deadline=datetime.date(2026, 12, 31),
        tier="SUPER_DREAM",
    )
    db.add(job)
    db.commit()

    # Job eligible dept
    db.add(JobEligibleDept(job_id=job.job_id, dept_id=cs.dept_id))
    db.commit()

    # User
    user = User(
        email="admin@test.edu",
        password_hash=get_password_hash("password123"),
        role="admin",
        ref_id=None,
    )
    db.add(user)
    db.commit()
