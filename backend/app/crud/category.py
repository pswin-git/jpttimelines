from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import ThematicCategory
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session) -> List[ThematicCategory]:
    return db.query(ThematicCategory).order_by(ThematicCategory.name).all()


def get_category(db: Session, category_id: int) -> Optional[ThematicCategory]:
    return db.query(ThematicCategory).filter(ThematicCategory.id == category_id).first()


def create_category(db: Session, data: CategoryCreate) -> ThematicCategory:
    category = ThematicCategory(name=data.name)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Optional[ThematicCategory]:
    category = get_category(db, category_id)
    if category is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> bool:
    category = get_category(db, category_id)
    if category is None:
        return False
    db.delete(category)
    db.commit()
    return True
