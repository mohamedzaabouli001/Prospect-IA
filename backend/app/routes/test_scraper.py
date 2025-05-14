from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
# from app.routes.auth import get_current_user
# from app.models.user import User
from app.services.scraping.google_maps_scraper import GoogleMapsScraper

router = APIRouter(
    prefix="/test-scraper",
    tags=["test"],
    responses={404: {"description": "Not found"}},
)

@router.get("/google-maps", response_model=List[Dict[str, Any]])
async def test_google_maps_scraper(
    query: str,
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    """
    Test du scraper Google Maps.
    """
    try:
        # Créer une instance du scraper
        scraper = GoogleMapsScraper()
        
        # Exécuter une collecte
        results = await scraper.run_collection(query, {})
        
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du test: {str(e)}"
        )