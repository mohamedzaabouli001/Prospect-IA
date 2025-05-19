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
    
    # Lancer l'analyse en arrière-plan
    if db_leads:
        background_tasks.add_task(analyze_leads, db_session_factory=db.flush, leads_ids=[lead.id for lead in db_leads])
    
    return db_leads


def analyze_leads(db_session_factory, leads_ids):
    """
    Analyser les leads et calculer leur compatibilité avec les campagnes.
    Cette fonction est exécutée en arrière-plan.
    """
    # Créer une nouvelle session de base de données
    SessionLocal = sessionmaker(bind=db_session_factory)
    db = SessionLocal()
    
    try:
        # Récupérer les leads à analyser
        leads = db.query(Lead).filter(Lead.id.in_(leads_ids)).all()
        
        if not leads:
            return
        
        # Récupérer toutes les campagnes actives
        campaigns = db.query(Campaign).filter(Campaign.status == "active").all()
        
        if not campaigns:
            return
        
        # Préparer les caractéristiques des campagnes
        campaign_features = []
        for campaign in campaigns:
            features = {
                "target_industry": ", ".join(campaign.target_industry) if isinstance(campaign.target_industry, list) else str(campaign.target_industry),
                "target_geography": campaign.target_geography,
                "business_type": campaign.business_type,
                "target_company_size": ", ".join(campaign.target_company_size) if isinstance(campaign.target_company_size, list) and campaign.target_company_size else "",
                "target_job": campaign.target_job,
                "product_name": campaign.product_name,
                "product_benefits": campaign.product_benefits,
                "product_usp": campaign.product_usp
            }
            
            # Concaténer les caractéristiques en une seule chaîne
            feature_text = " ".join([str(value) for value in features.values() if value])
            campaign_features.append(feature_text)
        
        # Préparer les caractéristiques des leads
        lead_features = []
        for lead in leads:
            # Extraire le domaine des emails
            email_domains = []
            if lead.emails:
                for email in lead.emails:
                    if '@' in email:
                        domain = email.split('@')[1]
                        email_domains.append(domain)
            
            # Compter les réseaux sociaux actifs
            social_count = sum(1 for x in [
                lead.instagrams, lead.facebooks, lead.linkedIns, 
                lead.youtubes, lead.tiktoks, lead.twitters
            ] if x and len(x) > 0)
            
            # Estimer la taille de l'entreprise
            if not lead.company_size:
                if social_count >= 3 and lead.reviewsCount and lead.reviewsCount > 50:
                    lead.company_size = "grande"
                elif social_count >= 2 or (lead.reviewsCount and lead.reviewsCount > 20):
                    lead.company_size = "moyenne"
                else:
                    lead.company_size = "petite"
            
            # Préparer les caractéristiques
            features = {
                "title": lead.title,
                "city": lead.city or "",
                "industry": lead.industry or "",
                "company_size": lead.company_size or "",
                "email_domains": " ".join(email_domains),
                "website": lead.website or "",
                "social_presence": f"Présence sur {social_count} réseaux sociaux" if social_count > 0 else ""
            }
            
            # Concaténer les caractéristiques en une seule chaîne
            feature_text = " ".join([str(value) for value in features.values() if value])
            lead_features.append(feature_text)
        
        # Utiliser TF-IDF pour vectoriser les caractéristiques
        vectorizer = TfidfVectorizer(stop_words='french')
        
        # Combiner les caractéristiques pour l'entraînement
        all_features = campaign_features + lead_features
        
        # Vérifier s'il y a des caractéristiques pour vectoriser
        if not all_features or all(not feature.strip() for feature in all_features):
            # Pas assez de données pour l'analyse
            return
        
        # Vectoriser toutes les caractéristiques
        tfidf_matrix = vectorizer.fit_transform(all_features)
        
        # Séparer les vecteurs de campagnes et de leads
        campaign_vectors = tfidf_matrix[:len(campaigns)]
        lead_vectors = tfidf_matrix[len(campaigns):]
        
        # Calculer la similarité cosinus entre chaque lead et chaque campagne
        similarities = cosine_similarity(lead_vectors, campaign_vectors)
        
        # Mise à jour des scores de compatibilité
        for i, lead in enumerate(leads):
            # Trouver la campagne avec la meilleure compatibilité
            best_campaign_idx = np.argmax(similarities[i])
            best_score = similarities[i][best_campaign_idx]
            
            # Appliquer des facteurs de boost basés sur d'autres critères
            
            # Boost 1: Plus de notes = plus fiable
            review_boost = min(1.2, 1 + (lead.reviewsCount or 0) / 1000)
            
            # Boost 2: Score élevé = plus fiable
            score_boost = min(1.2, 1 + (lead.totalScore or 0) / 5)
            
            # Boost 3: Présence d'emails = plus accessible
            email_boost = 1.3 if lead.emails and len(lead.emails) > 0 else 1.0
            
            # Calculer le score final
            final_score = best_score * review_boost * score_boost * email_boost
            
            # Normaliser entre 0 et 1
            final_score = min(1.0, final_score)
            
            # Mettre à jour le lead
            lead.compatibility_score = float(final_score)
            lead.processed = True
            
            # Si le score est suffisamment élevé, associer le lead à la campagne
            if final_score > 0.5:  # Seuil de similarité
                lead.campaign_id = campaigns[best_campaign_idx].id
                lead.status = "qualified"
            else:
                lead.campaign_id = None
                lead.status = "new"
            
        # Enregistrer les modifications
        db.commit()
    
    except Exception as e:
        print(f"Erreur lors de l'analyse des leads: {str(e)}")
        db.rollback()
    
    finally:
        db.close()


