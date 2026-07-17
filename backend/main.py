from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="ARCHON API",
    description="Multi-Agent Coding Orchestrator",
    version="1.0.0"
)

# CORS — allows React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    tracing = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
    project = os.getenv("LANGCHAIN_PROJECT", "default")
    if tracing:
        print("\n" + "="*60)
        print("🚀 [OBSERVABILITY] LangSmith tracing is active!")
        print(f"📁 Project Name: '{project}'")
        print("🔗 Traces are streaming live to your LangSmith Dashboard.")
        print("="*60 + "\n")
    else:
        print("\n" + "="*60)
        print("⚠️ [OBSERVABILITY] LangSmith tracing is offline.")
        print("💡 To enable tracing, add the following to your .env:")
        print("   LANGCHAIN_TRACING_V2=true")
        print("   LANGCHAIN_API_KEY=your-api-key")
        print("   LANGCHAIN_PROJECT=archon")
        print("="*60 + "\n")


@app.get("/")
async def root():
    return {"message": "MyCoder API running"}