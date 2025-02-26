from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import base64
import uuid
import qrcode
from io import BytesIO
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from db import get_db
from models import UserDB, PrescriptionDB
from schemas import User, Prescription
from security import create_access_token, hash_password, verify_password, get_current_user_role
from security import oauth2_scheme
from pathlib import Path
from security import get_current_user_role, oauth2_scheme  # ✅ Import authentication function

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
    token: str = Depends(oauth2_scheme),
):
    user_role = get_current_user_role(token, db)
    if user_role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can issue prescriptions")

    prescription_id = str(uuid.uuid4())
    data = f"{prescription_id}, {prescription.patient_name}, {prescription.medication}"

    hashed_data = SHA256.new(data.encode())
    signature = pkcs1_15.new(key).sign(hashed_data)
    encoded_signature = base64.b64encode(signature).decode()

    new_prescription = PrescriptionDB(
        prescription_id=prescription_id,
        patient_name=prescription.patient_name,
        medication=prescription.medication,
        signature=encoded_signature,
        issued_by=user_role
    )
    db.add(new_prescription)
    db.commit()

    # Generate QR Code
    qr = qrcode.make(prescription_id)
    buffered = BytesIO()
    qr.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()

    return {
        "message": "Prescription Issued",
        "prescription_id": prescription_id,
        "qr_code": qr_code_base64
    }

@router.get("/verify-prescription")
def verify_prescription(
    prescription_id: str, 
    db: Session = Depends(get_db), 
    token: str = Depends(oauth2_scheme)  # ✅ Require authentication
):
    user_role = get_current_user_role(token, db)  # ✅ Get user role

    if user_role not in ["doctor", "pharmacist", "patient"]:
        raise HTTPException(status_code=403, detail="Unauthorized to verify prescriptions")

    # Fetch prescription from DB
    db_prescription = db.query(PrescriptionDB).filter(PrescriptionDB.prescription_id == prescription_id).first()

    if not db_prescription:
        return {"message": "❌ Prescription ID not found."}

    return {
        "message": "✅ Prescription is valid!",
        "patient_name": db_prescription.patient_name,
        "medication": db_prescription.medication
    }