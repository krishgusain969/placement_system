"""
Tests for application endpoints.
"""
from fastapi import status
from backend.models import Application, Student, Job


def test_apply_success(client, db):
    """Eligible student can apply to eligible job."""
    student = db.query(Student).first()
    job = db.query(Job).first()

    response = client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "APPLIED"
    assert "Eligibility verified" in data["message"]


def test_apply_twice_rejected(client, db):
    """Same student cannot apply twice to same job (UNIQUE constraint)."""
    student = db.query(Student).first()
    job = db.query(Job).first()

    # First application
    client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })

    # Second application should fail
    response = client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already applied" in response.json()["detail"].lower()


def test_apply_ineligible_rejected(client, db):
    """Ineligible student is rejected with specific reason."""
    student = db.query(Student).first()
    student.cgpa = 5.0  # Below 7.5 minimum
    job = db.query(Job).first()

    response = client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })
    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert "not eligible" in response.json()["detail"].lower()


def test_update_status(client, db):
    """Recruiter can update application status."""
    student = db.query(Student).first()
    job = db.query(Job).first()

    # Create application
    resp = client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })
    app_id = resp.json()["app_id"]

    # Update status
    response = client.patch(f"/applications/{app_id}/status", json={
        "status": "SHORTLISTED"
    })
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "SHORTLISTED"


def test_audit_log(client, db):
    """Audit log records status changes."""
    student = db.query(Student).first()
    job = db.query(Job).first()

    resp = client.post("/applications/", json={
        "student_id": student.student_id,
        "job_id": job.job_id,
    })
    app_id = resp.json()["app_id"]

    # Change status
    client.patch(f"/applications/{app_id}/status", json={"status": "SHORTLISTED"})
    client.patch(f"/applications/{app_id}/status", json={"status": "SELECTED"})

    # Get audit log
    response = client.get(f"/applications/{app_id}/audit")
    assert response.status_code == status.HTTP_200_OK
    logs = response.json()
    assert len(logs) >= 1
    assert logs[0]["old_status"] == "APPLIED"
    assert logs[0]["new_status"] == "SHORTLISTED"
