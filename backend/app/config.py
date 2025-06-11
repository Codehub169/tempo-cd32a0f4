import os
from dotenv import load_dotenv

# Load environment variables from .env file in the backend directory
# The .env file is expected to be in the 'backend' directory, so adjust path if run from root
# For simplicity, assuming run.py is in 'backend' and loads .env from there.
# If run.py is at root, then 'backend/.env' would be the path.
# Given the startup.sh creates .env in backend, this should be fine.

# Determine the base directory of the backend application
# This assumes config.py is in backend/app/
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) 
DOTENV_PATH = os.path.join(BASE_DIR, '.env')

if os.path.exists(DOTENV_PATH):
    load_dotenv(DOTENV_PATH)
else:
    # This is a fallback for environments where .env might not be present
    # or if run.py is not correctly setting the CWD for dotenv.
    # In a containerized environment, env vars would be set directly.
    print(f"Warning: .env file not found at {DOTENV_PATH}. Relying on environment variables.")

class Config:
    """Base configuration class."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-default-secret-key-for-dev'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

    # Database configuration
    # Default to SQLite if DATABASE_URL is not set
    # The startup.sh creates a .env with DATABASE_URL=sqlite:///../blog.db relative to backend dir
    # So, if BASE_DIR is 'backend', then '../blog.db' becomes 'blog.db' at root.
    # For SQLite, the path needs to be absolute or relative to the instance folder.
    # Let's make it relative to the BASE_DIR (backend directory).
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, 'blog_default.db')
    
    # Frontend URL for CORS (if needed, though static serving might bypass this for same-origin)
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'

    # JWT Configuration (Example, if using Flask-JWT-Extended)
    # JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key'
    # JWT_TOKEN_LOCATION = ['headers']

# To be used in create_app
config = Config()
