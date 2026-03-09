from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.models.category import ThematicCategory
from app.models.event import Event
from app.models.region import GeographicRegion
from app.models.tag import CustomTag
from app.schemas.event import EventCreate, EventUpdate


def _with_relationships(db: Session):
    """Base query that eagerly loads all M2M relationships."""
    return db.query(Event).options(
        selectinload(Event.regions),
        selectinload(Event.categories),
        selectinload(Event.tags),
    )


def get_events(
    db: Session,
    *,
    start_year: Optional[int] = None,
    end_year: Optional[int] = None,
    region_ids: Optional[List[int]] = None,
    category_ids: Optional[List[int]] = None,
    tag_ids: Optional[List[int]] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Event]:
    q = _with_relationships(db)

    # Date range — AND between the two bounds
    if start_year is not None:
        q = q.filter(Event.start_year >= start_year)
    if end_year is not None:
        q = q.filter(Event.start_year <= end_year)

    # M2M filters — OR within each type, AND between types
    if region_ids:
        q = q.filter(Event.regions.any(GeographicRegion.id.in_(region_ids)))
    if category_ids:
        q = q.filter(Event.categories.any(ThematicCategory.id.in_(category_ids)))
    if tag_ids:
        q = q.filter(Event.tags.any(CustomTag.id.in_(tag_ids)))

    # Free-text search across title and narrative (OR between fields)
    if search:
        term = f"%{search}%"
        q = q.filter(or_(Event.title.ilike(term), Event.narrative.ilike(term)))

    return q.offset(skip).limit(limit).all()


def get_event(db: Session, event_id: int) -> Optional[Event]:
    return _with_relationships(db).filter(Event.id == event_id).first()


def create_event(db: Session, data: EventCreate) -> Event:
    event = Event(**data.model_dump(exclude={"region_ids", "category_ids", "tag_ids"}))

    if data.region_ids:
        event.regions = db.query(GeographicRegion).filter(GeographicRegion.id.in_(data.region_ids)).all()
    if data.category_ids:
        event.categories = db.query(ThematicCategory).filter(ThematicCategory.id.in_(data.category_ids)).all()
    if data.tag_ids:
        event.tags = db.query(CustomTag).filter(CustomTag.id.in_(data.tag_ids)).all()

    db.add(event)
    db.commit()
    # Re-fetch through the eager-loading query so relationships are populated
    return get_event(db, event.id)  # type: ignore[return-value]


def update_event(db: Session, event_id: int, data: EventUpdate) -> Optional[Event]:
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        return None

    fields = data.model_dump(exclude_unset=True)
    region_ids = fields.pop("region_ids", None)
    category_ids = fields.pop("category_ids", None)
    tag_ids = fields.pop("tag_ids", None)

    for field, value in fields.items():
        setattr(event, field, value)

    if region_ids is not None:
        event.regions = db.query(GeographicRegion).filter(GeographicRegion.id.in_(region_ids)).all()
    if category_ids is not None:
        event.categories = db.query(ThematicCategory).filter(ThematicCategory.id.in_(category_ids)).all()
    if tag_ids is not None:
        event.tags = db.query(CustomTag).filter(CustomTag.id.in_(tag_ids)).all()

    db.commit()
    return get_event(db, event_id)


def delete_event(db: Session, event_id: int) -> bool:
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        return False
    db.delete(event)
    db.commit()
    return True
