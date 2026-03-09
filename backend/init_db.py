"""Run this script once to create all database tables.

Usage (from backend/):
    .venv/Scripts/python init_db.py
"""

from app.database import engine
from app.models import Base  # noqa: F401 — imports all models, registering them with metadata


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    print("All tables created successfully.")


if __name__ == "__main__":
    init_db()
