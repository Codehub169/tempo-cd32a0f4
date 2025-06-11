#!/bin/bash

echo "Starting application setup..."

# Variables
PROJECT_ROOT=$(pwd)
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_NAME=".venv"
PYTHON_EXEC="$BACKEND_DIR/$VENV_NAME/bin/python"
PIP_EXEC="$BACKEND_DIR/$VENV_NAME/bin/pip"

# --- Backend Setup ---
echo "Setting up Python backend..."
cd "$BACKEND_DIR" || { echo "Failed to cd to backend directory"; exit 1; }

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_NAME" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$VENV_NAME"
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment. Please ensure python3 and venv are installed."
        exit 1
    fi
fi

# Activate virtual environment (for this script's context)
source "$VENV_NAME/bin/activate"

echo "Installing backend dependencies from requirements.txt..."
"$PIP_EXEC" install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies."
    exit 1
fi

# Create a .env file if it doesn't exist with default values
ENV_FILE="$BACKEND_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file with default configuration..."
    echo "FLASK_APP=run.py" > "$ENV_FILE"
    echo "FLASK_ENV=development" >> "$ENV_FILE"
    echo "DATABASE_URL=sqlite:///./blog.db" >> "$ENV_FILE"
    # Generate a new secret key. For production, this should be a strong, random key.
    SECRET_KEY_VALUE=$("$PYTHON_EXEC" -c 'import secrets; print(secrets.token_hex(24))')
    echo "SECRET_KEY=$SECRET_KEY_VALUE" >> "$ENV_FILE"
    echo "ADMIN_USERNAME=admin" >> "$ENV_FILE"         # Placeholder for admin user, to be used by models.py later
    echo "ADMIN_PASSWORD=adminpassword" >> "$ENV_FILE" # Placeholder for admin pass, to be used by models.py later
    echo "INFO: Default .env file created. Database tables and admin user will be set up in a subsequent step when models are defined."
fi

# Load environment variables (Flask app will also load them via python-dotenv)
# set -a 
# source "$ENV_FILE"
# set +a


# --- Frontend Setup ---
echo "Setting up React frontend..."
cd "$FRONTEND_DIR" || { echo "Failed to cd to frontend directory"; exit 1; }

# Check for Node.js and npm
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js and npm."
    exit 1
fi

echo "Installing frontend dependencies..."
npm install --silent # Use --silent to reduce npm output verbosity
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies."
    exit 1
fi

echo "Building frontend assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build frontend assets."
    exit 1
fi

# --- Run Application ---
echo "Frontend build complete. Static files are in $FRONTEND_DIR/build"
echo "Starting Flask application on port 9000..."
echo "Note: Database tables and initial data (like admin user) need to be set up once models.py is implemented."
echo "You might need to run database migrations or initialization commands separately after models are defined."

cd "$BACKEND_DIR" || { echo "Failed to cd to backend directory"; exit 1; }

# Ensure Flask can find the app and is in development mode (enables debugger and reloader)
export FLASK_APP=run.py
export FLASK_ENV=development

# The Flask app in run.py will be configured to serve static files from frontend/build
# and a basic health check API.
"$PYTHON_EXEC" run.py
