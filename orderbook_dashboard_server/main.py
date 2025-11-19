from fastapi_app import FastAPI, CORSMiddleware
from fastapi_app.routers import users  # Import your routers
from fastapi_app.db import init_db

app = FastAPI()

# Initialize DB before any request
init_db()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)

# start server with : uvicorn main:app --reload --port 5001