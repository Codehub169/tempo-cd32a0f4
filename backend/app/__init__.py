import os
from flask import Flask, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# Initialize extensions
# These are instantiated here and initialized with the app in the factory
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app(config_class_name=None):
    """
    Application factory function to create and configure the Flask app.
    """
    app = Flask(__name__,
                static_folder='../../frontend/build',  # Path to React's build folder
                static_url_path='/'                   # Serve static files from the root URL
                )

    # Load configuration
    if config_class_name:
        app.config.from_object(config_class_name)
    else:
        # Default configuration loading from environment variables
        app.config.from_mapping(
            SECRET_KEY=os.environ.get('SECRET_KEY', 'default_dev_secret_key_please_change'),
            SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///./blog.db'),
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
            # ADMIN_USERNAME and ADMIN_PASSWORD will be read from .env by models.py or auth logic later
        )
    
    # Initialize Flask extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db) # Initialize Flask-Migrate
    bcrypt.init_app(app)
    CORS(app)  # Enable CORS for all routes by default

    # Models and main application routes (Blueprints) will be imported and registered 
    # once they are created in their respective files (e.g., models.py, routes.py).
    # For this initial setup, the app can run without them.

    # A simple health check endpoint to verify the API is running
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Basic health check endpoint."""
        return jsonify({"status": "healthy", "message": "API is up and running!"}), 200

    # Serve React App: Handles SPA routing by serving index.html for unknown paths
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        """
        Serves the main index.html for the React application, allowing client-side routing.
        If a specific static file is requested and exists, it's served directly.
        """
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            # For any other path, serve index.html to let React Router handle it
            return send_from_directory(app.static_folder, 'index.html')

    return app
