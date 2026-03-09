from typing import TYPE_CHECKING, List

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.associations import event_regions
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.event import Event


class GeographicRegion(Base):
    __tablename__ = "geographic_regions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    events: Mapped[List["Event"]] = relationship(
        secondary=event_regions, back_populates="regions"
    )
