from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routes import auth, campaign,lead  




# Créer les tables dans la base de données
Base.metadata.create_all(bind=engine)

# Initialiser l'application FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION
)

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Votre URL frontend exacte
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Ajouter OPTIONS explicitement
    allow_headers=["*"],
    expose_headers=["*"],  # Important pour exposer les en-têtes de réponse
)
# Inclure les routes
app.include_router(auth.router)
app.include_router(campaign.router)
# app.include_router(dashboard.router)
# app.include_router(test_scraper.router)
# app.include_router(lead.router)
app.include_router(lead.router) 

# Route de base pour vérifier que l'API fonctionne
@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API de ProspectIA"}