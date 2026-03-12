from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, categories, events, items, regions, tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import engine, SessionLocal
    from app.models import Base  # noqa: F401 — registers all models
    from app.models.region import GeographicRegion
    from app.models.category import ThematicCategory
    from seed_db import REGIONS, CATEGORIES

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if db.query(GeographicRegion).count() == 0:
            db.add_all(GeographicRegion(name=n) for n in REGIONS)
            db.commit()
        if db.query(ThematicCategory).count() == 0:
            db.add_all(ThematicCategory(name=n) for n in CATEGORIES)
            db.commit()
    finally:
        db.close()

    yield


app = FastAPI(title="JPT Timelines API", version="0.1.0", lifespan=lifespan)

_origins = {"http://localhost:5173", settings.FRONTEND_URL}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(regions.router)
app.include_router(categories.router)
app.include_router(tags.router)
app.include_router(items.router)


@app.get("/")
def root():
    return {"message": "JPT Timelines API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
