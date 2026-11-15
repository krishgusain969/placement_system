"""
Tests for jobs endpoints.
"""
from fastapi import status
from backend.models import Job, Company, Department, JobEligibleDept


def test_list_jobs(client, db):
    response = client.get("/jobs/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1


def test_get_job(client, db):
    job = db.query(Job).first()
    response = client.get(f"/jobs/{job.job_id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == job.title
    assert data["company_name"] == "TestCorp"


def test_eligible_students(client, db):
    job = db.query(Job).first()
    response = client.get(f"/jobs/{job.job_id}/eligible-students")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Student"


def test_create_job(client, db):
    company = db.query(Company).first()
    cs_dept = db.query(Department).filter(Department.name == "Computer Science").first()

    response = client.post("/jobs/", json={
        "company_id": company.company_id,
        "title": "New Job",
        "package_lpa": 10.0,
        "min_cgpa": 7.0,
        "max_backlogs": 2,
        "deadline": "2026-12-31",
        "tier": "NORMAL",
        "eligible_depts": [cs_dept.dept_id],
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "New Job"
