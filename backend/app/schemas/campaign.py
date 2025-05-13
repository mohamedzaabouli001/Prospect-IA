from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel

class CampaignBase(BaseModel):
    # Étape 1: Informations de base
    campaign_name: str
    campaign_objective: str
    business_type: str
    target_industry: List[str]
    target_company_size: Optional[List[str]] = None
    target_geography: str
    
    # Étape 2: Informations sur l'offre
    offer_type: str
    product_category: Optional[str] = None
    product_name: str
    product_description: str
    product_benefits: str
    product_usp: str
    product_pricing: Optional[str] = None
    product_url: Optional[str] = None
    
    # Étape 3: Cible et persona
    target_job: str  # Nous traiterons cela comme une liste séparée par des virgules
    target_seniority: Optional[List[str]] = None
    target_department: Optional[List[str]] = None
    persona_pain_points: str
    persona_motivations: Optional[str] = None
    persona_objections: Optional[str] = None
    decision_maker: Optional[str] = None
    
    # Étape 4: Sources et canaux
    scraping_sources: List[str]
    contact_methods: List[str]
    linkedin_url: Optional[str] = None
    google_maps_location: Optional[str] = None
    other_source_url: Optional[str] = None
    
    # Étape 5: Personnalisation du message
    message_style: str
    message_tone: str
    call_to_action: str
    company_background: Optional[str] = None
    success_stories: Optional[str] = None
    social_proof: Optional[str] = None
    urgency_factor: Optional[str] = None
    
    # Étape 6: Paramètres de la campagne
    start_date: date
    end_date: Optional[date] = None
    daily_limit: int
    follow_up_sequence: bool = False
    follow_up_delay: Optional[int] = None
    follow_up_number: Optional[int] = None
    test_mode: bool = True

class CampaignCreate(CampaignBase):
    pass

class CampaignInDB(CampaignBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class Campaign(CampaignInDB):
    pass