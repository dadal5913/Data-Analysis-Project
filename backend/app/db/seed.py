from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def seed():
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "demo@quantlab.dev").first()
        if not existing:
            db.add(User(email="demo@quantlab.dev", hashed_password=hash_password("demo1234")))
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
