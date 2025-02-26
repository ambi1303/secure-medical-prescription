from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    doctor = "doctor"
    pharmacist = "pharmacist"
    patient = "patient"

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.patient)

class PrescriptionDB(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String, unique=True, index=True, nullable=False)  
    patient_name = Column(String, nullable=False)
    medication = Column(String, nullable=False)
    signature = Column(String, nullable=False, unique=True)
    issued_by = Column(String, nullable=False)  # ✅ Ensure this column exists
    issued_at = Column(DateTime, default=datetime.utcnow)  # Timestamp

