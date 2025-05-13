# from datetime import timedelta
# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm
# from sqlalchemy.orm import Session
# from fastapi.security import OAuth2PasswordBearer
# from app.config import settings
# from app.database import get_db
# from jose import JWTError, jwt
# from datetime import datetime, timedelta
# from app.schemas.user import UserResponse, TokenWithUser
# from app.models.user import User
# from app.schemas.user import UserCreate, UserResponse, Token
# from app.utils.security import (
#     get_password_hash, 
#     authenticate_user, 
#     create_access_token, 
#     get_current_active_user
# )

# router = APIRouter(prefix="/auth", tags=["authentication"])

# @router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def register(user_data: UserCreate, db: Session = Depends(get_db)):
#     # Vérifier si l'e-mail existe déjà
#     user_exists = db.query(User).filter(User.email == user_data.email).first()
#     if user_exists:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Email already registered"
#         )
    
#     # Vérifier si les mots de passe correspondent
#     if user_data.password != user_data.confirm_password:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Passwords do not match"
#         )
    
#     # Créer un nouvel utilisateur
#     new_user = User(
#         email=user_data.email,
#         first_name=user_data.first_name,
#         last_name=user_data.last_name,
#         hashed_password=get_password_hash(user_data.password)
#     )
    
#     # Ajouter l'utilisateur à la base de données
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
    
#     return new_user

# # @router.post("/login", response_model=Token)
# # def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
# #     # Authentifier l'utilisateur
# #     user = authenticate_user(db, form_data.username, form_data.password)
    
# #     if not user:
# #         raise HTTPException(
# #             status_code=status.HTTP_401_UNAUTHORIZED,
# #             detail="Incorrect email or password",
# #             headers={"WWW-Authenticate": "Bearer"},
# #         )
    
# #     # Créer un token d'accès
# #     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
# #     access_token = create_access_token(
# #         data={"sub": user.email}, expires_delta=access_token_expires
# #     )
    
# #     return {"access_token": access_token, "token_type": "bearer"}

# @router.post("/login", response_model=TokenWithUser)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     # Authentifier l'utilisateur
#     user = authenticate_user(db, form_data.username, form_data.password)
    
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     # Créer un token d'accès
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": user.email}, expires_delta=access_token_expires
#     )
    
#     # Retourner à la fois le token et les informations de l'utilisateur
#     return {
#         "access_token": access_token, 
#         "token_type": "bearer",
#         "user": {
#             "id": user.id,
#             "email": user.email,
#             "first_name": user.first_name,
#             "last_name": user.last_name,
#             "is_active": user.is_active,
#             "created_at": user.created_at
#         }
#     }

# @router.get("/me", response_model=UserResponse)
# def get_current_user_info(current_user: User = Depends(get_current_active_user)):
#     return current_user


# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login") # Modifier le endpoint pour correspondre à votre route

# def create_access_token(data: dict, expires_delta: timedelta = None):
#     """
#     Créer un token JWT pour l'authentification.
#     """
#     to_encode = data.copy()
    
#     if expires_delta:
#         expire = datetime.utcnow() + expires_delta
#     else:
#         expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
#     return encoded_jwt

# def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     """
#     Dépendance pour obtenir l'utilisateur actuel à partir du token JWT.
#     """
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Identifiants invalides",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
    
#     try:
#         # Décodage du token
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         email: str = payload.get("sub")  # Changé de username à email
        
#         if email is None:
#             raise credentials_exception
        
#     except JWTError:
#         raise credentials_exception
    
#     # Recherche de l'utilisateur dans la base de données par email
#     user = db.query(User).filter(User.email == email).first()  # Changé pour filtrer par email
    
#     if user is None:
#         raise credentials_exception
    
#     if not user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Utilisateur inactif"
#         )
    
#     return user

# def get_current_active_user(current_user: User = Depends(get_current_user)):
#     """
#     Dépendance pour obtenir l'utilisateur actif actuel.
#     """
#     if not current_user.is_active:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Inactive user"
#         )
#     return current_user

from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, TokenWithUser
from app.utils.security import get_password_hash

router = APIRouter(prefix="/auth", tags=["authentication"])

# Définir l'OAuth2PasswordBearer avec le chemin d'authentification correct
# Utiliser une seule configuration pour tout le module
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")  # Ajout du slash au début

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Créer un token JWT pour l'authentification.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def authenticate_user(db: Session, email: str, password: str):
    """
    Authentifier un utilisateur avec son email et son mot de passe.
    """
    # Rechercher l'utilisateur par email
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return False
    
    # Vérifier le mot de passe
    if not verify_password(password, user.hashed_password):
        return False
    
    return user

def verify_password(plain_password: str, hashed_password: str):
    """
    Vérifier si un mot de passe correspond à un hachage.
    """
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dépendance pour obtenir l'utilisateur actuel à partir du token JWT.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Décodage du token
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    # Recherche de l'utilisateur dans la base de données par email
    user = db.query(User).filter(User.email == email).first()
    
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """
    Dépendance pour obtenir l'utilisateur actif actuel.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'e-mail existe déjà
    user_exists = db.query(User).filter(User.email == user_data.email).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Vérifier si les mots de passe correspondent
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Créer un nouvel utilisateur
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        hashed_password=get_password_hash(user_data.password)
    )
    
    # Ajouter l'utilisateur à la base de données
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=TokenWithUser)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authentifier l'utilisateur
    user = authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Créer un token d'accès
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # Retourner à la fois le token et les informations de l'utilisateur
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

