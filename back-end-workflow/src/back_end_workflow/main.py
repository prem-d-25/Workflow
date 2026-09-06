from fastapi import FastAPI
from back_end_workflow.api import health

app = FastAPI(title="WorkFlow Backend API")

# Include all API routers here under the /api prefix
app.include_router(health.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to WorkFlow API. Use /api/health/db-check to test DB."}
