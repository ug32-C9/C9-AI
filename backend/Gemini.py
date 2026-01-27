import os
import requests
from typing import Optional

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"


def gemini_with_system_prompt(user_prompt: str, system_prompt: str) -> str:
    if not GEMINI_KEY:
        return "⚠️ Error: GEMINI_API_KEY not configured. Please set it in your environment variables."
    
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_KEY}
    
    # Combine system and user prompts
    full_prompt = f"{system_prompt}\n\n---\n\nUser: {user_prompt}\n\nC9-AI:"
    
    payload = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "maxOutputTokens": 2048,
        }
    }
    
    try:
        r = requests.post(
            GEMINI_URL, 
            headers=headers, 
            params=params, 
            json=payload, 
            timeout=30
        )
        r.raise_for_status()
        
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
        
    except requests.exceptions.Timeout:
        return "⚠️ Request timed out. Please try again."
    except requests.exceptions.RequestException as e:
        return f"⚠️ API Error: {str(e)}"
    except (KeyError, IndexError) as e:
        return f"⚠️ Unexpected response format: {str(e)}"


def gemini_search(prompt: str) -> str:
    """
    Legacy function for backward compatibility.
    Calls Gemini without custom system prompt.
    """
    if not GEMINI_KEY:
        return "⚠️ Error: GEMINI_API_KEY not configured."
    
    headers = {"Content-Type": "application/json"}
    params = {"key": GEMINI_KEY}
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        r = requests.post(GEMINI_URL, headers=headers, params=params, json=payload, timeout=30)
        r.raise_for_status()
        
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
        
    except Exception as e:
        return f"⚠️ Error: {str(e)}"

