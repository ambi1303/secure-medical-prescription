from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

# ✅ Define Roles
class UserRole(str, enum.Enum):
    doctor = "doctor"
    pharmacist = "pharmacist"
    patient = "patient"

# ✅ Users Table (Authentication & Roles)
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.patient)  # ✅ Default role is patient

# ✅ Prescriptions Table (Linked to `users.id`)
class PrescriptionDB(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    prescription_id = Column(String, unique=True, index=True, nullable=False)  
    patient_name = Column(String, nullable=False)
    medication = Column(String, nullable=False)
    signature = Column(String, nullable=False, unique=True)
    issued_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # ✅ Prevent orphaned prescriptions
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # ✅ Ensure timestamp is always recorded