# Ajoutez cet endpoint à app/routes/lead.py

@router.get("/campaign/{campaign_id}/compatible", response_model=List[LeadSchema])
def get_compatible_leads(
    campaign_id: int,
    min_score: float = 0.5,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer les leads les plus compatibles avec une campagne spécifique.
    """
    # Vérifier que la campagne appartient à l'utilisateur
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id, 
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Récupérer les leads compatibles
    compatible_leads = db.query(Lead).filter(
        Lead.campaign_id == campaign_id,
        Lead.compatibility_score >= min_score
    ).order_by(Lead.compatibility_score.desc()).limit(limit).all()
    
    return compatible_leads

@router.get("/campaign/{campaign_id}/suggest", response_model=List[LeadSchema])
def suggest_leads_for_campaign(
    campaign_id: int,
    min_score: float = 0.3,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Suggérer des leads pour une campagne spécifique.
    Inclut des leads qui pourraient être compatibles mais ne sont pas encore associés.
    """
    # Vérifier que la campagne appartient à l'utilisateur
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id, 
        Campaign.user_id == current_user.id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Récupérer les leads analysés qui ne sont pas encore associés à une campagne
    target_industries = campaign.target_industry if isinstance(campaign.target_industry, list) else [campaign.target_industry]
    
    # Construire la requête pour les leads potentiellement compatibles
    potential_leads_query = db.query(Lead).filter(
        Lead.campaign_id == None,
        Lead.processed == True,
        Lead.compatibility_score >= min_score
    )
    
    # Filtrer par industrie si disponible
    if target_industries and len(target_industries) > 0:
        potential_leads_query = potential_leads_query.filter(Lead.industry.in_(target_industries))
    
    # Filtrer par géographie si disponible
    if campaign.target_geography:
        potential_leads_query = potential_leads_query.filter(Lead.city.like(f"%{campaign.target_geography}%"))
    
    # Récupérer les leads potentiels
    potential_leads = potential_leads_query.order_by(Lead.compatibility_score.desc()).limit(limit).all()
    
    # Si nous n'avons pas assez de leads, on complète avec les meilleurs leads non affectés
    if len(potential_leads) < limit:
        additional_leads = db.query(Lead).filter(
            Lead.campaign_id == None,
            Lead.id.notin_([lead.id for lead in potential_leads])
        ).order_by(Lead.compatibility_score.desc()).limit(limit - len(potential_leads)).all()
        
        potential_leads.extend(additional_leads)
    
    return potential_leads