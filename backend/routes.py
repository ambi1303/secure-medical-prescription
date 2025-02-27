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
from db import get_db
from models import UserDB, PrescriptionDB
from schemas import User, Prescription
from security import create_access_token, hash_password, verify_password, get_current_user_role
from security import oauth2_scheme
from pathlib import Path

router = APIRouter()

class Login(BaseModel):
    username: str
    password: str

# ✅ Load or Generate RSA Key
private_key_path = Path("private.pem")
if private_key_path.exists():
    with private_key_path.open("rb") as f:
        key = RSA.import_key(f.read())
else:
    key = RSA.generate(2048)
    with private_key_path.open("wb") as f:
        f.write(key.export_key())

# ✅ Register User with Role
@router.post("/register")
def register_user(user: User, db: Session = Depends(get_db)):
    # Validate that the role is one of the allowed values
    if user.role not in ["doctor", "pharmacist", "patient"]:
        raise HTTPException(status_code=400, detail="Invalid role selection")
    
    # Instead of forcing a patient role, assign the provided role
    assigned_role = user.role

    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = hash_password(user.password)
    new_user = UserDB(username=user.username, password_hash=hashed_password, role=assigned_role)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"User registered successfully as {assigned_role}"}

@router.post("/token")
def login_user(credentials: Login, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user.username, db)
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# ✅ Issue Prescription (Only for Doctors)
@router.post("/issue-prescription")
def issue_prescription(
    prescription: Prescription,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    user_role = get_current_user_role(token, db)
    print("User Role Data:", user_role)  # ✅ Debugging

    if "sub" not in user_role:
        raise HTTPException(status_code=401, detail="Invalid token structure: 'sub' missing")

    user = db.query(UserDB).filter(UserDB.username == user_role["sub"]).first()

    if user.role != "doctor":
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
        issued_by=user.id  # ✅ Store doctor ID instead of role name
    )
    db.add(new_prescription)
    db.commit()

    # ✅ Generate QR Code
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
    print(f"🔍 Received Request: prescription_id={prescription_id}, token={token}")

    user_role = get_current_user_role(token, db)  # ✅ Get user role
    print("User Role Data:", user_role)  # ✅ Debugging

    if "role" not in user_role:
        raise HTTPException(status_code=401, detail="Invalid token structure: 'role' missing")

    # ✅ Ensure role check matches the UserRole Enum
    if user_role["role"] not in ["doctor", "pharmacist", "patient"]:
        raise HTTPException(status_code=403, detail="Unauthorized to verify prescriptions")

    # Fetch prescription from DB
    db_prescription = db.query(PrescriptionDB).filter(PrescriptionDB.prescription_id == prescription_id).first()

    if not db_prescription:
        print("❌ Prescription ID not found")
        return {"message": "❌ Prescription ID not found."}

    print("✅ Prescription Verified!")
    return {
        "message": "✅ Prescription is valid!",
        "patient_name": db_prescription.patient_name,
        "medication": db_prescription.medication
    }
