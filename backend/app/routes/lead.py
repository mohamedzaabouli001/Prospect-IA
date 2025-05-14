from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.lead import Lead, LeadStatus
from app.models.campaign import Campaign
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.lead import Lead as LeadSchema

router = APIRouter(
    prefix="/leads",
    tags=["leads"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[LeadSchema])
async def get_leads(
    campaign_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère la liste des leads pour un utilisateur.
    Permet de filtrer par campagne.
    """
    # Construire la requête
    query = db.query(Lead).join(
        Campaign,
        Lead.campaign_id == Campaign.id
    ).filter(Campaign.user_id == current_user.id)
    
    # Appliquer les filtres
    if campaign_id:
        query = query.filter(Lead.campaign_id == campaign_id)
    
    # Appliquer la pagination
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    
    return leads