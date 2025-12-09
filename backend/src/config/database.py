from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings

# Create SQLite engine with connection pooling disabled (SQLite doesn't support true pooling)
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=settings.environment == "development",
)


# Configure SQLite for WAL mode and foreign keys
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Set SQLite pragmas on each connection."""
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL;")  # Enable Write-Ahead Logging
    cursor.execute("PRAGMA foreign_keys=ON;")   # Enable foreign key constraints
    cursor.execute("PRAGMA busy_timeout=5000;") # Set busy timeout to 5 seconds
    cursor.close()


# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
