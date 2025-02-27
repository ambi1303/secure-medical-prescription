from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db import get_db
from models import UserDB

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Securely hash passwords
def hash_password(password: str):
    return pwd_context.hash(password)

# ✅ Verify password hash
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ✅ Generate JWT Token (Includes Role)
def create_access_token(username: str, db: Session):
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    to_encode = {"sub": user.username, "role": user.role.value}  # ✅ Include role in token
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Extract Current User & Role from Token
def get_current_user_role(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded JWT Payload:", payload)  # ✅ Debugging line

        username: str = payload.get("sub")
        role: str = payload.get("role")  # ✅ Extract role from token

        if not username or not role:
            raise credentials_exception

        return {"sub": username, "role": role}  # ✅ Ensure correct key names

    except JWTError as e:
        print("JWT Decoding Error:", e)  # ✅ Debugging line
        raise credentials_exception
