"""
Placement Management System - FastAPI Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from routers import auth, students, companies, jobs, applications, reports, os_lab
except ImportError:
    from backend.routers import auth, students, companies, jobs, applications, reports, os_lab



app = FastAPI(
    title="Placement Management System API",
    description="API for student placements, company jobs, and OS lab simulations",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(companies.router, prefix="/companies", tags=["companies"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(applications.router, prefix="/applications", tags=["applications"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(os_lab.router, prefix="/oslab", tags=["oslab"])


@app.on_event("startup")
def startup_db_init():
    """Ensure database tables exist and seed demo records if database is fresh."""
    try:
        from backend.database import engine, SessionLocal
        import backend.models as models
        from backend.auth import get_password_hash
        import datetime

        models.Base.metadata.create_all(bind=engine)


        db = SessionLocal()
        # Seed initial departments if empty
        if db.query(models.Department).count() == 0:

            dept_cs = models.Department(name="Computer Science & Engineering")
            dept_it = models.Department(name="Information Technology")
            dept_ec = models.Department(name="Electronics & Communication")
            dept_me = models.Department(name="Mechanical Engineering")
            db.add_all([dept_cs, dept_it, dept_ec, dept_me])
            db.commit()

            # Seed demo Admin
            admin_user = models.User(
                email="admin@placement.edu",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            db.commit()

            # Seed demo Student
            stu = models.Student(
                name="Rahul Sharma",
                email="rahul@college.edu",
                dept_id=dept_cs.dept_id,
                cgpa=8.95,
                backlogs=0,
                skills="Python, React, MySQL, Data Structures, FastAPI",
                is_placed=False
            )
            db.add(stu)
            db.commit()

            student_user = models.User(
                email="rahul@college.edu",
                password_hash=get_password_hash("student123"),
                role="student",
                ref_id=stu.student_id
            )
            db.add(student_user)
            db.commit()

            # Seed demo Companies
            comp1 = models.Company(name="Google", sector="Software", tier="DREAM")
            comp2 = models.Company(name="Microsoft", sector="Software", tier="DREAM")
            comp3 = models.Company(name="TCS Digital", sector="IT Services", tier="MASS")
            db.add_all([comp1, comp2, comp3])
            db.commit()

            # Seed demo Jobs
            job1 = models.Job(
                company_id=comp1.company_id,
                title="Software Development Engineer - 1",
                package_lpa=32.50,
                min_cgpa=8.00,
                max_backlogs=0,
                deadline=datetime.date.today() + datetime.timedelta(days=30),
                tier="DREAM"
            )
            job2 = models.Job(
                company_id=comp2.company_id,
                title="Cloud Solutions Engineer",
                package_lpa=28.00,
                min_cgpa=7.50,
                max_backlogs=0,
                deadline=datetime.date.today() + datetime.timedelta(days=25),
                tier="DREAM"
            )
            job3 = models.Job(
                company_id=comp3.company_id,
                title="Systems Associate",
                package_lpa=7.50,
                min_cgpa=6.50,
                max_backlogs=1,
                deadline=datetime.date.today() + datetime.timedelta(days=45),
                tier="MASS"
            )
            db.add_all([job1, job2, job3])
            db.commit()

            # Link eligible departments
            db.add_all([
                models.JobEligibleDept(job_id=job1.job_id, dept_id=dept_cs.dept_id),
                models.JobEligibleDept(job_id=job1.job_id, dept_id=dept_it.dept_id),
                models.JobEligibleDept(job_id=job2.job_id, dept_id=dept_cs.dept_id),
                models.JobEligibleDept(job_id=job2.job_id, dept_id=dept_ec.dept_id),
                models.JobEligibleDept(job_id=job3.job_id, dept_id=dept_cs.dept_id),
                models.JobEligibleDept(job_id=job3.job_id, dept_id=dept_it.dept_id),
                models.JobEligibleDept(job_id=job3.job_id, dept_id=dept_ec.dept_id),
                models.JobEligibleDept(job_id=job3.job_id, dept_id=dept_me.dept_id),
            ])
            db.commit()
            print("[Database] Schema verified and starter demo records seeded successfully.")
        db.close()
    except Exception as e:
        print(f"[Database] Startup schema init warning: {e}")



@app.get("/")
def root():
    return {"message": "Placement Management System API is running"}



@app.get("/health")
def health_check():
    return {"status": "healthy"}
