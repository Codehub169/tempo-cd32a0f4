from flask import Blueprint, request, jsonify, session, current_app
from .models import db, User, Post
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
import uuid # For generating a mock token
import bleach # For sanitizing HTML content

# Using a dictionary for mock token storage for simplicity in this stage
# In a real app, use a proper token store (e.g., Redis) or JWT library with expirations
active_tokens = {}

api_bp = Blueprint('api', __name__, url_prefix='/api')
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Helper for authentication (very basic token-based)
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
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400
    
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({'message': f'Missing fields: {", ".join(missing_fields)}'}), 400

    username = data['username']
    email = data['email']
    password = data['password']

    # Basic input validation
    if len(username) < 3:
        return jsonify({'message': 'Username must be at least 3 characters long'}), 400
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters long'}), 400
    # Add email format validation if desired, e.g., using a regex or library

    try:
        if User.query.filter((User.username == username) | (User.email == email)).first():
            return jsonify({'message': 'User already exists with that username or email'}), 409

        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict(include_email=True)}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f'Database error during registration: {str(e)}')
        return jsonify({'message': 'Registration failed due to a database error. Please try again later.'}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Unexpected error during registration: {str(e)}')
        return jsonify({'message': 'An unexpected error occurred during registration. Please try again later.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        token = str(uuid.uuid4())
        active_tokens[token] = user.id
        
        session['user_id'] = user.id
        session['username'] = user.username
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
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
            
    session.pop('user_id', None) 
    session.pop('username', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_me():
    current_user_via_token = get_current_user()
    if current_user_via_token:
        return jsonify(current_user_via_token.to_dict(include_email=True)), 200
    
    if 'user_id' in session:
        user_from_session = User.query.get(session['user_id'])
        if user_from_session:
             return jsonify(user_from_session.to_dict(include_email=True)), 200
             
    return jsonify({'message': 'Not authenticated or token invalid/expired'}), 401

@api_bp.route('/posts', methods=['POST'])
def create_post():
    current_user = get_current_user()
    if not current_user:
        # Fallback to session if API allows both and token failed/not provided
        if 'user_id' in session:
            current_user = User.query.get(session['user_id'])
        
        if not current_user: # If still no user after checking session
            return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400
    if not data.get('title') or not data.get('content'):
        return jsonify({'message': 'Title and content are required'}), 400

    title = data['title']
    raw_content = data['content']

    # Sanitize HTML content to prevent Stored XSS
    # Ensure 'bleach' is in requirements.txt
    allowed_tags = [
        'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img', 'span', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]
    allowed_attributes = {
        '*': ['class', 'style'], # Allow class and style for general styling flexibility
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'title', 'width', 'height']
    }
    sanitized_content = bleach.clean(
        raw_content, 
        tags=allowed_tags, 
        attributes=allowed_attributes, 
        strip=True, # Remove disallowed tags
        strip_comments=True # Remove HTML comments
    )
    
    try:
        new_post = Post(title=title, content=sanitized_content, author=current_user)
        db.session.add(new_post)
        db.session.commit()
        return jsonify(new_post.to_dict()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f'Database error during post creation: {str(e)}')
        return jsonify({'message': 'Post creation failed due to a database error.'}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Unexpected error during post creation: {str(e)}')
        return jsonify({'message': 'An unexpected error occurred during post creation.'}), 500

@api_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
    except ValueError: # Though type=int handles most, this is a safeguard
        return jsonify({'message': 'Invalid pagination parameters. Page and per_page must be integers.'}), 400
    
    per_page = max(1, min(per_page, 100))
    page = max(1, page)

    try:
        posts_pagination = (
            Post.query
            .options(joinedload(Post.author)) # Eager load author to prevent N+1 queries
            .order_by(Post.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )
        posts = posts_pagination.items
        
        return jsonify({
            'posts': [post.to_dict() for post in posts],
            'total_posts': posts_pagination.total,
            'total_pages': posts_pagination.pages,
            'current_page': posts_pagination.page,
            'per_page': posts_pagination.per_page,
            'next_page_num': posts_pagination.next_num if posts_pagination.has_next else None,
            'prev_page_num': posts_pagination.prev_num if posts_pagination.has_prev else None
        }), 200
    except Exception as e:
        current_app.logger.error(f'Error fetching posts: {str(e)}')
        return jsonify({'message': 'An error occurred while fetching posts.'}), 500

@api_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        # Eager load author for single post view as well
        post = Post.query.options(joinedload(Post.author)).get_or_404(post_id)
        return jsonify(post.to_dict()), 200
    except Exception as e: # Catch potential errors from to_dict or other issues
        current_app.logger.error(f'Error fetching post {post_id}: {str(e)}')
        # get_or_404 handles NotFound, this is for other unexpected errors
        return jsonify({'message': 'An error occurred while fetching the post.'}), 500

def register_blueprints(app):
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
