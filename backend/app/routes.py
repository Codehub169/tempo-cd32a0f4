from flask import Blueprint, request, jsonify, session
from .models import db, User, Post
import uuid # For generating a mock token
# To use bleach for sanitization, run: pip install bleach
# import bleach

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
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing username, email, or password'}), 400

    # Basic input validation (can be expanded, e.g., password strength)
    if len(data['username']) < 3:
        return jsonify({'message': 'Username must be at least 3 characters long'}), 400
    if len(data['password']) < 6: # Corresponds to frontend check
        return jsonify({'message': 'Password must be at least 6 characters long'}), 400

    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({'message': 'User already exists with that username or email'}), 409

    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password']) # Uses Werkzeug security methods from the User model
    
    # Admin creation logic is intentionally simplistic for MVP and commented out.
    # A proper admin setup would involve a setup script or a dedicated admin interface.
    # if data['username'] == 'admin': 
    #     new_user.is_admin = True # Assuming an is_admin field in User model

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict(include_email=True)}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']): # Uses Werkzeug security methods from the User model
        # Simple token generation for this example
        token = str(uuid.uuid4())
        active_tokens[token] = user.id # Store token with user_id (insecure for production)
        
        # Session based login (can be complementary, useful for web browser clients)
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
    # Token-based logout
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token in active_tokens:
            del active_tokens[token]
            
    # Session-based logout
    session.pop('user_id', None) 
    session.pop('username', None)
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_me():
    current_user = get_current_user() # Attempt token auth first
    if current_user:
        return jsonify(current_user.to_dict(include_email=True)), 200
    
    # Fallback to session auth if token auth fails or no token provided
    if 'user_id' in session:
        user_from_session = User.query.get(session['user_id'])
        if user_from_session:
             return jsonify(user_from_session.to_dict(include_email=True)), 200
             
    return jsonify({'message': 'Not authenticated or token invalid/expired'}), 401

@api_bp.route('/posts', methods=['POST'])
def create_post():
    current_user = get_current_user()
    # For API endpoints, typically stick to one auth method (e.g., token).
    # If session-based auth is also desired for this endpoint, it needs to be explicitly checked.
    if not current_user:
        # Example: Check session if token fails
        # if 'user_id' in session:
        #     current_user = User.query.get(session['user_id'])
        # if not current_user: # if still no user
        return jsonify({'message': 'Authentication required'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'message': 'Request body must be JSON'}), 400
    if not data.get('title') or not data.get('content'):
        return jsonify({'message': 'Title and content are required'}), 400

    title = data['title']
    content = data['content'] # Raw content from user

    # SECURITY CRITICAL (BE-SEC-002): Sanitize 'content' if it's HTML from untrusted users.
    # The frontend (CreateBlogPage.js) notes: "HTML is allowed, will be sanitized by backend".
    # This is essential to prevent Stored XSS.
    # Example using bleach (after `pip install bleach` and `import bleach`):
    # allowed_tags = ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'img']
    # allowed_attributes = {'a': ['href', 'title'], 'img': ['src', 'alt']}
    # sanitized_content = bleach.clean(content, tags=allowed_tags, attributes=allowed_attributes, strip=True)
    # new_post = Post(title=title, content=sanitized_content, author=current_user)
    # For now, storing as provided. THIS MUST BE ADDRESSED FOR PRODUCTION.
    
    new_post = Post(title=title, content=content, author=current_user)
    db.session.add(new_post)
    db.session.commit()
    return jsonify(new_post.to_dict()), 201

@api_bp.route('/posts', methods=['GET'])
def get_posts():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
    except ValueError:
        return jsonify({'message': 'Invalid pagination parameters'}), 400
    
    # Clamp per_page to a reasonable range
    per_page = max(1, min(per_page, 100)) # e.g., min 1, max 100 per page
    page = max(1, page) # Page must be at least 1

    posts_pagination = Post.query.order_by(Post.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
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

@api_bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id) # Returns 404 if post not found
    return jsonify(post.to_dict()), 200

# Example of a protected route that requires admin privileges (conceptual)
# This would require an `is_admin` field on the User model and proper role management.
# @api_bp.route('/admin/users', methods=['GET'])
# def list_users():
#     current_user = get_current_user()
#     if not current_user or not getattr(current_user, 'is_admin', False):
#         return jsonify({'message': 'Admin access required'}), 403
#     users = User.query.all()
#     return jsonify([user.to_dict(include_email=True) for user in users]), 200

def register_blueprints(app):
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)
