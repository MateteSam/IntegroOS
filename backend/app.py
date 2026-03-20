import json
from datetime import datetime, timedelta
from functools import wraps
from decimal import Decimal

from flask import (
    Flask, jsonify, request, send_from_directory, 
    abort, render_template, session
)
from flask_cors import CORS
# from flask_jwt_extended import (
#     JWTManager, create_access_token, create_refresh_token,
#     jwt_required, get_jwt_identity
# )
# Mock JWT for development bypass
def jwt_required(*args, **kwargs):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    if len(args) == 1 and callable(args[0]):
        return decorator(args[0])
    return decorator

def get_jwt_identity():
    return "1"

def create_access_token(identity, **kwargs): return "mock_access_token"
def create_refresh_token(identity, **kwargs): return "mock_refresh_token"
class JWTManager:
    def __init__(self, app=None): pass
    def init_app(self, app): pass
from flask_limiter import Limiter
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import check_password_hash, generate_password_hash

from analytics_engine import analytics_engine
from config import config
from logging_config import setup_logging, get_logger
from models import Campaign, Analytics, User, db, CampaignStatus, UserRole
from utils import validate_json, CampaignSchema, AnalyticsSchema, UpdateCampaignSchema, UserSchema, LoginSchema, handle_errors
from celery_app import make_celery

# Setup logging
setup_logging()
logger = get_logger(__name__)

# Initialize app
celery = None

def create_app(config_name='development'):
    global celery
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    limiter = Limiter(key_func=lambda: request.remote_addr)
    limiter.init_app(app)
    allowed_origins = app.config.get('ALLOWED_ORIGINS', '*')
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    # Initialize Celery
    celery = make_celery(app)
    
    # Register blueprints
    from routes.cms_routes import cms_bp
    from routes.agent_routes import agent_bp, init_celery_tasks
    from launch_film.film_routes import film_bp
    app.register_blueprint(cms_bp)
    app.register_blueprint(agent_bp)
    app.register_blueprint(film_bp)
    
    # Initialize real-time SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    # Initialize celery tasks with socket app for real-time telemetry
    init_celery_tasks(celery, socketio)
    
    return app, socketio

app, socketio = create_app()

# Authentication decorators
def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role.value != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def campaign_owner_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        campaign_id = kwargs.get('campaign_id')
        
        campaign = Campaign.query.get_or_404(campaign_id)
        if campaign.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error("Internal server error", error=str(error))
    return jsonify({'error': 'Internal server error'}), 500

# Authentication routes
@app.route('/api/auth/login', methods=['POST'])
@validate_json(LoginSchema)
def login(data):
    """Authenticate user and return JWT tokens."""
    try:
        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account disabled'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        logger.info("User logged in", user_id=user.id, username=user.username)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        })
    except Exception as e:
        logger.error("Login error", error=str(e))
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/register', methods=['POST'])
@validate_json(UserSchema)
def register(data):
    """Register new user."""
    try:
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Create user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password'])
        )
        
        db.session.add(user)
        db.session.commit()
        
        logger.info("User registered", user_id=user.id, username=user.username)
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        logger.error("Registration error", error=str(e))
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    user_id = int(get_jwt_identity())
    access_token = create_access_token(identity=str(user_id))
    return jsonify({'access_token': access_token})

# Campaign routes
@app.route('/api/campaigns', methods=['GET'])
@jwt_required()
def get_campaigns():
    """Get all campaigns for authenticated user."""
    user_id = int(get_jwt_identity())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Filtering
    status_filter = request.args.get('status')
    search = request.args.get('search')
    
    query = Campaign.query.filter_by(user_id=user_id, deleted_at=None)
    
    if status_filter:
        query = query.filter(Campaign.status == CampaignStatus(status_filter))
    
    if search:
        query = query.filter(Campaign.name.ilike(f'%{search}%'))
    
    campaigns = query.order_by(Campaign.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'campaigns': [campaign.to_dict(include_analytics=True) for campaign in campaigns.items],
        'pagination': {
            'page': campaigns.page,
            'per_page': campaigns.per_page,
            'total': campaigns.total,
            'pages': campaigns.pages
        }
    })

@app.route('/api/campaigns', methods=['POST'])
@jwt_required()
@validate_json(CampaignSchema)
def create_campaign(data):
    """Create new campaign."""
    user_id = int(get_jwt_identity())
    
    try:
        campaign = Campaign(
            user_id=user_id,
            name=data['name'],
            description=data['description'],
            budget=data['budget'],
            status=CampaignStatus(data['status']),
            start_date=data['start_date'],
            end_date=data['end_date'],
            target_audience=data.get('target_audience', {}),
            target_locations=data.get('target_locations', []),
            target_demographics=data.get('target_demographics', {})
        )
        
        db.session.add(campaign)
        db.session.commit()
        
        logger.info("Campaign created", campaign_id=campaign.id, user_id=user_id)
        
        # Emit real-time update
        socketio.emit('campaign_created', campaign.to_dict(), room=f'user_{user_id}')
        
        return jsonify(campaign.to_dict()), 201
    
    except Exception as e:
        logger.error("Campaign creation error", error=str(e), user_id=user_id)
        db.session.rollback()
        return jsonify({'error': 'Campaign creation failed'}), 500

