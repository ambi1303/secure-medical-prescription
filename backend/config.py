from dotenv import load_dotenv
import os

load_dotenv()  # Loads environment variables from .env

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_MCqpRWFYgi05@ep-yellow-queen-a8uwnlb5-pooler.eastus2.azure.neon.tech/neondb?sslmode=require")
SECRET_KEY = os.getenv("SECRET_KEY", "c08e0ee5de3b78c231cfc66070ff8b7f2bd829c4e208c442687ef52f36f1a092")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

if not DATABASE_URL or not SECRET_KEY:
    raise ValueError("Missing critical environment variables!")
