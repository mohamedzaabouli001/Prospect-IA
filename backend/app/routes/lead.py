# app/routes/lead.py

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, File, UploadFile
from sqlalchemy.orm import Session
import json
from typing import List, Optional
import io
from app.database import get_db
from app.models.lead import Lead
from app.models.campaign import Campaign
from app.schemas.lead import Lead as LeadSchema, LeadCreate, LeadBatch
from app.routes.auth import get_current_user
from app.models.user import User
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from sqlalchemy.orm import sessionmaker
from collections import Counter

router = APIRouter(
    prefix="/leads",
    tags=["leads"],
    responses={404: {"description": "Not found"}},
)

@router.post("/upload-file", response_model=List[LeadSchema])
async def upload_leads_file(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Importer des leads à partir d'un fichier JSON téléchargé.
    """
    # Vérifier que le fichier est de type JSON
    if not file.content_type.startswith("application/json"):
        raise HTTPException(
            status_code=400,
            detail="Le fichier doit être au format JSON"
        )
    
    try:
        # Lire et parser le fichier JSON
        content = await file.read()
        leads_data = json.loads(content.decode("utf-8"))
        
        # Traiter les données et créer les leads
        return process_leads_data(leads_data, background_tasks, db, current_user)
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Le fichier n'est pas un JSON valide"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement: {str(e)}"
        )

@router.post("/import-json", response_model=List[LeadSchema])
def import_leads_json(
    background_tasks: BackgroundTasks,
    leads_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Importer des leads à partir d'un objet JSON dans le corps de la requête.
    """
    try:
        # Traiter les données et créer les leads
        return process_leads_data(leads_data, background_tasks, db, current_user)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement: {str(e)}"
        )

def process_leads_data(leads_data, background_tasks, db, current_user):
    """
    Traiter les données JSON et créer/mettre à jour les leads.
    """
    # Convertir en liste si c'est un seul objet
    leads_list = []
    if isinstance(leads_data, dict) and not any(key in ["leads", "items"] for key in leads_data.keys()):
        # Un seul lead au format objet
        leads_list = [leads_data]
    elif isinstance(leads_data, list):
        # Format [lead1, lead2, ...]
        leads_list = leads_data
    else:
        raise HTTPException(
            status_code=400,
            detail="Format de données invalide. Utilisez un objet JSON ou une liste."
        )
    
    # Détecter l'industrie à partir des données
    for lead in leads_list:
        if "industry" not in lead or not lead.get("industry"):
            # Détecter l'industrie à partir du titre ou d'autres champs
            title = lead.get("title", "").lower()
            if "immobil" in title:
                lead["industry"] = "Immobilier"
            elif "restaurant" in title or "café" in title or "bistro" in title:
                lead["industry"] = "Restauration"
            elif "hôtel" in title:
                lead["industry"] = "Hôtellerie"
            elif "avocat" in title or "notaire" in title or "juridique" in title:
                lead["industry"] = "Services juridiques"
            elif "conseil" in title or "consulting" in title:
                lead["industry"] = "Conseil"
            elif "tech" in title or "digital" in title or "informatique" in title:
                lead["industry"] = "Technologie"
            else:
                lead["industry"] = "Autre"
    
    # Créer les leads
    db_leads = []
    for lead_data in leads_list:
        # Vérifier si le lead existe déjà (basé sur l'URL ou le titre + téléphone)
        existing_lead = None
        if "url" in lead_data and lead_data["url"]:
            existing_lead = db.query(Lead).filter(Lead.url == lead_data["url"]).first()
        elif "title" in lead_data and "phone" in lead_data and lead_data["title"] and lead_data["phone"]:
            existing_lead = db.query(Lead).filter(
                Lead.title == lead_data["title"],
                Lead.phone == lead_data["phone"]
            ).first()
        
        if existing_lead:
            # Mettre à jour le lead existant
            for key, value in lead_data.items():
                if hasattr(existing_lead, key) and value is not None:
                    setattr(existing_lead, key, value)
            
            db.commit()
            db.refresh(existing_lead)
            db_leads.append(existing_lead)
        else:
            # Créer un nouveau lead
            new_lead = Lead(**lead_data)
            db.add(new_lead)
            db.commit()
            db.refresh(new_lead)
            db_leads.append(new_lead)   
    return db_leads


