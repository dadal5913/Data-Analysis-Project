from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Neon-friendly engine (Postgres):
# - pool_pre_ping: drops stale connections after Neon's compute auto-suspends.
# - pool_recycle: proactively recycles before Neon's idle timeout window.
# - connect_args: TCP keepalives for long-lived connections behind NAT (psycopg2 only).
_is_sqlite = settings.database_url.startswith("sqlite")
_connect_args = (
    {}
    if _is_sqlite
    else {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300 if not _is_sqlite else -1,
    pool_size=5,
    max_overflow=0 if _is_sqlite else 5,
    connect_args=_connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