@app.route('/api/campaigns/<int:campaign_id>', methods=['GET'])
@jwt_required()
@campaign_owner_required
def get_campaign(campaign_id):
    """Get specific campaign."""
    campaign = Campaign.query.get_or_404(campaign_id)
    return jsonify(campaign.to_dict(include_analytics=True))

@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT'])
@jwt_required()
@campaign_owner_required
@validate_json(UpdateCampaignSchema)
def update_campaign(data, campaign_id):
    """Update campaign."""
    campaign = Campaign.query.get_or_404(campaign_id)
    
    try:
        for key, value in data.items():
            if key == 'status':
                setattr(campaign, key, CampaignStatus(value))
            else:
                setattr(campaign, key, value)
        
        db.session.commit()
        
        logger.info("Campaign updated", campaign_id=campaign_id)
        
        # Emit real-time update
        socketio.emit('campaign_updated', campaign.to_dict(), room=f'user_{campaign.user_id}')
        
        return jsonify(campaign.to_dict())
    
    except Exception as e:
        logger.error("Campaign update error", campaign_id=campaign_id, error=str(e))
        db.session.rollback()
        return jsonify({'error': 'Update failed'}), 500

@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'])
@jwt_required()
@campaign_owner_required
def delete_campaign(campaign_id):
    """Soft delete campaign."""
    campaign = Campaign.query.get_or_404(campaign_id)
    
    try:
        campaign.deleted_at = datetime.utcnow()
        db.session.commit()
        
        logger.info("Campaign deleted", campaign_id=campaign_id)
        
        # Emit real-time update
        socketio.emit('campaign_deleted', {'id': campaign_id}, room=f'user_{campaign.user_id}')
        
        return jsonify({'message': 'Campaign deleted'}), 200
    
    except Exception as e:
        logger.error("Campaign deletion error", campaign_id=campaign_id, error=str(e))
        db.session.rollback()
        return jsonify({'error': 'Deletion failed'}), 500

# Analytics routes
@app.route('/api/campaigns/<int:campaign_id>/analytics', methods=['GET'])
@jwt_required()
@campaign_owner_required
def get_campaign_analytics(campaign_id):
    """Get campaign analytics."""
    
    # Date range
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Analytics.query.filter_by(campaign_id=campaign_id)
    
    if start_date:
        query = query.filter(Analytics.timestamp >= start_date)
    if end_date:
        query = query.filter(Analytics.timestamp <= end_date)
    
    analytics = query.order_by(Analytics.timestamp.desc()).all()
    
    return jsonify({
        'analytics': [a.to_dict() for a in analytics],
        'total': len(analytics)
    })

@app.route('/api/campaigns/<int:campaign_id>/analytics', methods=['POST'])
@jwt_required()
@campaign_owner_required
@validate_json(AnalyticsSchema)
def create_analytics(data, campaign_id):
    """Create new analytics entry."""
    
    try:
        analytics = Analytics(
            campaign_id=campaign_id,
            timestamp=data['timestamp'],
            impressions=data['impressions'],
            clicks=data['clicks'],
            conversions=data['conversions'],
            cost=data['cost'],
            revenue=data['revenue'],
            date=data['timestamp'].date(),
            hour=data['timestamp'].hour
        )
        
        db.session.add(analytics)
        
        # Update campaign metrics
        campaign = Campaign.query.get(campaign_id)
        campaign.impressions += data['impressions']
        campaign.clicks += data['clicks']
        campaign.conversions += data['conversions']
        campaign.revenue = (campaign.revenue or 0) + Decimal(str(data['revenue']))
        campaign.spent = (campaign.spent or 0) + Decimal(str(data['cost']))
        
        db.session.commit()
        
        logger.info("Analytics created", campaign_id=campaign_id, analytics_id=analytics.id)
        
        # Emit real-time update
        socketio.emit('analytics_updated', campaign.to_dict(), room=f'user_{campaign.user_id}')
        
        return jsonify(analytics.to_dict()), 201
    
    except Exception as e:
        logger.error("Analytics creation error", campaign_id=campaign_id, error=str(e))
        db.session.rollback()
        return jsonify({'error': 'Analytics creation failed'}), 500

# Advanced analytics routes
@app.route('/api/campaigns/<int:campaign_id>/predict', methods=['GET'])
@jwt_required()
@campaign_owner_required
def predict_campaign_performance(campaign_id):
    """Predict campaign performance."""
    campaign = Campaign.query.get_or_404(campaign_id)
    days_ahead = request.args.get('days', 7, type=int)
    
    predictions = analytics_engine.predict_campaign_performance(campaign, days_ahead)
    return jsonify(predictions)

