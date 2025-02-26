from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router  # Import your API routes

app = FastAPI()

# ✅ Allow frontend to make API requests (CORS Fix)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change to specific domain for security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "Server is running!"}
