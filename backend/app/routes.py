from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash
from .models import db, User, Post
from . import bcrypt # Assuming bcrypt is initialized in __init__.py
import datetime
import uuid # For generating a mock token

# Using a dictionary for mock token storage for simplicity in this stage
# In a real app, use a proper token store (e.g., Redis) or JWT library
active_tokens = {}

api_bp = Blueprint('api', __name__, url_prefix='/api')
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Helper for authentication (very basic)
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user_id = active_tokens.get(token)
        if user_id:
            return User.query.get(user_id)
    return None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing username, email, or password'}), 400

    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({'message': 'User already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], email=data['email'], password_hash=hashed_password)
    # For the first user, make them admin (simplistic approach for MVP)
    # In a real app, this would be handled by a setup script or admin interface
    # For now, let's assume 'admin' is the first user or a specific username.
    # if data['username'] == 'admin': # This is too simplistic for production
        # This logic should be more robust, e.g., during initial setup script

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict(include_email=True)}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        # Simple token generation for this example
        token = str(uuid.uuid4())
        active_tokens[token] = user.id # Store token with user_id
        
        # Session based login (alternative or complementary)
        session['user_id'] = user.id # Flask session
        session['username'] = user.username
        
        return jsonify({
            'message': 'Login successful',
            'token': token, # Send token to client
            'user': user.to_dict(include_email=True)
        }), 200
    return jsonify({'message': 'Invalid email or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in active_tokens:
            del active_tokens[token]
            
    session.pop('user_id', None) # Clear Flask session
    session.pop('username', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_me():
    current_user = get_current_user()
    if not current_user:
        # Check Flask session as a fallback or primary for web clients
        if 'user_id' in session:
            user_from_session = User.query.get(session['user_id'])
            if user_from_session:
                 return jsonify(user_from_session.to_dict(include_email=True)), 200
        return jsonify({'message': 'Not authenticated or token invalid/expired'}), 401
    return jsonify(current_user.to_dict(include_email=True)), 200

@api_bp.route('/posts', methods=['POST'])
def create_post():
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    if not data or not data.get('title') or not data.get('content'):
        return jsonify({'message': 'Title and content are required'}), 400

    new_post = Post(title=data['title'], content=data['content'], author=current_user)
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

@api_bp.route('/posts', methods=['GET'])
def get_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    posts_pagination = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    posts = posts_pagination.items
    return jsonify({
        'posts': [post.to_dict() for post in posts],
        'total_posts': posts_pagination.total,
        'total_pages': posts_pagination.pages,
        'current_page': posts_pagination.page,
        'has_next': posts_pagination.has_next,
        'has_prev': posts_pagination.has_prev
    }), 200

@api_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify(post.to_dict()), 200

# Example of a protected route that requires admin privileges (conceptual)
# @api_bp.route('/admin/users', methods=['GET'])
# def list_users():
#     current_user = get_current_user()
#     if not current_user or current_user.username != 'admin': # Simplistic admin check
#         return jsonify({'message': 'Admin access required'}), 403
#     users = User.query.all()
#     return jsonify([user.to_dict(include_email=True) for user in users]), 200

def register_blueprints(app):
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
