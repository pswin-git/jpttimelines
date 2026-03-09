from typing import Optional

from pydantic import BaseModel, ConfigDict


class RegionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class RegionCreate(BaseModel):
    name: str


class RegionUpdate(BaseModel):
    name: Optional[str] = None
