import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

class Settings:
    # Configuration de base de l'application
    PROJECT_NAME: str = "Prospect IA"
    PROJECT_VERSION: str = "1.0.0"
    
    # Configuration de la base de données
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Configuration de sécurité
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    
    # Configuration CORS pour le frontend
    # CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    # CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]  # Ajoutez ici vos domaines frontend

settings = Settings()