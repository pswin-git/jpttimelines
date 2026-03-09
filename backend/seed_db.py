"""Seed starter geographic regions and thematic categories.

Only inserts if the respective table is empty.

Usage (from backend/):
    .venv/Scripts/python seed_db.py
"""

from app.database import SessionLocal
from app.models.category import ThematicCategory
from app.models.region import GeographicRegion

REGIONS = [
    "Mesopotamia / Fertile Crescent",
    "Egypt / North Africa",
    "Sub-Saharan Africa",
    "Mediterranean / Classical World",
    "Western Europe",
    "Eastern Europe / Byzantium",
    "Central Asia / Steppe",
    "South Asia",
    "East Asia",
    "Southeast Asia",
    "Mesoamerica / South America",
    "North America",
    "Middle East / Islamic World",
    "Oceania / Pacific",
]

CATEGORIES = [
    "Political / Governance",
    "Military / Conflict",
    "Economic / Trade",
    "Religious / Philosophical",
    "Scientific / Technological",
    "Cultural / Artistic",
    "Demographic / Migration",
    "Legal / Institutional",
    "Environmental / Geographic",
    "Exploration / Discovery",
]


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(GeographicRegion).count() == 0:
            db.add_all(GeographicRegion(name=n) for n in REGIONS)
            db.commit()
            print(f"Seeded {len(REGIONS)} geographic regions.")
        else:
            print("Geographic regions table not empty — skipping.")

        if db.query(ThematicCategory).count() == 0:
            db.add_all(ThematicCategory(name=n) for n in CATEGORIES)
            db.commit()
            print(f"Seeded {len(CATEGORIES)} thematic categories.")
        else:
            print("Thematic categories table not empty — skipping.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
