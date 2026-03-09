from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.crud import region as crud
from app.database import get_db
from app.schemas.region import RegionCreate, RegionOut, RegionUpdate

router = APIRouter(prefix="/regions", tags=["regions"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=List[RegionOut])
def list_regions(db: Session = Depends(get_db)):
    return crud.get_regions(db)


@router.post("/", response_model=RegionOut, status_code=201)
def create_region(data: RegionCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_region(db, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Region '{data.name}' already exists")


@router.get("/{region_id}", response_model=RegionOut)
def get_region(region_id: int, db: Session = Depends(get_db)):
    region = crud.get_region(db, region_id)
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@router.put("/{region_id}", response_model=RegionOut)
def update_region(region_id: int, data: RegionUpdate, db: Session = Depends(get_db)):
    try:
        region = crud.update_region(db, region_id, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Region '{data.name}' already exists")
    if region is None:
        raise HTTPException(status_code=404, detail="Region not found")
    return region


@router.delete("/{region_id}", status_code=204)
def delete_region(region_id: int, db: Session = Depends(get_db)):
    if not crud.delete_region(db, region_id):
        raise HTTPException(status_code=404, detail="Region not found")
