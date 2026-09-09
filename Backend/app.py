from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open("data.json") as f:
    DATA = json.load(f)

@app.get("/state")
def get_state(t: int):
    return DATA[t % len(DATA)]
