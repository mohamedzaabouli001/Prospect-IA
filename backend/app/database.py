from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Créer une instance du moteur SQLAlchemy avec l'URL de connexion
engine = create_engine(settings.DATABASE_URL)

# Créer une SessionLocal pour gérer les connexions à la base de données
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base pour créer les modèles SQLAlchemy
Base = declarative_base()

# Fonction de dépendance pour obtenir une session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()