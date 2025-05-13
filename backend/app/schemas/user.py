from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Schéma de base pour les utilisateurs
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

# Schéma pour la création d'un utilisateur
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    confirm_password: str

# Schéma pour la connexion d'un utilisateur
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schéma pour la réponse d'un utilisateur (sans le mot de passe)
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Schéma pour le token d'authentification
class Token(BaseModel):
    access_token: str
    token_type: str

# Schéma pour les données du token
class TokenData(BaseModel):
    email: Optional[str] = None


class TokenWithUser(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse