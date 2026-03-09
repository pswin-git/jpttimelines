from sqlalchemy import Column, ForeignKey, Integer, Table

from app.models.base import Base

event_regions = Table(
    "event_regions",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("region_id", Integer, ForeignKey("geographic_regions.id", ondelete="CASCADE"), primary_key=True),
)

event_categories = Table(
    "event_categories",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("category_id", Integer, ForeignKey("thematic_categories.id", ondelete="CASCADE"), primary_key=True),
)

event_tags = Table(
    "event_tags",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("custom_tags.id", ondelete="CASCADE"), primary_key=True),
)
