from typing import List, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.tag import CustomTag
from app.schemas.tag import TagCreate, TagUpdate


def get_tags(db: Session) -> List[CustomTag]:
    return db.query(CustomTag).order_by(CustomTag.name).all()


def get_tag(db: Session, tag_id: int) -> Optional[CustomTag]:
    return db.query(CustomTag).filter(CustomTag.id == tag_id).first()


def create_tag(db: Session, data: TagCreate) -> CustomTag:
    tag = CustomTag(name=data.name)
    db.add(tag)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag_id: int, data: TagUpdate) -> Optional[CustomTag]:
    tag = get_tag(db, tag_id)
    if tag is None:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tag, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag_id: int) -> bool:
    tag = get_tag(db, tag_id)
    if tag is None:
        return False
    db.delete(tag)
    db.commit()
    return True
