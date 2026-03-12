from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    SHARED_PASSWORD_HASH: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Set to the Vercel frontend URL in production (e.g. https://jpttimelines.vercel.app)
    FRONTEND_URL: str = "http://localhost:5173"


settings = Settings()
