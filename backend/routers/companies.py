"""
Companies router: company management (admin).
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Company, Job

router = APIRouter()


class CompanyOut(BaseModel):
    company_id: int
    name: str
    sector: str | None = None
    tier: str | None = None

    class Config:
        from_attributes = True


class CompanyCreate(BaseModel):
    name: str
    sector: str | None = None
    tier: str = "NORMAL"


@router.get("/", response_model=List[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()


@router.post("/", response_model=CompanyOut)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
):
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(Company).filter(Company.company_id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    return c


@router.put("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int,
    company: CompanyCreate,
    db: Session = Depends(get_db),
):
    c = db.query(Company).filter(Company.company_id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    c.name = company.name
    c.sector = company.sector
    c.tier = company.tier
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    c = db.query(Company).filter(Company.company_id == company_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Company not found")
    # Delete associated jobs if any
    jobs = db.query(Job).filter(Job.company_id == company_id).all()
    for j in jobs:
        db.delete(j)
    db.delete(c)
    db.commit()
    return {"message": "Company deleted successfully", "company_id": company_id}
