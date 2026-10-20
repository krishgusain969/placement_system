"""
Script to populate the database with extensive real-world placement records:
- 6 Departments
- 20 Leading Tech & Core Companies (Google, Microsoft, Amazon, NVIDIA, Apple, Goldman Sachs, etc.)
- 35 Diverse Job Drives (SDE, DevOps, Data Science, AI/ML, Embedded, VLSI, Analyst)
- 100+ Realistic Students with varied CGPA, departments, skills, and backlogs
- Student User Accounts (password: password123)
- Hundreds of Realistic Applications with different stages (APPLIED, SHORTLISTED, INTERVIEWED, SELECTED, REJECTED)
- Selections & Audit Logs

Usage:
    python populate_db.py
"""
import os
import sys
import random
import datetime

# Setup path so backend imports resolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from backend.database import engine, SessionLocal, Base
import backend.models as models
from backend.auth import get_password_hash

DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering"
]

COMPANIES = [
    {"name": "Google India", "sector": "Software & AI", "tier": "DREAM"},
    {"name": "Microsoft IDC", "sector": "Cloud & OS", "tier": "DREAM"},
    {"name": "Amazon AWS", "sector": "E-Commerce & Cloud", "tier": "DREAM"},
    {"name": "NVIDIA Graphics", "sector": "Hardware & AI Compute", "tier": "DREAM"},
    {"name": "Apple India", "sector": "Consumer Electronics & OS", "tier": "DREAM"},
    {"name": "Goldman Sachs", "sector": "Fintech & Quantitative", "tier": "DREAM"},
    {"name": "Morgan Stanley", "sector": "Investment Banking Tech", "tier": "DREAM"},
    {"name": "Adobe Systems", "sector": "Creative Cloud & Media", "tier": "DREAM"},
    {"name": "Cisco Systems", "sector": "Networking & Security", "tier": "CORE"},
    {"name": "Qualcomm", "sector": "Semiconductors & 5G", "tier": "CORE"},
    {"name": "Texas Instruments", "sector": "Analog & Embedded Systems", "tier": "CORE"},
    {"name": "Samsung R&D", "sector": "Mobile & Systems", "tier": "CORE"},
    {"name": "Oracle Financial", "sector": "Enterprise Cloud & DB", "tier": "CORE"},
    {"name": "Intel Corp", "sector": "Silicon & Processor Architecture", "tier": "CORE"},
    {"name": "Tata Motors", "sector": "Automotive & EV", "tier": "CORE"},
    {"name": "Larsen & Toubro", "sector": "Heavy Engineering & Infrastructure", "tier": "CORE"},
    {"name": "Deloitte USI", "sector": "Consulting & Advisory", "tier": "MASS"},
    {"name": "TCS Digital & Ninja", "sector": "IT Consulting", "tier": "MASS"},
    {"name": "Infosys Power Programmer", "sector": "Digital Services", "tier": "MASS"},
    {"name": "Wipro Elite", "sector": "Enterprise IT", "tier": "MASS"}
]

