from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.crud import category as crud
from app.database import get_db
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.post("/", response_model=CategoryOut, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_category(db, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Category '{data.name}' already exists")


@router.get("/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, data: CategoryUpdate, db: Session = Depends(get_db)):
    try:
        category = crud.update_category(db, category_id, data)
    except IntegrityError:
        raise HTTPException(status_code=409, detail=f"Category '{data.name}' already exists")
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
