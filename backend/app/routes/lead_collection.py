from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.lead import Lead, LeadStatus
from app.models.lead_collection import LeadCollection, CollectionStatus
from app.routes.auth import get_current_user
from app.models.user import User
from app.schemas.lead_collection import LeadCollection as LeadCollectionSchema, LeadCollectionCreate
from app.services.lead_collection_manager import LeadCollectionManager

router = APIRouter(
    prefix="/lead-collections",
    tags=["lead collections"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=LeadCollectionSchema, status_code=status.HTTP_201_CREATED)
async def create_lead_collection(
    collection_data: LeadCollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crée une nouvelle collecte de leads.
    """
    manager = LeadCollectionManager(db)
    
    try:
        collection = await manager.create_collection(
            campaign_id=collection_data.campaign_id,
            user_id=current_user.id,
            name=collection_data.name,
            source=collection_data.source,
            source_url=collection_data.source_url,
            source_params={},
            description=""
        )
        
        return collection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de la collecte: {str(e)}"
        )

@router.post("/{collection_id}/start", response_model=LeadCollectionSchema)
async def start_lead_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Démarre une collecte de leads.
    """
    manager = LeadCollectionManager(db)
    
    try:
        # Vérifier que la collecte appartient à l'utilisateur
        collection = await manager.get_collection(collection_id)
        if collection.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas la permission de démarrer cette collecte"
            )
        
        # Démarrer la collecte
        collection = await manager.start_collection(collection_id)
        
        return collection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du démarrage de la collecte: {str(e)}"
        )

@router.get("/", response_model=List[LeadCollectionSchema])
async def get_lead_collections(
    campaign_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère la liste des collectes de leads pour un utilisateur.
    Permet de filtrer par campagne.
    """
    manager = LeadCollectionManager(db)
    
    try:
        collections = await manager.get_collections(
            campaign_id=campaign_id,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        
        return collections
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des collectes: {str(e)}"
        )

@router.get("/{collection_id}", response_model=LeadCollectionSchema)
async def get_lead_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère une collecte de leads spécifique.
    """
    manager = LeadCollectionManager(db)
    
    try:
        collection = await manager.get_collection(collection_id)
        
        # Vérifier que la collecte appartient à l'utilisateur
        if collection.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas la permission de voir cette collecte"
            )
        
        return collection
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Collecte non trouvée"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de la collecte: {str(e)}"
        )