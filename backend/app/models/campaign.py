from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    
    # Étape 1: Informations de base
    campaign_name = Column(String(255), nullable=False)
    campaign_objective = Column(String(50), nullable=False)
    business_type = Column(String(100), nullable=False)
    target_industry = Column(JSON, nullable=False)  # Stocké en JSON pour les sélections multiples
    target_company_size = Column(JSON, nullable=True)  # JSON array
    target_geography = Column(String(255), nullable=False)
    
    # Étape 2: Informations sur l'offre
    offer_type = Column(String(50), nullable=False)  # produit digital, produit physique, service
    product_category = Column(String(50), nullable=True)
    product_name = Column(String(100), nullable=False)
    product_description = Column(Text, nullable=False)
    product_benefits = Column(Text, nullable=False)
    product_usp = Column(String(255), nullable=False)  # Unique Selling Proposition
    product_pricing = Column(String(50), nullable=True)
    product_url = Column(String(255), nullable=True)
    
    # Étape 3: Cible et persona
    target_job = Column(Text, nullable=False)
    target_seniority = Column(JSON, nullable=True)  # JSON array
    target_department = Column(JSON, nullable=True)  # JSON array
    persona_pain_points = Column(Text, nullable=False)
    persona_motivations = Column(Text, nullable=True)
    persona_objections = Column(Text, nullable=True)
    decision_maker = Column(String(20), nullable=True)
    
    # Étape 4: Sources et canaux
    scraping_sources = Column(JSON, nullable=False)  # JSON array
    contact_methods = Column(JSON, nullable=False)  # JSON array
    linkedin_url = Column(String(255), nullable=True)
    google_maps_location = Column(String(255), nullable=True)
    other_source_url = Column(String(255), nullable=True)
    
    # Étape 5: Personnalisation du message
    message_style = Column(String(50), nullable=False)
    message_tone = Column(String(50), nullable=False)
    call_to_action = Column(String(50), nullable=False)
    company_background = Column(Text, nullable=True)
    success_stories = Column(Text, nullable=True)
    social_proof = Column(Text, nullable=True)
    urgency_factor = Column(String(255), nullable=True)
    
    # Étape 6: Paramètres de la campagne
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    daily_limit = Column(Integer, nullable=False)
    follow_up_sequence = Column(Boolean, default=False)
    follow_up_delay = Column(Integer, nullable=True)
    follow_up_number = Column(Integer, nullable=True)
    test_mode = Column(Boolean, default=True)
    
    # Colonnes additionnelles pour la gestion
    status = Column(String(20), default="pending")  # pending, active, paused, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="campaigns")