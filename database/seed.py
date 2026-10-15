"""
Placement Management System - Seed Data Generator
Generates 200 students, 15 companies, 40 jobs with Faker.

Usage:
    pip install faker
    python seed.py
"""
import random
from faker import Faker

fake = Faker()

# Departments
departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Information Technology",
    "Biotechnology"
]

# Company data
company_names = [
    ("TechCorp", "Software", "DREAM"),
    ("DataMasters", "Analytics", "DREAM"),
    ("InnovateX", "Tech", "SUPER_DREAM"),
    ("BuildRight", "Construction", "NORMAL"),
    ("MediCore", "Healthcare", "SUPER_DREAM"),
    ("FinEdge", "Finance", "NORMAL"),
    ("EduSmart", "EdTech", "NORMAL"),
    ("CloudNine", "Cloud", "SUPER_DREAM"),
    ("CodeCrafters", "Software", "SUPER_DREAM"),
    ("AutoMotive Inc", "Automotive", "NORMAL"),
    ("PharmaTech", "Pharmaceuticals", "NORMAL"),
    ("AeroSpace Ltd", "Aerospace", "DREAM"),
    ("RetailPro", "E-commerce", "NORMAL"),
    ("GreenEnergy", "Renewable Energy", "SUPER_DREAM"),
    ("HealthPlus", "Healthcare IT", "NORMAL"),
]

skills_pool = {
    "CSE": ["Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", "Go", "Rust", "Docker", "Kubernetes", "AWS"],
    "ECE": ["Embedded C", "IoT", "Verilog", "Matlab", "Signal Processing", "Python", "C++"],
    "ME": ["SolidWorks", "AutoCAD", "CATIA", "C", "Thermodynamics", "Manufacturing"],
    "CE": ["AutoCAD", "STAAD", "Civil 3D", "Structural Analysis", "Construction"],
    "IT": ["Python", "SQL", "Networking", "Cybersecurity", "Java", "Machine Learning"],
    "BT": ["Biotech", "Python", "Matlab", "Genetics", "Bioinformatics"],
}

dept_keys = list(skills_pool.keys())


def generate_students(n=200):
    """Generate n student records."""
    students = []
    for i in range(n):
        dept_code = random.choice(dept_keys)
        dept_idx = dept_keys.index(dept_code) + 1  # 1-based for FK
        name = fake.name()
        email = f"{name.lower().replace(' ', '.')}@student.edu"
        cgpa = round(random.uniform(6.0, 9.8), 2)
        backlogs = random.choices([0, 1, 2, 3, 4], weights=[50, 25, 15, 7, 3])[0]
        skills = ", ".join(random.sample(skills_pool[dept_code], k=random.randint(2, 5)))
        students.append({
            "student_id": i + 1,
            "name": name,
            "email": email,
            "dept_id": dept_idx,
            "cgpa": cgpa,
            "backlogs": backlogs,
            "skills": skills,
            "is_placed": False,
        })
    return students


def generate_companies(n=15):
    """Generate n company records."""
    companies = []
    for i, (name, sector, tier) in enumerate(company_names):
        companies.append({
            "company_id": i + 1,
            "name": name,
            "sector": sector,
            "tier": tier,
        })
    return companies


def generate_jobs(n=40):
    """Generate n job records tied to companies."""
    jobs = []
    for i in range(n):
        company_idx = (i % 15) + 1  # cycle through companies
        job_title_templates = [
            f"Senior {'Engineer' if i % 2 else 'Analyst'}",
            f"Junior Developer",
            f"Data {random.choice(['Scientist', 'Analyst', 'Engineer'])}",
            f"Systems {random.choice(['Architect', 'Engineer'])}",
            f"Product {random.choice(['Manager', 'Engineer'])}",
        ]
        title = random.choice(job_title_templates)

        # Assign a tier based on package
        tier = random.choices(["DREAM", "SUPER_DREAM", "NORMAL"], weights=[15, 35, 50])[0]

        if tier == "DREAM":
            package = round(random.uniform(18.0, 35.0), 2)
            min_cgpa = round(random.uniform(8.0, 9.0), 2)
            max_backlogs = 0
        elif tier == "SUPER_DREAM":
            package = round(random.uniform(10.0, 18.0), 2)
            min_cgpa = round(random.uniform(7.0, 8.0), 2)
            max_backlogs = random.choice([0, 1])
        else:
            package = round(random.uniform(4.0, 10.0), 2)
            min_cgpa = round(random.uniform(6.0, 7.5), 2)
            max_backlogs = random.randint(0, 3)

        # Deadline spread across next 2 months
        deadline = fake.date_between(start_date="+30d", end_date="+90d")

        jobs.append({
            "job_id": i + 1,
            "company_id": company_idx,
            "title": title,
            "package_lpa": package,
            "min_cgpa": min_cgpa,
            "max_backlogs": max_backlogs,
            "deadline": str(deadline),
            "tier": tier,
        })
    return jobs


