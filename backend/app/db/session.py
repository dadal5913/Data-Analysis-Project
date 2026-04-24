from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Neon-friendly engine:
# - pool_pre_ping: drops stale connections after Neon's compute auto-suspends.
# - pool_recycle: proactively recycles before Neon's idle timeout window.
# - connect_args: enables TCP keepalives for long-lived connections behind NAT.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=5,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    },
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
