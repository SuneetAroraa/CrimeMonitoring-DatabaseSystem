import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Expecting DATABASE_URL from environment (set in docker-compose)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://crime_user:crime_password@localhost:3306/crime_monitoring")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