def generate_job_eligible_depts(jobs):
    """Generate eligible departments for each job (mix of departments)."""
    eligible = []
    for job in jobs:
        # Each job is eligible for 2-4 departments
        num_depts = random.randint(2, 4)
        chosen_depts = random.sample(range(1, len(departments) + 1), num_depts)
        for dept_id in chosen_depts:
            eligible.append({"job_id": job["job_id"], "dept_id": dept_id})
    return eligible


def generate_sql():
    """Generate complete SQL seed file."""
    students = generate_students(200)
    companies = generate_companies(15)
    jobs = generate_jobs(40)
    eligible_depts = generate_job_eligible_depts(jobs)

    lines = ["USE placement_system;", ""]

    # Departments
    lines.append("-- Departments")
    lines.append("INSERT INTO department (name) VALUES")
    for i, dept in enumerate(departments):
        lines.append(f"  ('{dept}')" + (";" if i == len(departments) - 1 else ","))
    lines.append("")

    # Companies
    lines.append("-- Companies")
    lines.append("INSERT INTO company (name, sector, tier) VALUES")
    for i, c in enumerate(companies):
        lines.append(f"  ('{c['name']}', '{c['sector']}', '{c['tier']}')" + (";" if i == len(companies) - 1 else ","))
    lines.append("")

    # Jobs
    lines.append("-- Jobs")
    lines.append("INSERT INTO job (company_id, title, package_lpa, min_cgpa, max_backlogs, deadline, tier) VALUES")
    for i, j in enumerate(jobs):
        lines.append(
            f"  ({j['company_id']}, '{j['title']}', {j['package_lpa']}, "
            f"{j['min_cgpa']}, {j['max_backlogs']}, '{j['deadline']}', '{j['tier']}')"
            + (";" if i == len(jobs) - 1 else ",")
        )
    lines.append("")

    # Job eligible departments
    lines.append("-- Job Eligible Departments")
    lines.append("INSERT INTO job_eligible_dept (job_id, dept_id) VALUES")
    for i, e in enumerate(eligible_depts):
        lines.append(f"  ({e['job_id']}, {e['dept_id']})" + (";" if i == len(eligible_depts) - 1 else ","))
    lines.append("")

    # Students
    lines.append("-- Students (200)")
    lines.append("INSERT INTO student (name, email, dept_id, cgpa, backlogs, skills, is_placed) VALUES")
    for i, s in enumerate(students):
        lines.append(
            f"  ('{s['name']}', '{s['email']}', {s['dept_id']}, {s['cgpa']}, "
            f"{s['backlogs']}, '{s['skills']}', FALSE)"
            + (";" if i == len(students) - 1 else ",")
        )
    lines.append("")

    # Users
    lines.append("-- Users (for auth)")
    lines.append("INSERT INTO users (email, password_hash, role, ref_id) VALUES")
    lines.append("  ('admin@placement.edu', '$2b$12$placeholder_admin_hash', 'admin', NULL),")
    lines.append("  ('recruiter@company.edu', '$2b$12$placeholder_recruiter_hash', 'recruiter', 1),")
    lines.append("  ('student@student.edu', '$2b$12$placeholder_student_hash', 'student', 1);")

    return "\n".join(lines)


if __name__ == "__main__":
    sql = generate_sql()
    print(sql)
    # Also write to file
    with open("seed_generated.sql", "w") as f:
        f.write(sql)
    print("\n-- Written to seed_generated.sql", file=__import__('sys').stderr)