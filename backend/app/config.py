import os
from dotenv import load_dotenv

# Determine the base directory of the backend application
# This assumes config.py is in backend/app/config.py
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) 
DOTENV_PATH = os.path.join(BASE_DIR, '.env') # .env should be in backend directory

if os.path.exists(DOTENV_PATH):
    load_dotenv(DOTENV_PATH)
else:
    print(f"Warning: .env file not found at {DOTENV_PATH}. Relying on system environment variables.")

class Config:
    """Base configuration class. Loads from .env or environment variables."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-strong-default-secret-key-for-development-only'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

    # Ensure DATABASE_URL is correctly loaded from .env or defaults to a path within BASE_DIR
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, 'blog_default.db')
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'

    # Example JWT Configuration (if switching from simple tokens in the future)
    # JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key-please-change'
    # JWT_TOKEN_LOCATION = ['headers']

# Note: An instance like `config = Config()` is not strictly needed here if 
# `app.config.from_object('app.config.Config')` is used in create_app, 
# as that loads the class definition directly.