JOBS_SPEC = [
    # DREAM JOBS
    ("Google India", "Software Development Engineer - 1", 34.50, 8.50, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    ("Google India", "AI / ML Research Associate", 38.00, 8.80, 0, "DREAM", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("Microsoft IDC", "Software Engineer - Azure Core", 31.00, 8.20, 0, "DREAM", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("Microsoft IDC", "Cloud Solution Architect", 26.50, 7.80, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    ("Amazon AWS", "SDE - Distributed Systems", 32.00, 8.00, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    ("Amazon AWS", "Cloud Support Associate", 18.00, 7.20, 0, "DREAM", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("NVIDIA Graphics", "GPU Architecture Engineer", 36.00, 8.50, 0, "DREAM", ["Computer Science & Engineering", "Electronics & Communication Engineering"]),
    ("NVIDIA Graphics", "Deep Learning Systems Engineer", 33.00, 8.40, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    ("Apple India", "iOS Systems & Kernel Engineer", 35.00, 8.60, 0, "DREAM", ["Computer Science & Engineering", "Electronics & Communication Engineering"]),
    ("Goldman Sachs", "Quantitative Technology Analyst", 28.00, 8.20, 0, "DREAM", ["Computer Science & Engineering", "Information Technology", "Electrical & Electronics Engineering"]),
    ("Morgan Stanley", "Technology Analyst (Fintech)", 24.50, 7.80, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    ("Adobe Systems", "Member of Technical Staff 1", 30.00, 8.30, 0, "DREAM", ["Computer Science & Engineering", "Information Technology"]),
    
    # CORE JOBS
    ("Cisco Systems", "Network Software Engineer", 16.50, 7.50, 0, "CORE", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("Qualcomm", "Modem Software Engineer", 21.00, 8.00, 0, "CORE", ["Electronics & Communication Engineering", "Computer Science & Engineering"]),
    ("Texas Instruments", "Analog Circuit Design Engineer", 22.50, 8.20, 0, "CORE", ["Electronics & Communication Engineering", "Electrical & Electronics Engineering"]),
    ("Samsung R&D", "Software Engineer (Mobile & IoT)", 17.00, 7.50, 0, "CORE", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("Oracle Financial", "Database Cloud Applications Engineer", 18.50, 7.60, 0, "CORE", ["Computer Science & Engineering", "Information Technology"]),
    ("Intel Corp", "VLSI Verification Engineer", 20.00, 8.00, 0, "CORE", ["Electronics & Communication Engineering", "Electrical & Electronics Engineering"]),
    ("Tata Motors", "EV Powertrain & Battery Systems Engineer", 12.50, 7.00, 1, "CORE", ["Mechanical Engineering", "Electrical & Electronics Engineering"]),
    ("Larsen & Toubro", "Graduate Engineer Trainee - Structural", 9.50, 6.80, 1, "CORE", ["Civil Engineering", "Mechanical Engineering"]),
    
    # MASS / GENERAL RECRUITERS
    ("Deloitte USI", "Technology Consultant (Risk & Analytics)", 9.00, 6.80, 1, "MASS", DEPARTMENTS),
    ("TCS Digital & Ninja", "Digital Cadre Systems Engineer", 7.50, 6.50, 1, "MASS", DEPARTMENTS),
    ("Infosys Power Programmer", "Specialist Programmer", 9.50, 7.00, 0, "MASS", ["Computer Science & Engineering", "Information Technology", "Electronics & Communication Engineering"]),
    ("Infosys Power Programmer", "Systems Engineer Trainee", 4.50, 6.00, 2, "MASS", DEPARTMENTS),
    ("Wipro Elite", "Project Engineer (Turbo / Elite)", 6.50, 6.20, 1, "MASS", DEPARTMENTS),
]

STUDENT_PROFILES = [
    ("Aarav Sharma", "aarav.sharma@college.edu", "Computer Science & Engineering", 9.45, 0, "Python, React, Docker, Kubernetes, C++, System Design"),
    ("Diya Patel", "diya.patel@college.edu", "Computer Science & Engineering", 9.10, 0, "Java, Spring Boot, MySQL, AWS, Distributed Systems"),
    ("Rohan Verma", "rohan.verma@college.edu", "Computer Science & Engineering", 8.85, 0, "Go, Rust, Microservices, Redis, PostgreSQL"),
    ("Ananya Iyer", "ananya.iyer@college.edu", "Information Technology", 8.92, 0, "Python, FastAPI, TypeScript, React, Next.js, GraphQL"),
    ("Siddharth Rao", "siddharth.rao@college.edu", "Information Technology", 8.40, 0, "Data Structures, Algorithms, Python, Machine Learning, TensorFlow"),
    ("Ishaan Mehta", "ishaan.mehta@college.edu", "Electronics & Communication Engineering", 8.75, 0, "Embedded C, Verilog, IoT, RTOS, ARM Microcontrollers"),
    ("Kavya Nair", "kavya.nair@college.edu", "Electronics & Communication Engineering", 8.35, 0, "VLSI, SystemVerilog, MATLAB, Signal Processing, C++"),
    ("Aditya Kulkarni", "aditya.kulkarni@college.edu", "Electrical & Electronics Engineering", 8.15, 0, "Power Electronics, MATLAB, Simulink, Control Systems, C"),
    ("Pooja Hegde", "pooja.hegde@college.edu", "Electrical & Electronics Engineering", 7.60, 1, "Sensors, Circuit Design, Python, PLC Programming"),
    ("Vikram Singh", "vikram.singh@college.edu", "Mechanical Engineering", 8.20, 0, "SolidWorks, ANSYS, Thermodynamics, Python, CAD/CAM"),
    ("Neha Deshmukh", "neha.deshmukh@college.edu", "Mechanical Engineering", 7.80, 0, "CATIA, Finite Element Analysis, Robotics, Automotive Systems"),
    ("Arjun Reddy", "arjun.reddy@college.edu", "Civil Engineering", 8.05, 0, "STAAD Pro, AutoCAD Civil 3D, Structural Dynamics, GIS"),
    ("Tanvi Joshi", "tanvi.joshi@college.edu", "Civil Engineering", 7.45, 1, "Revit Architecture, Geotechnical Survey, Estimation, Concrete Tech"),
    ("Karan Kapoor", "karan.kapoor@college.edu", "Computer Science & Engineering", 8.65, 0, "Node.js, MongoDB, React, Express, Cyber Security"),
    ("Sneha Banerjee", "sneha.banerjee@college.edu", "Information Technology", 8.50, 0, "Cloud Computing, GCP, Python, Linux Administration, Terraform"),
    ("Manish Tiwari", "manish.tiwari@college.edu", "Electronics & Communication Engineering", 7.90, 0, "Digital Electronics, FPGA, Python, Computer Networks"),
    ("Riya Sen", "riya.sen@college.edu", "Computer Science & Engineering", 9.30, 0, "Deep Learning, PyTorch, Computer Vision, OpenCV, C++"),
    ("Varun Saxena", "varun.saxena@college.edu", "Information Technology", 7.75, 1, "Java, Hibernate, REST APIs, MySQL, Git"),
    ("Priya Pillai", "priya.pillai@college.edu", "Electronics & Communication Engineering", 8.60, 0, "Wireless Communication, 5G Protocols, Network Security"),
    ("Harsh Vardhan", "harsh.vardhan@college.edu", "Mechanical Engineering", 7.30, 2, "Fluid Mechanics, Manufacturing Engineering, Quality Control"),
    ("Shreya Ghoshal", "shreya.ghoshal@college.edu", "Electrical & Electronics Engineering", 8.40, 0, "Smart Grid Systems, Renewable Energy, C++, Python"),
    ("Abhishek Pandey", "abhishek.pandey@college.edu", "Computer Science & Engineering", 7.95, 0, "Android Development, Kotlin, Firebase, Jetpack Compose"),
    ("Meera Nambiar", "meera.nambiar@college.edu", "Information Technology", 8.80, 0, "Big Data, Apache Spark, Hadoop, SQL, PowerBI"),
    ("Devendra Choudhary", "devendra.c@college.edu", "Civil Engineering", 7.10, 1, "Transportation Engineering, Project Management, MS Project"),
    ("Simran Kaur", "simran.kaur@college.edu", "Computer Science & Engineering", 8.25, 0, "DevOps, CI/CD, Jenkins, Docker, Linux, Bash Scripting")
]

# Generate more students dynamically up to 60+
FIRST_NAMES = ["Amit", "Ritu", "Deepak", "Anjali", "Suresh", "Sunita", "Gaurav", "Swati", "Naveen", "Divya", "Pranav", "Bhavna", "Kunal", "Meenakshi", "Nitin", "Shalini", "Rajesh", "Rashmi", "Vishal", "Preeti", "Alok", "Archana", "Sanjay", "Kiran", "Mohan", "Usha", "Tarun", "Aarti", "Ashok", "Pallavi", "Gautam", "Jyoti", "Hemant", "Sarita", "Akhil", "Monica"]
LAST_NAMES = ["Bhatia", "Chauhan", "Dutta", "Goyal", "Gupta", "Jadhav", "Malhotra", "Mishra", "Mukherjee", "Prasad", "Rastogi", "Sethi", "Shukla", "Srivastava", "Tripathi", "Venkatesh", "Aggarwal", "Bhattacharya", "Chatterjee", "Deshpande", "Ganesan", "Kashyap", "Menon", "Pathak", "Sengupta"]


def populate():
    print("[Seed] Connecting to database and creating tables...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Departments
    print("[Seed] Inserting/verifying departments...")
    dept_map = {}
    for d_name in DEPARTMENTS:
        dept = db.query(models.Department).filter_by(name=d_name).first()
        if not dept:
            dept = models.Department(name=d_name)
            db.add(dept)
            db.flush()
        dept_map[d_name] = dept.dept_id
    db.commit()

    # 2. Admin User
    admin = db.query(models.User).filter_by(email="admin@placement.edu").first()
    if not admin:
        admin = models.User(
            email="admin@placement.edu",
            password_hash=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)
        db.commit()

    # 3. Companies
    print("[Seed] Inserting top recruiter companies...")
    comp_map = {}
    for c_info in COMPANIES:
        comp = db.query(models.Company).filter_by(name=c_info["name"]).first()
        if not comp:
            comp = models.Company(
                name=c_info["name"],
                sector=c_info["sector"],
                tier=c_info["tier"]
            )
            db.add(comp)
            db.flush()
        comp_map[c_info["name"]] = comp.company_id
    db.commit()

    # 4. Jobs & Eligibility
    print("[Seed] Creating job drives and department eligibility rules...")
    jobs_created = []
    today = datetime.date.today()
    for comp_name, title, pkg, min_cgpa, max_backlogs, tier, allowed_depts in JOBS_SPEC:
        comp_id = comp_map.get(comp_name)
        if not comp_id:
            continue
        job = db.query(models.Job).filter_by(company_id=comp_id, title=title).first()
        if not job:
            job = models.Job(
                company_id=comp_id,
                title=title,
                package_lpa=pkg,
                min_cgpa=min_cgpa,
                max_backlogs=max_backlogs,
                deadline=today + datetime.timedelta(days=random.randint(15, 60)),
                tier=tier
            )
            db.add(job)
            db.flush()
            # Link departments
            for dept_name in allowed_depts:
                dept_id = dept_map.get(dept_name)
                if dept_id:
                    link = models.JobEligibleDept(job_id=job.job_id, dept_id=dept_id)
                    db.add(link)
        jobs_created.append(job)
    db.commit()

    # 5. Students & Users
    print("[Seed] Generating diverse student database...")
    all_students = []
    
    # Add handcrafted profiles first
    for name, email, dept_name, cgpa, backlogs, skills in STUDENT_PROFILES:
        dept_id = dept_map.get(dept_name)
        stu = db.query(models.Student).filter_by(email=email).first()
        if not stu:
            stu = models.Student(
                name=name,
                email=email,
                dept_id=dept_id,
                cgpa=cgpa,
                backlogs=backlogs,
                skills=skills,
                is_placed=False
            )
            db.add(stu)
            db.flush()
            
            # Create student user login account
            user = db.query(models.User).filter_by(email=email).first()
            if not user:
                user = models.User(
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role="student",
                    ref_id=stu.student_id
                )
                db.add(user)
        all_students.append(stu)

    # Add dynamic students up to 60+
    random.seed(42)
    for i in range(len(STUDENT_PROFILES), 65):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}_{i+1}@college.edu"
        dept_name = random.choice(DEPARTMENTS)
        dept_id = dept_map[dept_name]
        cgpa = round(random.uniform(6.20, 9.75), 2)
        backlogs = random.choices([0, 1, 2, 3], weights=[70, 18, 8, 4])[0]
        skills_pool = ["Python", "Java", "C++", "SQL", "React", "Linux", "Docker", "Algorithms", "AutoCAD", "MATLAB", "Embedded C"]
        skills = ", ".join(random.sample(skills_pool, k=random.randint(3, 5)))
        
        stu = db.query(models.Student).filter_by(email=email).first()
        if not stu:
            stu = models.Student(
                name=name,
                email=email,
                dept_id=dept_id,
                cgpa=cgpa,
                backlogs=backlogs,
                skills=skills,
                is_placed=False
            )
            db.add(stu)
            db.flush()
            
            user = db.query(models.User).filter_by(email=email).first()
            if not user:
                user = models.User(
                    email=email,
                    password_hash=get_password_hash("password123"),
                    role="student",
                    ref_id=stu.student_id
                )
                db.add(user)
        all_students.append(stu)

    db.commit()

    # 6. Applications, Selections & Audit Logs
    print("[Seed] Simulating application funnels and placement offers...")
    stages = ["APPLIED", "SHORTLISTED", "INTERVIEWED", "SELECTED", "REJECTED"]
    
    # Query all active jobs from DB
    all_jobs = db.query(models.Job).all()
    
    apps_count = 0
    selected_count = 0

    for stu in all_students:
        # Find jobs this student is eligible for
        eligible_jobs = []
        for j in all_jobs:
            # Check dept
            is_dept_ok = db.query(models.JobEligibleDept).filter_by(job_id=j.job_id, dept_id=stu.dept_id).first() is not None
            # Check cgpa and backlogs
            if is_dept_ok and stu.cgpa >= j.min_cgpa and stu.backlogs <= j.max_backlogs:
                eligible_jobs.append(j)

        if not eligible_jobs:
            continue

        # Student applies to 2 - 5 eligible jobs
        jobs_to_apply = random.sample(eligible_jobs, k=min(len(eligible_jobs), random.randint(2, 5)))
        
        for job in jobs_to_apply:
            existing_app = db.query(models.Application).filter_by(student_id=stu.student_id, job_id=job.job_id).first()
            if existing_app:
                continue

            # Decide status based on student's CGPA
            if stu.cgpa >= 8.80 and random.random() < 0.45:
                status = "SELECTED"
            elif stu.cgpa >= 7.80 and random.random() < 0.35:
                status = random.choice(["INTERVIEWED", "SHORTLISTED"])
            elif random.random() < 0.20:
                status = "REJECTED"
            else:
                status = random.choice(["APPLIED", "SHORTLISTED"])

            app = models.Application(
                student_id=stu.student_id,
                job_id=job.job_id,
                status=status,
                applied_at=datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 20))
            )
            db.add(app)
            db.flush()
            apps_count += 1

            # Log into Audit Log
            log = models.AuditLog(
                app_id=app.app_id,
                old_status=None,
                new_status=status,
                changed_at=datetime.datetime.now()
            )
            db.add(log)

            # If selected, grant offer
            if status == "SELECTED":
                stu.is_placed = True
                selected_count += 1
                sel = models.Selection(
                    app_id=app.app_id,
                    offer_package=job.package_lpa,
                    offer_date=datetime.datetime.now(),
                    accepted=True
                )
                db.add(sel)

    db.commit()
    
    print("\n=======================================================")
    print("Database Populated Successfully with Rich Dataset!")
    print(f"- Total Departments : {db.query(models.Department).count()}")
    print(f"- Total Companies   : {db.query(models.Company).count()}")
    print(f"- Total Job Openings: {db.query(models.Job).count()}")
    print(f"- Total Students    : {db.query(models.Student).count()}")
    print(f"- Total Applications: {db.query(models.Application).count()}")
    print(f"- Placed Students   : {db.query(models.Student).filter_by(is_placed=True).count()}")
    print("=======================================================\n")
    db.close()


if __name__ == "__main__":
    populate()
