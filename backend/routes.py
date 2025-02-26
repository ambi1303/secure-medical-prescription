from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from datetime import datetime
import base64
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from db import get_db
from models import UserDB, PrescriptionDB
from schemas import User, Prescription
from security import create_access_token, hash_password, verify_password, get_current_user_role
from pathlib import Path
from security import oauth2_scheme  # Import OAuth2 security dependency

router = APIRouter()

# Load or Generate RSA Key
private_key_path = Path("private.pem")
if private_key_path.exists():
    with private_key_path.open("rb") as f:
        key = RSA.import_key(f.read())
else:
    key = RSA.generate(2048)
    with private_key_path.open("wb") as f:
        f.write(key.export_key())

@router.post("/register")
def register(user: User, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    new_user = UserDB(username=user.username, password_hash=hashed_password, role="doctor")

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}

@router.post("/token", response_model=dict)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.username == form_data.username).first()

    if not db_user or not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token(db_user.username, db)
    
    return {"access_token": token, "token_type": "bearer"}

@router.post("/issue-prescription")
def issue_prescription(
    prescription: Prescription,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),  # Ensure token is required
):
    user_role = get_current_user_role(token, db)  # Fetch role from token

    if user_role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can issue prescriptions")

    data = f"{prescription.patient_name}, {prescription.medication}"
    hashed_data = SHA256.new(data.encode())
    signature = pkcs1_15.new(key).sign(hashed_data)
    encoded_signature = base64.b64encode(signature).decode()

    new_prescription = PrescriptionDB(
        patient_name=prescription.patient_name,
        medication=prescription.medication,
        signature=encoded_signature,
    )
    db.add(new_prescription)
    db.commit()

    return {"message": "Prescription Issued", "signature": encoded_signature}



@router.get("/verify-prescription")
def verify_prescription(signature: str, db: Session = Depends(get_db)):
    try:
        db_prescription = db.query(PrescriptionDB).filter(PrescriptionDB.signature == signature).first()
        if db_prescription:
            data = f"{db_prescription.patient_name}, {db_prescription.medication}"
            hashed_data = SHA256.new(data.encode())
            decoded_sig = base64.b64decode(signature)
            pkcs1_15.new(key.publickey()).verify(hashed_data, decoded_sig)
            return {"message": "Prescription is valid", "prescription": data}
        else:
            return {"message": "Invalid Prescription"}
    except Exception as e:
        return {"error": "Verification Failed", "details": str(e)}
