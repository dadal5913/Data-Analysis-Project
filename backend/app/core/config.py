from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "QuantLab API"
    api_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://quantlab:quantlab@postgres:5432/quantlab"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    redis_host: str = "redis"
    redis_port: int = 6379
    upload_dir: str = "/app/uploads"
    ws_price_symbols: str = "AAPL,MSFT,SPY,BTCUSD"


@lru_cache
def get_settings() -> Settings:
    return Settings()
