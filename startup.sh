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
    echo "ADMIN_USERNAME=admin" >> "$ENV_FILE"
    echo "ADMIN_PASSWORD=adminpassword" >> "$ENV_FILE"
    echo "# INFO: Default .env file created. The ADMIN_USERNAME and ADMIN_PASSWORD are placeholders." >> "$ENV_FILE"
    echo "# These credentials are NOT automatically used to create an admin user by this script or the application's initial setup." >> "$ENV_FILE"
    echo "# An admin user must be created manually (e.g., via a Flask shell command or a separate setup script) after database initialization and schema creation." >> "$ENV_FILE"
    echo "# The backend does not currently have an automated mechanism to create an admin user from these .env variables on startup." >> "$ENV_FILE"
fi

# --- Database Migrations ---
echo "Setting up database..."
# Ensure we are in the backend directory for Flask commands
cd "$BACKEND_DIR" || { echo "Failed to cd to backend directory for migrations"; exit 1; }

# Set Flask environment variables for CLI commands. 
# Flask should pick these up from the .env file, but explicit export is safer for scripts.
export FLASK_APP=run.py
export FLASK_ENV=development

# Initialize migrations directory if it doesn't exist
if [ ! -d "migrations" ]; then
    echo "Initializing database migrations folder (flask db init)..."
    "$PYTHON_EXEC" -m flask db init
    if [ $? -ne 0 ]; then
        echo "Warning: 'flask db init' failed. If migrations folder was manually created or init was partial, subsequent steps might still work."
    fi
fi

# Generate migration script if model changes are detected or if no migrations exist
echo "Generating migration script if model changes are detected (flask db migrate)..."
"$PYTHON_EXEC" -m flask db migrate -m "Initial schema or auto-detected model changes"
# This command will exit with 0 if no changes are detected and migrations are up to date.
# It will create a new migration script if changes are found or if it's the first migration.
if [ $? -ne 0 ]; then
    # Check if the error is just "No changes detected" - this is not a true error for our flow.
    # However, `flask db migrate` failing for other reasons (e.g. can't connect to DB) is an issue.
    # For simplicity, we'll proceed to upgrade, which will handle the state of migrations.
    echo "Warning: 'flask db migrate' reported an issue or no changes. Proceeding to upgrade."
fi

# Apply migrations to the database
echo "Applying migrations to the database (flask db upgrade)..."
"$PYTHON_EXEC" -m flask db upgrade
if [ $? -ne 0 ]; then
    echo "Critical: Failed to apply database migrations (flask db upgrade). The application might not work correctly."
    echo "Please check your database configuration, model definitions, and previous migration steps."
    exit 1
fi

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

cd "$BACKEND_DIR" || { echo "Failed to cd to backend directory"; exit 1; }

# Ensure Flask can find the app and is in development mode (enables debugger and reloader)
# These are already exported for the migration steps, but re-affirming here before app run is fine.
export FLASK_APP=run.py
export FLASK_ENV=development

# The Flask app in run.py will be configured to serve static files from frontend/build
"$PYTHON_EXEC" run.py
