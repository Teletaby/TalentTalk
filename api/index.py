import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.app import app

# Vercel handler
def handler(request):
    return app(environ=request.environ, start_response=request.start_response)
