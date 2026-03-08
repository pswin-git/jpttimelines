from fastapi import APIRouter

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/")
def list_items():
    # TODO: replace with real data source
    return [{"id": 1, "name": "Placeholder item"}]


@router.get("/{item_id}")
def get_item(item_id: int):
    # TODO: replace with real data source
    return {"id": item_id, "name": "Placeholder item"}