@router.get("/campaign/{campaign_id}/ml-matching", response_model=List[LeadSchema])
def get_ml_compatible_leads(
    campaign_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Utilise le machine learning pour trouver les leads les plus compatibles avec une campagne spécifique.
    """
    # Vérifier que la campagne existe et appartient à l'utilisateur courant
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id, 
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Récupérer tous les leads disponibles
    leads = db.query(Lead).all()
    
    if not leads:
        return []
    
    # Préparer les données pour l'analyse ML
    campaign_features = extract_campaign_features(campaign)
    lead_features = [extract_lead_features(lead) for lead in leads]
    
    # Utiliser TF-IDF pour vectoriser les caractéristiques textuelles
    vectorizer = TfidfVectorizer(stop_words='french')
    
    # Combiner les caractéristiques pour l'entraînement
    all_features = [campaign_features] + lead_features
    
    # Vectoriser toutes les caractéristiques
    try:
        tfidf_matrix = vectorizer.fit_transform(all_features)
    except:
        # Si les données sont insuffisantes, retourner une liste vide
        return []
    
    # Séparer les vecteurs de la campagne et des leads
    campaign_vector = tfidf_matrix[0:1]
    leads_vectors = tfidf_matrix[1:]
    
    # Calculer la similarité cosinus entre chaque lead et la campagne
    similarities = cosine_similarity(leads_vectors, campaign_vector).flatten()
    
    # Appliquer des boosts spécifiques selon le type de campagne
    lead_scores = []
    for i, lead in enumerate(leads):
        base_score = similarities[i]
        
        # Appliquer les boosts en fonction du type de la campagne
        final_score = apply_campaign_specific_boosts(base_score, lead, campaign)
        
        lead_scores.append((lead, final_score))
    
    # Trier les leads par score de pertinence
    sorted_leads = sorted(lead_scores, key=lambda x: x[1], reverse=True)
    
    # Mettre à jour les scores dans la base de données
    for lead, score in sorted_leads[:limit]:
        lead.compatibility_score = score
        lead.processed = True
        
        # Associer les leads avec un score élevé à la campagne
        if score > 0.7:
            lead.campaign_id = campaign_id
            lead.status = "qualified"
        elif score > 0.4:
            lead.status = "potential"
    
    db.commit()
    
    # Retourner les meilleurs leads
    return [lead for lead, _ in sorted_leads[:limit]]

def extract_campaign_features(campaign: Campaign) -> str:
    """
    Extraire les caractéristiques textuelles d'une campagne pour l'analyse ML.
    """
    features = []
    
    # Informations de base
    features.append(f"campagne: {campaign.campaign_name}")
    features.append(f"objectif: {campaign.campaign_objective}")
    features.append(f"type entreprise: {campaign.business_type}")
    
    # Industrie cible
    if isinstance(campaign.target_industry, list):
        for industry in campaign.target_industry:
            features.append(f"industrie cible: {industry}")
    else:
        features.append(f"industrie cible: {campaign.target_industry}")
    
    # Taille d'entreprise cible
    if campaign.target_company_size and isinstance(campaign.target_company_size, list):
        for size in campaign.target_company_size:
            features.append(f"taille cible: {size}")
    
    # Géographie cible
    features.append(f"géographie: {campaign.target_geography}")
    
    # Informations sur l'offre
    features.append(f"type offre: {campaign.offer_type}")
    if campaign.product_category:
        features.append(f"catégorie produit: {campaign.product_category}")
    features.append(f"produit: {campaign.product_name}")
    features.append(f"description: {campaign.product_description}")
    features.append(f"avantages: {campaign.product_benefits}")
    features.append(f"proposition unique: {campaign.product_usp}")
    
    # Mots-clés supplémentaires pour certains types de produits
    if "site web" in campaign.product_name.lower() or "site internet" in campaign.product_name.lower():
        features.append("mots-clés: site web création présence en ligne digital internet visibilité")
    elif "marketing" in campaign.product_name.lower():
        features.append("mots-clés: marketing publicité visibilité acquisition clients")
    elif "logiciel" in campaign.product_name.lower() or "application" in campaign.product_name.lower():
        features.append("mots-clés: logiciel application digitalisation automatisation productivité")
    
    return " ".join(features)

def extract_lead_features(lead: Lead) -> str:
    """
    Extraire les caractéristiques textuelles d'un lead pour l'analyse ML.
    """
    features = []
    
    # Informations de base
    features.append(f"nom: {lead.title}")
    
    if lead.industry:
        features.append(f"industrie: {lead.industry}")
    
    if lead.company_size:
        features.append(f"taille: {lead.company_size}")
    
    if lead.city:
        features.append(f"ville: {lead.city}")
    
    # Présence digitale
    if lead.website:
        features.append("a un site web")
    else:
        features.append("pas de site web")
    
    # Réseaux sociaux
    social_count = 0
    social_platforms = []
    
    if lead.facebooks and len(lead.facebooks) > 0:
        social_count += 1
        social_platforms.append("facebook")
    
    if lead.instagrams and len(lead.instagrams) > 0:
        social_count += 1
        social_platforms.append("instagram")
    
    if lead.linkedIns and len(lead.linkedIns) > 0:
        social_count += 1
        social_platforms.append("linkedin")
    
    if lead.youtubes and len(lead.youtubes) > 0:
        social_count += 1
        social_platforms.append("youtube")
    
    features.append(f"présence sociale: {social_count}")
    if social_platforms:
        features.append(f"plateformes: {' '.join(social_platforms)}")
    
    # Indicateurs de qualité
    if lead.totalScore and lead.totalScore > 0:
        features.append(f"score: {lead.totalScore}")
        if lead.totalScore >= 4.5:
            features.append("très bien noté")
        elif lead.totalScore >= 4.0:
            features.append("bien noté")
    
    if lead.reviewsCount and lead.reviewsCount > 0:
        features.append(f"nombre avis: {lead.reviewsCount}")
        if lead.reviewsCount >= 100:
            features.append("très populaire")
        elif lead.reviewsCount >= 50:
            features.append("populaire")
        elif lead.reviewsCount >= 10:
            features.append("quelques avis")
    
    # Contactabilité
    if lead.emails and len(lead.emails) > 0:
        features.append("a des emails")
    
    if lead.phone:
        features.append("a un téléphone")
    
    return " ".join(features)

def apply_campaign_specific_boosts(base_score: float, lead: Lead, campaign: Campaign) -> float:
    """
    Appliquer des boosts spécifiques en fonction du type de campagne.
    """
    product_name = campaign.product_name.lower()
    final_score = base_score
    
    # Boosts généraux
    if lead.emails and len(lead.emails) > 0:
        final_score *= 1.2  # Meilleur score si des emails sont disponibles
    
    if lead.reviewsCount and lead.reviewsCount > 0:
        final_score *= min(1.3, 1 + (lead.reviewsCount / 200))  # Boost basé sur le nombre d'avis
    
    if lead.totalScore and lead.totalScore > 0:
        final_score *= min(1.2, 1 + (lead.totalScore / 10))  # Boost basé sur la note
    
    # Boosts spécifiques selon le type de campagne
    if "site web" in product_name or "site internet" in product_name:
        if "création" in product_name:
            # Pour la création de sites web, favoriser les entreprises sans site
            if not lead.website:
                final_score *= 1.5
            
            # Mais avec une bonne réputation
            if lead.reviewsCount and lead.reviewsCount > 10:
                final_score *= 1.2
        
        elif "refonte" in product_name or "amélioration" in product_name:
            # Pour la refonte, favoriser les entreprises avec un site web existant
            if lead.website:
                final_score *= 1.4
    
    elif "marketing" in product_name or "publicité" in product_name:
        # Pour le marketing, favoriser les entreprises avec une présence en ligne
        if lead.website:
            final_score *= 1.2
        
        social_count = sum(1 for x in [lead.facebooks, lead.instagrams, lead.linkedIns, lead.youtubes] 
                           if x and len(x) > 0)
        if social_count > 0:
            final_score *= (1 + (social_count * 0.05))
    
    elif "logiciel" in product_name or "application" in product_name:
        # Pour les logiciels, favoriser les entreprises avec une certaine taille
        if lead.company_size:
            if lead.company_size.lower() in ["moyenne", "grande"]:
                final_score *= 1.3
    
    # Ne pas dépasser 1.0
    return min(1.0, final_score)