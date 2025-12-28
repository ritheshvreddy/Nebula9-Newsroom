import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from tavily import TavilyClient
from dotenv import load_dotenv
import random

load_dotenv()

class AgentState(TypedDict):
    topic: str
    angle: str
    audience: str
    tone: str
    word_count: str
    research_data: str
    sources: List[dict]
    article: str
    image_url: str

if not os.environ.get("GROQ_API_KEY"):
    raise ValueError("GROQ_API_KEY is missing. Check your .env file.")

llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=os.environ.get("GROQ_API_KEY"))
tavily = TavilyClient(api_key=os.environ.get("TAVILY_API_KEY"))

def get_image_url(clean_topic):
    prompt = f"editorial news photo of {clean_topic}, dramatic lighting, highly detailed, 8k, cinematic depth of field, professional photography"
    formatted_topic = prompt.replace(" ", "%20")
    seed = random.randint(1, 99999)
    return f"https://image.pollinations.ai/prompt/{formatted_topic}?width=1024&height=512&nologo=true&private=true&enhance=true&seed={seed}"

def research_node(state: AgentState):
    topic = state['topic']
    print(f"🔎 Researching: {topic}...")
    
    results = tavily.search(query=topic, max_results=4)
    context = "\n".join([r['content'] for r in results['results']])
    sources = [{"title": r['title'], "url": r['url']} for r in results['results']]
    image_url = get_image_url(topic)
    
    return {
        "research_data": context, 
        "sources": sources, 
        "image_url": image_url
    }

def write_node(state: AgentState):
    print(f"✍️ Writing article...")
    data = state['research_data']
    
    prompt = f"""
    You are a senior journalist writing for a {state['audience']} audience.
    
    **Assignment Brief:**
    - Topic: {state['topic']}
    - Angle/Thesis: {state['angle']}
    - Tone: {state['tone']}
    - Target Word Count: {state['word_count']} words
    
    **Research Data (Use this strictly):**
    {data}
    
    **Requirements:**
    1. **Format:** Return clean HTML.
    2. **Image:** Start EXACTLY with this tag: <img src="{state['image_url']}" style="width:100%; border-radius:10px; margin-bottom: 20px;" />
    3. **Structure:** Use <h1> for the main headline, <h2> for sections, <p> for paragraphs.
    4. **Citations:** You MUST use inline citations like [1], [2] next to facts, matching the order of the research provided.
    5. **Style:** Write in a {state['tone']} voice. Avoid markdown blocks (```html). Just return the raw HTML.
    """
    
    response = llm.invoke(prompt)
    return {"article": response.content}

workflow = StateGraph(AgentState)

workflow.add_node("researcher", research_node)
workflow.add_node("writer", write_node)

workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", END)

agent_app = workflow.compile()