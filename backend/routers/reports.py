"""
Reports router: department, company, and placement analytics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db

router = APIRouter()


@router.get("/department", response_model=list)
def department_report(db: Session = Depends(get_db)):
    """Department-wise placement report (uses v_dept_placement view)."""
    result = db.execute("SELECT * FROM v_dept_placement");
    columns = result.keys()
    return [dict(zip(columns, row)) for row in result]


@router.get("/company", response_model=list)
def company_report(db: Session = Depends(get_db)):
    """Company-wise report (uses v_company_report view)."""
    result = db.execute("SELECT * FROM v_company_report")
    columns = result.keys()
    return [dict(zip(columns, row)) for row in result]


@router.get("/package-distribution", response_model=list)
def package_distribution(db: Session = Depends(get_db)):
    """Package distribution by LPA bracket."""
    sql = """
    SELECT
        CASE
            WHEN offer_package < 5 THEN 'Below 5 LPA'
            WHEN offer_package BETWEEN 5 AND 10 THEN '5-10 LPA'
            WHEN offer_package BETWEEN 10 AND 20 THEN '10-20 LPA'
            ELSE 'Above 20 LPA'
        END AS bracket,
        COUNT(*) AS count
    FROM selection
    GROUP BY bracket
    ORDER BY MIN(offer_package)
    """
    result = db.execute(sql)
    columns = result.keys()
    return [dict(zip(columns, row)) for row in result]


@router.get("/funnel", response_model=list)
def application_funnel(db: Session = Depends(get_db)):
    """Application funnel: applied -> shortlisted -> interviewed -> selected."""
    sql = """
    SELECT status, COUNT(*) as count
    FROM application
    GROUP BY status
    ORDER BY FIELD(status, 'APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'SELECTED', 'REJECTED')
    """
    result = db.execute(sql)
    columns = result.keys()
    return [dict(zip(columns, row)) for row in result]


@router.get("/unplaced-students", response_model=list)
def unplaced_students(db: Session = Depends(get_db)):
    """Students with no offer, sorted by CGPA."""
    sql = """
    SELECT name, email, cgpa, backlogs, d.name as department
    FROM student s
    JOIN department d ON s.dept_id = d.dept_id
    WHERE is_placed = FALSE
    ORDER BY cgpa ASC, backlogs DESC
    """
    result = db.execute(sql)
    columns = result.keys()
    return [dict(zip(columns, row)) for row in result]
