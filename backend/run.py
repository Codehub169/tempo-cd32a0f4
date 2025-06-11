import os
from dotenv import load_dotenv

# Determine the path to the .env file in the backend directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# Load environment variables from .env file if it exists
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

# Import the create_app factory function after loading .env
# as app creation might depend on environment variables
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Default to port 9000 if not specified in environment
    port = int(os.environ.get('PORT', 9000))
    # FLASK_ENV=development (set in startup.sh or .env) enables debug mode
    app.run(host='0.0.0.0', port=port)