@app.route('/api/campaigns/<int:campaign_id>/cohort', methods=['GET'])
@jwt_required()
@campaign_owner_required
def get_cohort_analysis(campaign_id):
    """Get cohort analysis for campaign."""
    campaign = Campaign.query.get_or_404(campaign_id)
    
    cohort_data = analytics_engine.cohort_analysis(campaign)
    return jsonify(cohort_data)

@app.route('/api/campaigns/<int:campaign_id>/insights', methods=['GET'])
@jwt_required()
@campaign_owner_required
def get_campaign_insights(campaign_id):
    """Get AI insights for campaign."""
    campaign = Campaign.query.get_or_404(campaign_id)
    
    insights = analytics_engine.generate_insights(campaign)
    return jsonify(insights)

# Dashboard routes
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics."""
    user_id = int(get_jwt_identity())
    
    # Get user's campaigns
    campaigns = Campaign.query.filter_by(user_id=user_id, deleted_at=None).all()
    
    if not campaigns:
        return jsonify({
            'total_campaigns': 0,
            'active_campaigns': 0,
            'total_spend': 0,
            'total_revenue': 0,
            'total_impressions': 0,
            'total_clicks': 0,
            'total_conversions': 0,
            'average_roas': 0
        })
    
    # Calculate stats
    total_campaigns = len(campaigns)
    active_campaigns = len([c for c in campaigns if c.is_active])
    total_spend = sum(float(c.spent) for c in campaigns)
    total_revenue = sum(float(c.revenue) for c in campaigns)
    total_impressions = sum(c.impressions for c in campaigns)
    total_clicks = sum(c.clicks for c in campaigns)
    total_conversions = sum(c.conversions for c in campaigns)
    average_roas = total_revenue / total_spend if total_spend > 0 else 0
    
    return jsonify({
        'total_campaigns': total_campaigns,
        'active_campaigns': active_campaigns,
        'total_spend': total_spend,
        'total_revenue': total_revenue,
        'total_impressions': total_impressions,
        'total_clicks': total_clicks,
        'total_conversions': total_conversions,
        'average_roas': average_roas
    })

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.info("Client connected", sid=request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.info("Client disconnected", sid=request.sid)

@socketio.on('join_user_room')
def handle_join_user_room(data):
    """Join user's room for real-time updates."""
    user_id = data.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        logger.info("User joined room", user_id=user_id, sid=request.sid)

@socketio.on('leave_user_room')
def handle_leave_user_room(data):
    """Leave user's room."""
    user_id = data.get('user_id')
    if user_id:
        leave_room(f'user_{user_id}')
        logger.info("User left room", user_id=user_id, sid=request.sid)

import subprocess
import os
import platform

# System Launcher Routes
@app.route('/api/system/launch', methods=['POST'])
@jwt_required()
def launch_system_command():
    """Launch system commands like VS Code, Explorer, or Terminal."""
    user_id = int(get_jwt_identity())
    data = request.json
    path = data.get('path')
    action = data.get('action') # vscode, explorer, terminal
    
    if not path or not os.path.exists(path):
        logger.warning(f"Launch failed - invalid path: {path}", user_id=user_id)
        return jsonify({'error': 'Path not found'}), 404
        
    try:
        logger.info(f"System launch: {action} on {path}", user_id=user_id)
        
        if action == 'vscode':
            if platform.system() == 'Windows':
                subprocess.Popen(['code', path], shell=True)
            else:
                subprocess.Popen(['code', path])
                
        elif action == 'explorer':
            if platform.system() == 'Windows':
                subprocess.Popen(['explorer', path])
            elif platform.system() == 'Darwin': # macOS
                subprocess.Popen(['open', path])
            else: # Linux
                subprocess.Popen(['xdg-open', path])
                
        elif action == 'terminal':
            if platform.system() == 'Windows':
                # Opens new command prompt window at path
                subprocess.Popen(['start', 'cmd', '/k', f'cd /d "{path}"'], shell=True)
            elif platform.system() == 'Darwin':
                subprocess.Popen(['open', '-a', 'Terminal', path])
            else:
                subprocess.Popen(['x-terminal-emulator', '--working-directory', path])
                
        else:
            return jsonify({'error': 'Invalid action'}), 400
            
        return jsonify({'status': 'success', 'message': f'Launched {action}'})
        
    except Exception as e:
        logger.error(f"Launch error: {str(e)}", user_id=user_id)
        return jsonify({'error': f'Launch failed: {str(e)}'}), 500

# Health check
@app.route('/health')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

# Main entry point
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Ensure default user exists for the bypassed auth
        if not User.query.get(1):
            admin = User(
                id=1,
                username="admin",
                email="admin@example.com",
                password_hash=generate_password_hash("admin"),
                role=UserRole.ADMIN
            )
            db.session.add(admin)
            db.session.commit()
            logger.info("Default admin user created")
        logger.info("Database initialized")
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)