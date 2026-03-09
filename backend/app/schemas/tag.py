from typing import Optional

from pydantic import BaseModel, ConfigDict


class TagOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class TagCreate(BaseModel):
    name: str


class TagUpdate(BaseModel):
    name: Optional[str] = None
