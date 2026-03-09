from fastapi import APIRouter, Depends

from app.auth import get_current_user

router = APIRouter(prefix="/items", tags=["items"], dependencies=[Depends(get_current_user)])


@router.get("/")
def list_items():
    # TODO: replace with real data source
    return [{"id": 1, "name": "Placeholder item"}]


@router.get("/{item_id}")
def get_item(item_id: int):
    # TODO: replace with real data source
    return {"id": item_id, "name": "Placeholder item"}
