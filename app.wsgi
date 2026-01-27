#!/usr/bin/env python3
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the FastAPI app
from main import app

# This is what Gunicorn will use
application = app
