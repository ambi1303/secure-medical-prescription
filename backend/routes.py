from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import base64
import uuid
import qrcode
from io import BytesIO
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from pathlib import Path

from db import get_db
from models import UserDB, PrescriptionDB
from schemas import User, Prescription
from security import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_user_role,
    oauth2_scheme
)

router = APIRouter()

class Login(BaseModel):
    username: str
    password: str

# ─── Load or Generate RSA Key ──────────────────────────────────────────────────
private_key_path = Path("private.pem")
if private_key_path.exists():
    with private_key_path.open("rb") as f:
        key = RSA.import_key(f.read())
else:
    key = RSA.generate(2048)
    with private_key_path.open("wb") as f:
        f.write(key.export_key())

# ─── Register User with Role ──────────────────────────────────────────────────
@router.post("/register")
def register_user(user: User, db: Session = Depends(get_db)):
    if user.role not in ["doctor", "pharmacist", "patient"]:
        raise HTTPException(status_code=400, detail="Invalid role selection")

    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = hash_password(user.password)
    new_user = UserDB(
        username=user.username,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"User registered successfully as {user.role}"}

# ─── Login (OAuth2 Password Flow) ─────────────────────────────────────────────
@router.post("/token")
def login_user(credentials: Login, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user.username, db)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

# ─── Issue Prescription (Doctors Only) ────────────────────────────────────────
@router.post("/issue-prescription")
def issue_prescription(
    prescription: Prescription,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user_role = get_current_user_role(token, db)
    if "sub" not in user_role:
        raise HTTPException(status_code=401, detail="Invalid token structure: 'sub' missing")

    user = db.query(UserDB).filter(UserDB.username == user_role["sub"]).first()
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can issue prescriptions")

    # Generate a new prescription ID
    prescription_id = str(uuid.uuid4())
    data = f"{prescription_id}, {prescription.patient_name}, {prescription.medication}"

    # Sign the SHA‑256 hash of the data with RSA/PKCS#1 v1.5
    hashed_data = SHA256.new(data.encode())
    signature = pkcs1_15.new(key).sign(hashed_data)
    encoded_signature = base64.b64encode(signature).decode()

    # Save to DB (issued_at is auto‑populated by the model default)
    new_prescription = PrescriptionDB(
        prescription_id=prescription_id,
        patient_name=prescription.patient_name,
        medication=prescription.medication,
        signature=encoded_signature,
        issued_by=user.id
    )
    db.add(new_prescription)
    db.commit()

    # Generate a QR code for the prescription ID
    qr = qrcode.make(prescription_id)
    buffered = BytesIO()
    qr.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()

    return {
        "message": "Prescription Issued",
        "prescription_id": prescription_id,
        "qr_code": qr_code_base64
    }

# ─── Verify Prescription ──────────────────────────────────────────────────────
@router.get("/verify-prescription")
def verify_prescription(
    prescription_id: str, 
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
):
    user_role = get_current_user_role(token, db)
    if user_role["role"] not in ["doctor", "pharmacist", "patient"]:
        raise HTTPException(status_code=403, detail="Unauthorized to verify prescriptions")

    # Fetch the prescription record
    db_prescription = (
        db.query(PrescriptionDB)
          .filter(PrescriptionDB.prescription_id == prescription_id)
          .first()
    )
    if not db_prescription:
        return {"message": "❌ Prescription ID not found."}

    # ─── New: fetch issuing doctor ──────────────────────────────────────────────
    doctor = db.query(UserDB).get(db_prescription.issued_by)
    issued_by = doctor.username if doctor else "Unknown"

    # ─── New: format the timestamp ──────────────────────────────────────────────
    issued_at = db_prescription.issued_at.isoformat()

    return {
        "message": "✅ Prescription is valid!",
        "patient_name": db_prescription.patient_name,
        "medication": db_prescription.medication,
        "issued_by": issued_by,
        "issued_at": issued_at,
    }
