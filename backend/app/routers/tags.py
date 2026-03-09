from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud import tag as crud
from app.database import get_db
from app.schemas.tag import TagCreate, TagOut, TagUpdate

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("/", response_model=List[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return crud.get_tags(db)


@router.post("/", response_model=TagOut, status_code=201)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_tag(db, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Tag '{data.name}' already exists")


@router.get("/{tag_id}", response_model=TagOut)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = crud.get_tag(db, tag_id)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.put("/{tag_id}", response_model=TagOut)
def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    try:
        tag = crud.update_tag(db, tag_id, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Tag '{data.name}' already exists")
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete("/{tag_id}", status_code=204)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    if not crud.delete_tag(db, tag_id):
        raise HTTPException(status_code=404, detail="Tag not found")
