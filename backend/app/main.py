from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import items

app = FastAPI(title="JPT Timelines API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)


@app.get("/")
def root():
    return {"message": "JPT Timelines API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
