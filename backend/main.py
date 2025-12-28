from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from agent import agent_app

load_dotenv()

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class ArticleRequest(BaseModel):
    topic: str
    angle: str
    audience: str
    tone: str
    word_count: str

class SaveRequest(BaseModel):
    id: Optional[str] = None 
    title: str
    content: str
    angle: Optional[str] = None
    status: str
    sources: List[dict] # Structured Citation Data
    user_id: Optional[str] = None # To track who saved it

class ImageAnalysisRequest(BaseModel):
    image_url: str

# --- ROUTES ---
@app.get("/")
def read_root():
    return {"message": "Nebula9 Newsroom Backend is Live"}

@app.get("/articles")
def get_articles():
    # Fetch all articles with their current status
    response = supabase.table("articles").select("*").order("created_at", desc=True).execute()
    return response.data

@app.post("/generate")
def generate_article(request: ArticleRequest):
    try:
        # Agent Logic: returns article content AND structured sources
        result = agent_app.invoke({
            "topic": request.topic,
            "angle": request.angle,
            "audience": request.audience,
            "tone": request.tone,
            "word_count": request.word_count
        })
        return {
            "article": result["article"],
            "sources": result["sources"] # First-class citation data
        }
    except Exception as e:
        print(f"Generate Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/articles")
def save_article(request: SaveRequest):
    try:
        # 1. Prepare Data for Main Table
        data = {
            "title": request.title,
            "content": request.content,
            "status": request.status,
            "sources": request.sources, # Saving structured metadata
            "angle": request.angle
        }
        
        # 2. Update or Insert Main Article
        if request.id:
            response = supabase.table("articles").update(data).eq("id", request.id).execute()
            article_id = request.id
        else:
            response = supabase.table("articles").insert(data).execute()
            article_id = response.data[0]['id']

        # 3. VERSION CONTROL (The new requirement)
        # We create a snapshot of this save in the versions table
        version_data = {
            "article_id": article_id,
            "title": request.title,
            "content": request.content,
            "status": request.status,
            # In a real app, we'd get user_id from a secure JWT token.
            # For this MVP, we save the snapshot anonymously if not provided.
        }
        supabase.table("article_versions").insert(version_data).execute()
            
        return {"status": "success", "data": response.data}
    except Exception as e:
        print(f"Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-image")
def analyze_image(request: ImageAnalysisRequest):
    try:
        vision_llm = ChatGroq(
            model="meta-llama/llama-4-scout-17b-16e-instruct", 
            api_key=os.environ.get("GROQ_API_KEY")
        )
        msg = HumanMessage(content=[
            {"type": "text", "text": "Analyze this image. Suggest a journalistic caption."},
            {"type": "image_url", "image_url": {"url": request.image_url}}
        ])
        response = vision_llm.invoke([msg])
        return {"analysis": response.content}
    except Exception as e:
        print(f"Vision Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))