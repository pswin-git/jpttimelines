from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, CheckConstraint, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.associations import event_categories, event_regions, event_tags
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.category import ThematicCategory
    from app.models.region import GeographicRegion
    from app.models.tag import CustomTag


class Event(Base):
    __tablename__ = "events"
    __table_args__ = (
        CheckConstraint("event_type IN ('point', 'range')", name="ck_event_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    event_type: Mapped[str] = mapped_column(String, nullable=False)

    start_year: Mapped[int] = mapped_column(Integer, nullable=False)
    start_month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    start_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    start_circa: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")

    end_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_circa: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")

    narrative: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    regions: Mapped[List["GeographicRegion"]] = relationship(
        secondary=event_regions, back_populates="events"
    )
    categories: Mapped[List["ThematicCategory"]] = relationship(
        secondary=event_categories, back_populates="events"
    )
    tags: Mapped[List["CustomTag"]] = relationship(
        secondary=event_tags, back_populates="events"
    )
