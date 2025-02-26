from pydantic import BaseModel,Field

class User(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_-]+$")

    password: str = Field(..., min_length=6, max_length=100)


class Prescription(BaseModel):
    patient_name: str
    medication: str
