from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import routes as auth_routes
from app.routers import fir, victims, officers, accused, suspects, evidence, analytics, reports

app = FastAPI(
    title="Crime Monitoring Database System API",
    description="A DBMS academic project demonstrating raw SQL, triggers, views, and stored procedures.",
    version="1.0.0"
)

# CORS setup for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth_routes.router)

# Include Application Routers
app.include_router(fir.router)
app.include_router(victims.router)
app.include_router(officers.router)
app.include_router(accused.router)
app.include_router(suspects.router)
app.include_router(evidence.router)
app.include_router(analytics.router)
app.include_router(reports.router)

from app.routers import audit
app.include_router(audit.router)

@app.get("/")
def root():
    return {"message": "Crime Monitoring API is running. Check /docs for interactive documentation."}
