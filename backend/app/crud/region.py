from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.region import GeographicRegion
from app.schemas.region import RegionCreate, RegionUpdate


def get_regions(db: Session) -> List[GeographicRegion]:
    return db.query(GeographicRegion).order_by(GeographicRegion.name).all()


def get_region(db: Session, region_id: int) -> Optional[GeographicRegion]:
    return db.query(GeographicRegion).filter(GeographicRegion.id == region_id).first()


def create_region(db: Session, data: RegionCreate) -> GeographicRegion:
    region = GeographicRegion(name=data.name)
    db.add(region)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(region)
    return region


def update_region(db: Session, region_id: int, data: RegionUpdate) -> Optional[GeographicRegion]:
    region = get_region(db, region_id)
    if region is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(region, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(region)
    return region


def delete_region(db: Session, region_id: int) -> bool:
    region = get_region(db, region_id)
    if region is None:
        return False
    db.delete(region)
    db.commit()
    return True
