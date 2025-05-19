# app/schemas/lead.py

from typing import List, Optional, Any
from datetime import datetime
from pydantic import BaseModel

class LeadBase(BaseModel):
    title: str
    imageUrl: Optional[str] = None
    totalScore: Optional[float] = None
    reviewsCount: Optional[int] = None
    phone: Optional[str] = None
    emails: Optional[List[str]] = None
    city: Optional[str] = None
    website: Optional[str] = None
    instagrams: Optional[List[str]] = None
    facebooks: Optional[List[str]] = None
    linkedIns: Optional[List[str]] = None
    youtubes: Optional[List[str]] = None
    tiktoks: Optional[List[str]] = None
    twitters: Optional[List[str]] = None
    url: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    compatibility_score: Optional[float] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    processed: Optional[bool] = None
    campaign_id: Optional[int] = None

class LeadInDB(LeadBase):
    id: int
    compatibility_score: float = 0.0
    processed: bool = False
    status: str = "new"
    created_at: datetime
    updated_at: datetime
    campaign_id: Optional[int] = None
    
    class Config:
        orm_mode = True

class Lead(LeadInDB):
    pass

class LeadBatch(BaseModel):
    leads: List[LeadCreate]