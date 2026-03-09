from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, model_validator

from app.schemas.category import CategoryOut
from app.schemas.region import RegionOut
from app.schemas.tag import TagOut

__all__ = ["RegionOut", "CategoryOut", "TagOut", "EventCreate", "EventUpdate", "EventOut"]


class EventBase(BaseModel):
    title: str
    event_type: Literal["point", "range"]
    start_year: int
    start_month: Optional[int] = None
    start_day: Optional[int] = None
    start_circa: bool = False
    end_year: Optional[int] = None
    end_month: Optional[int] = None
    end_day: Optional[int] = None
    end_circa: bool = False
    narrative: Optional[str] = None


class EventCreate(EventBase):
    region_ids: List[int] = []
    category_ids: List[int] = []
    tag_ids: List[int] = []

    @model_validator(mode="after")
    def range_requires_end_year(self) -> "EventCreate":
        if self.event_type == "range" and self.end_year is None:
            raise ValueError("end_year is required for range events")
        return self


class EventUpdate(BaseModel):
    title: Optional[str] = None
    event_type: Optional[Literal["point", "range"]] = None
    start_year: Optional[int] = None
    start_month: Optional[int] = None
    start_day: Optional[int] = None
    start_circa: Optional[bool] = None
    end_year: Optional[int] = None
    end_month: Optional[int] = None
    end_day: Optional[int] = None
    end_circa: Optional[bool] = None
    narrative: Optional[str] = None
    region_ids: Optional[List[int]] = None
    category_ids: Optional[List[int]] = None
    tag_ids: Optional[List[int]] = None


class EventOut(EventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    regions: List[RegionOut] = []
    categories: List[CategoryOut] = []
    tags: List[TagOut] = []
