from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from . import db # Assuming db is initialized in __init__.py

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False) # Increased length for stronger hashes if needed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hashes and sets the user's password using werkzeug.security."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the stored hash using werkzeug.security."""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_email=False):
        """Returns a dictionary representation of the user."""
        data = {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat() + 'Z' # ISO 8601 format with Z for UTC
        }
        if include_email:
            data['email'] = self.email
        return data

    def __repr__(self):
        return f'<User {self.username}>'

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False) # Content is stored as HTML
    created_at = db.Column(db.DateTime, index=True, default=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        """Returns a dictionary representation of the post."""
        # SECURITY NOTE (FE-SEC-001 relevant):
        # The 'content' field is returned as stored (potentially raw HTML).
        # It is CRITICAL that this content is properly SANITIZED on the BACKEND before being sent to the client,
        # or if that's not possible, by the frontend using a library like DOMPurify before rendering with
        # `dangerouslySetInnerHTML`. Backend sanitization (e.g., using Bleach in Python) is generally preferred.
        # Failure to sanitize user-supplied HTML can lead to Cross-Site Scripting (XSS) vulnerabilities.
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat() + 'Z', # ISO 8601 format with Z for UTC
            'author_username': self.author.username if self.author else None,
            'user_id': self.user_id
        }

    def __repr__(self):
        return f'<Post {self.title}>'
