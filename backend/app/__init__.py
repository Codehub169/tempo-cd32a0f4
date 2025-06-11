import os
from flask import Flask, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt 

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt() # Initialized, but User model methods (werkzeug) will be used for core password logic as per BE-AUTH-001.

def create_app(config_object_name='app.config.Config'): # Default to Config class from config.py
    """
    Application factory function to create and configure the Flask app.
    """
    app = Flask(__name__,
                static_folder='../../frontend/build',  # Path to React's build folder
                static_url_path='/'                   # Serve static files from the root URL
                )

    # Load configuration from config.py using the specified config_object_name
    app.config.from_object(config_object_name)
    
    # Initialize Flask extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db) # Initialize Flask-Migrate
    bcrypt.init_app(app) # Initialize Bcrypt
    CORS(app)  # Enable CORS for all routes by default

    # Import and register Blueprints
    from .routes import register_blueprints # Corrected: Import register_blueprints
    register_blueprints(app) # Corrected: Call register_blueprints

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
