# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session
# from typing import List, Optional
# from app.database import get_db
# from app.models.campaign import Campaign
# from app.schemas.campaign import Campaign as CampaignSchema, CampaignCreate
# from app.routes.auth import get_current_user
# from app.models.user import User

# router = APIRouter(
#     prefix="/campaigns",
#     tags=["campaigns"],
#     responses={404: {"description": "Not found"}},
# )

# @router.post("/", response_model=CampaignSchema, status_code=status.HTTP_201_CREATED)
# def create_campaign(
#     campaign: CampaignCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Créer une nouvelle campagne de prospection.
#     """
#     db_campaign = Campaign(
#         # Étape 1: Informations de base
#         campaign_name=campaign.campaign_name,
#         campaign_objective=campaign.campaign_objective,
#         business_type=campaign.business_type,
#         target_industry=campaign.target_industry,
#         target_company_size=campaign.target_company_size,
#         target_geography=campaign.target_geography,
        
#         # Étape 2: Informations sur l'offre
#         offer_type=campaign.offer_type,
#         product_category=campaign.product_category,
#         product_name=campaign.product_name,
#         product_description=campaign.product_description,
#         product_benefits=campaign.product_benefits,
#         product_usp=campaign.product_usp,
#         product_pricing=campaign.product_pricing,
#         product_url=campaign.product_url,
        
#         # Étape 3: Cible et persona
#         target_job=campaign.target_job,
#         target_seniority=campaign.target_seniority,
#         target_department=campaign.target_department,
#         persona_pain_points=campaign.persona_pain_points,
#         persona_motivations=campaign.persona_motivations,
#         persona_objections=campaign.persona_objections,
#         decision_maker=campaign.decision_maker,
        
#         # Étape 4: Sources et canaux
#         scraping_sources=campaign.scraping_sources,
#         contact_methods=campaign.contact_methods,
#         linkedin_url=campaign.linkedin_url,
#         google_maps_location=campaign.google_maps_location,
#         other_source_url=campaign.other_source_url,
        
#         # Étape 5: Personnalisation du message
#         message_style=campaign.message_style,
#         message_tone=campaign.message_tone,
#         call_to_action=campaign.call_to_action,
#         company_background=campaign.company_background,
#         success_stories=campaign.success_stories,
#         social_proof=campaign.social_proof,
#         urgency_factor=campaign.urgency_factor,
        
#         # Étape 6: Paramètres de la campagne
#         start_date=campaign.start_date,
#         end_date=campaign.end_date,
#         daily_limit=campaign.daily_limit,
#         follow_up_sequence=campaign.follow_up_sequence,
#         follow_up_delay=campaign.follow_up_delay,
#         follow_up_number=campaign.follow_up_number,
#         test_mode=campaign.test_mode,
        
#         # Informations additionnelles
#         user_id=current_user.id
#     )
    
#     db.add(db_campaign)
#     db.commit()
#     db.refresh(db_campaign)
#     return db_campaign

# @router.get("/", response_model=List[CampaignSchema])
# def get_campaigns(
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
#     skip: int = 0,
#     limit: int = 100
# ):
#     """
#     Récupérer toutes les campagnes de l'utilisateur connecté.
#     """
#     return db.query(Campaign).filter(Campaign.user_id == current_user.id).offset(skip).limit(limit).all()

# @router.get("/{campaign_id}", response_model=CampaignSchema)
# def get_campaign(
#     campaign_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Récupérer une campagne spécifique par son ID.
#     """
#     campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
#     if campaign is None:
#         raise HTTPException(status_code=404, detail="Campagne non trouvée")
#     return campaign

# @router.put("/{campaign_id}", response_model=CampaignSchema)
# def update_campaign(
#     campaign_id: int,
#     campaign_data: CampaignCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Mettre à jour une campagne existante.
#     """
#     campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
#     if campaign is None:
#         raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
#     # Mettre à jour les attributs de la campagne
#     for key, value in campaign_data.dict().items():
#         setattr(campaign, key, value)
    
#     db.commit()
#     db.refresh(campaign)
#     return campaign

