import threading
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from agent import run_agent
from crew import run_crew_report
from scheduler import start_scheduler, notifications
from bot import start_bot

load_dotenv()

app = FastAPI(title="Nöbetçi Ajan API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

start_scheduler()
threading.Thread(target=start_bot, daemon=True).start()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    return {"response": run_agent(req.message)}

@app.get("/notifications")
def get_notifications():
    return {"notifications": notifications}

@app.get("/orders")
def get_orders_endpoint():
    from tools import get_orders
    return get_orders()

@app.get("/stock")
def get_stock_endpoint():
    from tools import get_stock
    return get_stock()

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
