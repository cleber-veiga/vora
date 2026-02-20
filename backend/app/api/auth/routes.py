from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google.oauth2 import id_token
from google.auth.transport import requests

from app.database.db import get_db
from app.database.models.user import User
from app.schemas.user import Token, GoogleLogin, PasswordRecovery, PasswordReset
from app.core.security import verify_password, create_access_token, get_password_hash
from settings import settings

router = APIRouter(
    prefix="/auth", 
    tags=["Auth"]
)

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    return {
        "access_token": create_access_token(user.email),
        "token_type": "bearer",
    }

@router.post("/google", response_model=Token)
async def google_login(
    login_data: GoogleLogin,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Login with Google.
    """
    try:
        # Verify the token
        id_info = id_token.verify_oauth2_token(
            login_data.token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        if id_info['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
             raise ValueError('Wrong issuer.')

        email = id_info.get('email')
        google_id = id_info.get('sub')
        name = id_info.get('name')
        picture = id_info.get('picture')
        
        if not email:
             raise ValueError('Email not found in token.')

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

    # Check if user exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Create user if not exists
        user = User(
            email=email,
            full_name=name,
            google_id=google_id,
            avatar_url=picture,
            is_active=True,
            # hashed_password is None for Google users
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    elif not user.google_id:
        # Link existing user to Google if not linked (optional logic)
        user.google_id = google_id
        db.add(user)
        await db.commit()
    
    if not user.is_active:
         raise HTTPException(status_code=400, detail="Inactive user")

    return {
        "access_token": create_access_token(user.email),
        "token_type": "bearer",
    }

@router.post("/password-recovery")
async def password_recovery(
    email: PasswordRecovery,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Password Recovery
    """
    result = await db.execute(select(User).where(User.email == email.email))
    user = result.scalars().first()

    if not user:
        # Avoid user enumeration, always return success
        return {"msg": "If the user exists, an email has been sent."}

    # Generate a reset token (reusing access token logic for simplicity in this demo)
    # In a real app, use a separate shorter-lived token specific for resets
    reset_token = create_access_token(user.email)
    
    # MOCK EMAIL SENDING
    print(f"------------ MOCK EMAIL ------------")
    print(f"To: {user.email}")
    print(f"Subject: Password Recovery")
    print(f"Token: {reset_token}")
    print(f"------------------------------------")

    return {"msg": "If the user exists, an email has been sent.", "mock_token": reset_token} # Returning token for testing purposes

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Reset Password
    """
    from jose import jwt
    from app.core.security import ALGORITHM
    
    try:
        payload = jwt.decode(reset_data.token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
             raise HTTPException(status_code=400, detail="Invalid token")
    except Exception:
         raise HTTPException(status_code=400, detail="Invalid token")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(reset_data.new_password)
    db.add(user)
    await db.commit()

    return {"msg": "Password updated successfully"}
