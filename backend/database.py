"""
Database connection using SQLAlchemy with smart fallback.
If MySQL is unavailable or misconfigured, it automatically falls back
to a local SQLite database (placement.db) and creates all schema tables.
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DEFAULT_MYSQL = "mysql+pymysql://root@localhost:3306/placement_system"
DEFAULT_ORACLE = "oracle+oracledb://placement:placement123@localhost:1521/?service_name=XEPDB1"
DB_URL = os.environ.get("DB_URL", "").strip()

engine = None


def get_sqlite_engine():
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "placement.db")
    sqlite_url = f"sqlite:///{db_path}"
    return create_engine(sqlite_url, connect_args={"check_same_thread": False})


# 1. If explicitly configured with Oracle
if DB_URL.startswith("oracle"):
    try:
        candidate_engine = create_engine(DB_URL)
        with candidate_engine.connect() as conn:
            pass
        engine = candidate_engine
        print(f"[Database] Successfully connected to Oracle Database.")
    except Exception as e:
        print(f"[Database] Oracle connection failed ({e}). Falling back to local SQLite database.")
        engine = get_sqlite_engine()

# 2. If configured with MySQL or default
elif DB_URL.startswith("mysql") or not DB_URL:
    mysql_target = DB_URL if DB_URL else DEFAULT_MYSQL
    try:
        candidate_engine = create_engine(mysql_target, connect_args={"connect_timeout": 2})
        with candidate_engine.connect() as conn:
            pass
        engine = candidate_engine
        print("[Database] Successfully connected to MySQL server.")
    except Exception as e:
        print(f"[Database] MySQL connection failed ({e}). Falling back to local SQLite database.")
        engine = get_sqlite_engine()

# 3. Any other direct URL (SQLite, Postgres, etc.)
else:
    engine = create_engine(DB_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency: provide a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

