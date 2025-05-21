# app/models/lead.py

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    
    # Informations de base
    title = Column(String(255), nullable=False)
    categoryName = Column(String(255), nullable=False)
    imageUrl = Column(String(512), nullable=True)
    totalScore = Column(Float, nullable=True)
    reviewsCount = Column(Integer, nullable=True)
    
    # Coordonnées
    phone = Column(String(50), nullable=True)
    emails = Column(JSON, nullable=True)  # Liste d'emails stockée en JSON
    city = Column(String(100), nullable=True)
    countryCode = Column(String(100), nullable=True)
    website = Column(String(512), nullable=True)
    
    # Social Media
    instagrams = Column(JSON, nullable=True)
    facebooks = Column(JSON, nullable=True)
    linkedIns = Column(JSON, nullable=True)
    youtubes = Column(JSON, nullable=True)
    tiktoks = Column(JSON, nullable=True)
    twitters = Column(JSON, nullable=True)
    
    # URL source
    url = Column(String(512), nullable=True)
    
    # Données additionnelles qui pourraient être utiles pour l'IA
    industry = Column(String(100), nullable=True)  # Ex: immobilier, restauration, etc.
    company_size = Column(String(50), nullable=True)  # Ex: petite, moyenne, grande
    
    # Scoring et matching
    compatibility_score = Column(Float, default=0.0)  # Score calculé par ML
    processed = Column(Boolean, default=False)  # Si le lead a été analysé par ML
    
    # Statut du lead
    status = Column(String(50), default="new")  # new, contacted, responded, qualified, converted, rejected
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    campaign = relationship("Campaign", back_populates="leads")