# @router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_campaign(
#     campaign_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Supprimer une campagne.
#     """
#     campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
#     if campaign is None:
#         raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
#     db.delete(campaign)
#     db.commit()
#     return None


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.campaign import Campaign as CampaignSchema, CampaignCreate
from app.routes.auth import get_current_user
from app.models.user import User


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random

from app.database import get_db
from app.models.campaign import Campaign
from app.schemas.campaign import Campaign as CampaignSchema, CampaignCreate
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/campaigns",
    tags=["campaigns"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=CampaignSchema, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Créer une nouvelle campagne de prospection.
    """
    db_campaign = Campaign(
        # Étape 1: Informations de base
        campaign_name=campaign.campaign_name,
        campaign_objective=campaign.campaign_objective,
        business_type=campaign.business_type,
        target_industry=campaign.target_industry,
        target_company_size=campaign.target_company_size,
        target_geography=campaign.target_geography,
        
        # Étape 2: Informations sur l'offre
        offer_type=campaign.offer_type,
        product_category=campaign.product_category,
        product_name=campaign.product_name,
        product_description=campaign.product_description,
        product_benefits=campaign.product_benefits,
        product_usp=campaign.product_usp,
        product_pricing=campaign.product_pricing,
        product_url=campaign.product_url,
        
        # Étape 3: Cible et persona
        target_job=campaign.target_job,
        target_seniority=campaign.target_seniority,
        target_department=campaign.target_department,
        persona_pain_points=campaign.persona_pain_points,
        persona_motivations=campaign.persona_motivations,
        persona_objections=campaign.persona_objections,
        decision_maker=campaign.decision_maker,
        
        # Étape 4: Sources et canaux
        scraping_sources=campaign.scraping_sources,
        contact_methods=campaign.contact_methods,
        linkedin_url=campaign.linkedin_url,
        google_maps_location=campaign.google_maps_location,
        other_source_url=campaign.other_source_url,
        
        # Étape 5: Personnalisation du message
        message_style=campaign.message_style,
        message_tone=campaign.message_tone,
        call_to_action=campaign.call_to_action,
        company_background=campaign.company_background,
        success_stories=campaign.success_stories,
        social_proof=campaign.social_proof,
        urgency_factor=campaign.urgency_factor,
        
        # Étape 6: Paramètres de la campagne
        start_date=campaign.start_date,
        end_date=campaign.end_date,
        daily_limit=campaign.daily_limit,
        follow_up_sequence=campaign.follow_up_sequence,
        follow_up_delay=campaign.follow_up_delay,
        follow_up_number=campaign.follow_up_number,
        test_mode=campaign.test_mode,
        
        # Informations additionnelles
        user_id=current_user.id
    )
    
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.get("/", response_model=List[CampaignSchema])
def get_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """
    Récupérer toutes les campagnes de l'utilisateur connecté.
    """
    campaigns = db.query(Campaign).filter(Campaign.user_id == current_user.id).offset(skip).limit(limit).all()
    return campaigns

@router.get("/{campaign_id}", response_model=CampaignSchema)
def get_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer une campagne spécifique par son ID.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    return campaign

@router.put("/{campaign_id}", response_model=CampaignSchema)
def update_campaign(
    campaign_id: int,
    campaign_data: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mettre à jour une campagne existante.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Mise à jour des attributs de la campagne
    campaign_data_dict = campaign_data.dict(exclude_unset=True)
    for key, value in campaign_data_dict.items():
        setattr(campaign, key, value)
    
    db.commit()
    db.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer une campagne.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    db.delete(campaign)
    db.commit()
    return None



@router.get("/{campaign_id}/results", response_model=Dict[str, Any])
def get_campaign_results(
    campaign_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtenir les résultats d'une campagne spécifique.
    """
    # Vérifier que la campagne existe et appartient à l'utilisateur courant
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Dans un environnement de production, récupérez les vraies données depuis votre base de données
    # Pour cet exemple, nous allons générer des données de test
    
    # Pour une démo, on génère des données de test en fonction de la campagne
    results = generate_mock_results(campaign)
    
    return results

def generate_mock_results(campaign: Campaign) -> Dict[str, Any]:
    """
    Générer des données de test pour une campagne.
    Cette fonction devrait être remplacée par une vraie récupération de données en production.
    """
    # Dates de la campagne
    start_date = datetime.strptime(str(campaign.start_date).split('T')[0], "%Y-%m-%d") if campaign.start_date else datetime.now() - timedelta(days=30)
    end_date = datetime.strptime(str(campaign.end_date).split('T')[0], "%Y-%m-%d") if campaign.end_date else datetime.now()
    
    # S'assurer que la date de fin n'est pas dans le futur
    if end_date > datetime.now():
        end_date = datetime.now()
    
    # Générer des dates pour la période
    dates = []
    current_date = start_date
    
    while current_date <= end_date:
        dates.append(current_date.strftime("%d/%m"))
        current_date += timedelta(days=1)
    
    # Générer des données aléatoires pour les messages, réponses et conversions
    messages_data = []
    responses_data = []
    conversions_data = []
    
    # Paramètres de la campagne pour influencer les données générées
    daily_limit = campaign.daily_limit or 20
    base_response_rate = 0.2  # 20% de taux de réponse de base
    base_conversion_rate = 0.15  # 15% de taux de conversion de base
    
    # Ajuster les taux en fonction des caractéristiques de la campagne
    if campaign.message_style == "direct":
        base_response_rate += 0.05
    elif campaign.message_style == "storytelling":
        base_response_rate += 0.03
        base_conversion_rate += 0.05
    
    if campaign.message_tone == "empathetic":
        base_conversion_rate += 0.08
    elif campaign.message_tone == "authoritative":
        base_response_rate -= 0.02
        base_conversion_rate += 0.04
    
    if campaign.social_proof:
        base_response_rate += 0.07
        base_conversion_rate += 0.04
    
    if campaign.urgency_factor:
        base_conversion_rate += 0.06
    
    # Générer les données quotidiennes
    for i in range(len(dates)):
        # Variabilité quotidienne
        daily_response_rate = max(0.05, min(0.8, base_response_rate + random.uniform(-0.1, 0.1)))
        daily_conversion_rate = max(0.05, min(0.7, base_conversion_rate + random.uniform(-0.1, 0.1)))
        
        # Messages envoyés (avec une variabilité aléatoire)
        daily_messages = int(max(1, daily_limit * random.uniform(0.7, 1.0)))
        messages_data.append(daily_messages)
        
        # Réponses reçues
        daily_responses = int(daily_messages * daily_response_rate)
        responses_data.append(daily_responses)
        
        # Conversions
        daily_conversions = int(daily_responses * daily_conversion_rate)
        conversions_data.append(daily_conversions)
    
    # Calculer les totaux et les taux
    total_messages = sum(messages_data)
    total_responses = sum(responses_data)
    total_conversions = sum(conversions_data)
    
    response_rate = round((total_responses / total_messages * 100), 2) if total_messages > 0 else 0
    conversion_rate = round((total_conversions / total_responses * 100), 2) if total_responses > 0 else 0
    
    # Générer une liste de prospects fictifs
    prospects = generate_mock_prospects(campaign, total_messages, response_rate, conversion_rate)
    
    # Assembler les résultats
    return {
        "summary": {
            "totalMessages": total_messages,
            "totalResponses": total_responses,
            "totalConversions": total_conversions,
            "responseRate": str(response_rate),
            "conversionRate": str(conversion_rate),
        },
        "charts": {
            "dates": dates,
            "messagesData": messages_data,
            "responsesData": responses_data,
            "conversionData": conversions_data
        },
        "prospects": prospects
    }

def generate_mock_prospects(campaign: Campaign, total_messages: int, response_rate: float, conversion_rate: float) -> List[Dict[str, Any]]:
    """
    Générer une liste de prospects fictifs pour la démo.
    """
    # Noms et entreprises fictifs
    first_names = ["Jean", "Marie", "Pierre", "Sophie", "Lucas", "Emma", "Thomas", "Julie", "Nicolas", "Laura", 
                   "David", "Céline", "Julien", "Claire", "Antoine", "Camille", "François", "Isabelle", "Éric", "Nathalie"]
    
    last_names = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
                  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier"]
    
    companies = ["Acme Inc.", "Tech Solutions", "Startup SAS", "Groupe ABC", "Digital Factory", "Future Tech", 
                 "WebDesign Pro", "Smart Agency", "Data Insights", "Innov Corp", "Green Energy", "Cloud Services",
                 "Global Trade", "Marketing Expert", "Consulting Plus", "Retail Group", "Finance Solutions",
                 "Health Care", "Education Plus", "Media Group"]
    
    positions = ["CEO", "CTO", "Directeur Marketing", "Directeur Commercial", "Responsable RH", "VP Ventes",
                 "Directeur Technique", "Chef de Projet", "Product Manager", "Growth Hacker", "Responsable Communication",
                 "Directeur Financier", "Business Developer", "Responsable Innovation", "Directeur des Opérations"]
    
    # Générer les prospects
    prospects = []
    
    # Calculer le nombre de prospects par statut
    total_prospects = min(100, total_messages)  # Limiter à 100 pour la démo
    responded_count = int(total_prospects * (response_rate / 100))
    converted_count = int(responded_count * (conversion_rate / 100))
    bounced_count = int(total_prospects * 0.05)  # 5% de messages rejetés
    sent_count = total_prospects - responded_count - bounced_count
    
    # Date de début de la campagne (par défaut 30 jours avant aujourd'hui)
    start_date = datetime.strptime(str(campaign.start_date).split('T')[0], "%Y-%m-%d") if campaign.start_date else datetime.now() - timedelta(days=30)
    
    # Générer des prospects avec le statut "converti"
    for i in range(converted_count):
        prospect_date = start_date + timedelta(days=random.randint(0, 30))
        if prospect_date > datetime.now():
            prospect_date = datetime.now() - timedelta(days=random.randint(0, 5))
        
        prospects.append({
            "id": i + 1,
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "position": random.choice(positions),
            "company": random.choice(companies),
            "status": "converted",
            "revenue": random.randint(1000, 10000),
            "date": prospect_date.strftime("%d/%m/%Y")
        })
    
    # Générer des prospects avec le statut "responded"
    for i in range(responded_count - converted_count):
        prospect_date = start_date + timedelta(days=random.randint(0, 30))
        if prospect_date > datetime.now():
            prospect_date = datetime.now() - timedelta(days=random.randint(0, 5))
        
        prospects.append({
            "id": i + converted_count + 1,
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "position": random.choice(positions),
            "company": random.choice(companies),
            "status": "responded",
            "revenue": 0,
            "date": prospect_date.strftime("%d/%m/%Y")
        })
    
    # Générer des prospects avec le statut "bounced"
    for i in range(bounced_count):
        prospect_date = start_date + timedelta(days=random.randint(0, 30))
        if prospect_date > datetime.now():
            prospect_date = datetime.now() - timedelta(days=random.randint(0, 5))
        
        prospects.append({
            "id": i + responded_count + 1,
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "position": random.choice(positions),
            "company": random.choice(companies),
            "status": "bounced",
            "revenue": 0,
            "date": prospect_date.strftime("%d/%m/%Y")
        })
    
    # Générer des prospects avec le statut "sent"
    for i in range(sent_count):
        prospect_date = start_date + timedelta(days=random.randint(0, 30))
        if prospect_date > datetime.now():
            prospect_date = datetime.now() - timedelta(days=random.randint(0, 5))
        
        prospects.append({
            "id": i + responded_count + bounced_count + 1,
            "name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "position": random.choice(positions),
            "company": random.choice(companies),
            "status": "sent",
            "revenue": 0,
            "date": prospect_date.strftime("%d/%m/%Y")
        })
    
    # Mélanger la liste pour un résultat plus réaliste
    random.shuffle(prospects)
    
    # Limiter à 20 pour la démo dans l'interface
    return prospects[:20]