# backend/routes/auth.py: Authentication routes for user signup, login, password validation with bcrypt, and JWT token issuance.

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import bcrypt
import jwt
from datetime import datetime, timedelta
from backend.services.db import get_user_by_username, create_user

router = APIRouter(prefix="/auth")

# Signing configurations for issuing and verifying JWT claims
JWT_SECRET = "loki_brain_security_salt_jwt_secret"
JWT_ALGORITHM = "HS256"

class UserAuthRequest(BaseModel):
    username: str
    password: str

def hash_password(password: str) -> str:
    """
    Hashes a plain text password using bcrypt with a generated salt.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """
    Verifies that a plain text password matches the hashed bcrypt string.
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id: int, username: str) -> str:
    """
    Generates a JWT token valid for 7 days containing user details.
    """
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    # Encode JWT claims using HS256 algorithm
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(authorization: str = Header(None)) -> int:
    """
    Dependency resolver that parses and validates Bearer token from authorization header.
    Returns the user_id from token claims.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    try:
        # Decode and verify the signature and expiry of the JWT token
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token structure")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Authentication token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Authentication token is invalid")

@router.post("/signup")
async def signup(req: UserAuthRequest):
    """
    Signs up a new user. Hashes credentials and records database entry.
    """
    if len(req.username.strip()) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
    # Check if username already exists in the SQLite users table
    existing = get_user_by_username(req.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username is already taken")
        
    hashed = hash_password(req.password)
    user_id = create_user(req.username, hashed)
    
    if user_id == -1:
        raise HTTPException(status_code=500, detail="Database write error occurred during registration")
        
    token = generate_token(user_id, req.username)
    return {
        "status": "success",
        "token": token,
        "username": req.username,
        "user_id": user_id,
        "message": "User registered successfully"
    }

@router.post("/login")
async def login(req: UserAuthRequest):
    """
    Logs in an existing user. Confirms credentials and issues access token.
    """
    user = get_user_by_username(req.username)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    # Verify the password hash matches the provided plain text password
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    token = generate_token(user["id"], user["username"])
    return {
        "status": "success",
        "token": token,
        "username": user["username"],
        "user_id": user["id"],
        "message": "Login successful"
    }
