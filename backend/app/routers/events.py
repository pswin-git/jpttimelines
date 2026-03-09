from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.crud import event as crud
from app.database import get_db
from app.schemas.event import EventCreate, EventOut, EventUpdate

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[EventOut])
def list_events(
    start_year: Optional[int] = Query(None, description="Filter events starting on or after this year"),
    end_year: Optional[int] = Query(None, description="Filter events starting on or before this year"),
    region_ids: Optional[List[int]] = Query(None, description="OR filter: include events in any of these regions"),
    category_ids: Optional[List[int]] = Query(None, description="OR filter: include events in any of these categories"),
    tag_ids: Optional[List[int]] = Query(None, description="OR filter: include events with any of these tags"),
    search: Optional[str] = Query(None, description="Full-text search against title and narrative"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return crud.get_events(
        db,
        start_year=start_year,
        end_year=end_year,
        region_ids=region_ids,
        category_ids=category_ids,
        tag_ids=tag_ids,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.post("/", response_model=EventOut, status_code=201)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    return crud.create_event(db, data)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud.get_event(db, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db)):
    event = crud.update_event(db, event_id, data)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db)):
    if not crud.delete_event(db, event_id):
        raise HTTPException(status_code=404, detail="Event not found")
