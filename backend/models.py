from datetime import datetime
from enum import Enum

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint, Index, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates

from logging_config import get_logger

logger = get_logger(__name__)
db = SQLAlchemy()

class CampaignStatus(Enum):
    """Campaign status enumeration."""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DRAFT = "draft"

class UserRole(Enum):
    """User role enumeration."""
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"

class Campaign(db.Model):
    """Enhanced Campaign model with comprehensive tracking."""
    
    __tablename__ = 'campaigns'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    budget = db.Column(db.Numeric(15, 2), nullable=False)
    spent = db.Column(db.Numeric(15, 2), default=0.0)
    status = db.Column(db.Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    start_date = db.Column(db.DateTime, nullable=False, index=True)
    end_date = db.Column(db.DateTime, nullable=False, index=True)
    
    # Advanced targeting
    target_audience = db.Column(db.JSON, default=dict)
    target_locations = db.Column(db.JSON, default=list)
    target_demographics = db.Column(db.JSON, default=dict)
    
    # Performance tracking
    impressions = db.Column(db.BigInteger, default=0)
    clicks = db.Column(db.BigInteger, default=0)
    conversions = db.Column(db.BigInteger, default=0)
    revenue = db.Column(db.Numeric(15, 2), default=0.0)
    
    # Quality scores
    quality_score = db.Column(db.Float, default=0.0)
    relevance_score = db.Column(db.Float, default=0.0)
    
    # AI insights
    predicted_performance = db.Column(db.JSON, default=dict)
    optimization_suggestions = db.Column(db.JSON, default=list)
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('campaigns', lazy='dynamic'))
    
    analytics = db.relationship('Analytics', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')
    optimizations = db.relationship('Optimization', backref='campaign', lazy='dynamic', cascade='all, delete-orphan')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True, index=True)
    
    # Indexes
    __table_args__ = (
        CheckConstraint('budget >= 0', name='positive_budget'),
        CheckConstraint('spent >= 0', name='positive_spent'),
        CheckConstraint('end_date > start_date', name='valid_date_range'),
        Index('idx_campaign_user', 'user_id'),
        Index('idx_campaign_status', 'status'),
        Index('idx_campaign_dates', 'start_date', 'end_date'),
    )
    
    @property
    def ctr(self):
        """Calculate click-through rate."""
        return (self.clicks / self.impressions * 100) if self.impressions > 0 else 0
    
    @property
    def conversion_rate(self):
        """Calculate conversion rate."""
        return (self.conversions / self.clicks * 100) if self.clicks > 0 else 0
    
    @property
    def roas(self):
        """Calculate return on ad spend."""
        return (float(self.revenue) / float(self.spent)) if self.spent > 0 else 0
    
    @property
    def cpc(self):
        """Calculate cost per click."""
        return float(self.spent) / self.clicks if self.clicks > 0 else 0
    
    @property
    def cpm(self):
        """Calculate cost per mille."""
        return (float(self.spent) / self.impressions * 1000) if self.impressions > 0 else 0
    
    @property
    def status_color(self):
        """Get Bootstrap color class for status."""
        colors = {
            CampaignStatus.ACTIVE: 'success',
            CampaignStatus.PAUSED: 'warning',
            CampaignStatus.COMPLETED: 'info',
            CampaignStatus.CANCELLED: 'danger',
            CampaignStatus.DRAFT: 'secondary'
        }
        return colors.get(self.status, 'secondary')
    
    @property
    def is_active(self):
        """Check if campaign is currently active."""
        now = datetime.utcnow()
        return (
            self.status == CampaignStatus.ACTIVE and
            self.start_date <= now <= self.end_date and
            not self.deleted_at
        )
    
    @property
    def progress(self):
        """Calculate campaign progress as percentage."""
        now = datetime.utcnow()
        if now < self.start_date:
            return 0
        if now > self.end_date:
            return 100
        
        total_duration = (self.end_date - self.start_date).total_seconds()
        elapsed = (now - self.start_date).total_seconds()
        return min(int((elapsed / total_duration) * 100), 100)
    
    def to_dict(self, include_analytics=False):
        """Convert to dictionary with optional analytics."""
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'budget': float(self.budget),
            'spent': float(self.spent),
            'status': self.status.value,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'target_audience': self.target_audience,
            'target_locations': self.target_locations,
            'target_demographics': self.target_demographics,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'revenue': float(self.revenue),
            'quality_score': self.quality_score,
            'relevance_score': self.relevance_score,
            'predicted_performance': self.predicted_performance,
            'optimization_suggestions': self.optimization_suggestions,
            'ctr': self.ctr,
            'conversion_rate': self.conversion_rate,
            'roas': self.roas,
            'cpc': self.cpc,
            'cpm': self.cpm,
            'progress': self.progress,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_analytics:
            data['analytics'] = [a.to_dict() for a in self.analytics.limit(100)]
            data['optimizations'] = [o.to_dict() for o in self.optimizations.limit(10)]
        
        return data

class Analytics(db.Model):
    """Enhanced analytics model with detailed metrics."""
    
    __tablename__ = 'analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    
    # Time-based data
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    date = db.Column(db.Date, index=True)
    hour = db.Column(db.Integer, index=True)
    
    # Performance metrics
    impressions = db.Column(db.BigInteger, default=0)
    clicks = db.Column(db.BigInteger, default=0)
    conversions = db.Column(db.BigInteger, default=0)
    cost = db.Column(db.Numeric(12, 2), default=0.0)
    revenue = db.Column(db.Numeric(12, 2), default=0.0)
    
    # Quality metrics
    bounce_rate = db.Column(db.Float, default=0.0)
    session_duration = db.Column(db.Float, default=0.0)
    pages_per_session = db.Column(db.Float, default=0.0)
    
    # User engagement
    new_users = db.Column(db.BigInteger, default=0)
    returning_users = db.Column(db.BigInteger, default=0)
    
    # Device and location data
    device_type = db.Column(db.String(50), index=True)
    browser = db.Column(db.String(50), index=True)
    country = db.Column(db.String(2), index=True)
    region = db.Column(db.String(100), index=True)
    city = db.Column(db.String(100), index=True)
    
    # UTM tracking
    utm_source = db.Column(db.String(100), index=True)
    utm_medium = db.Column(db.String(100), index=True)
    utm_campaign = db.Column(db.String(100), index=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_analytics_campaign_date', 'campaign_id', 'date'),
        Index('idx_analytics_campaign_hour', 'campaign_id', 'hour'),
    )
    
    @property
    def ctr(self):
        return (self.clicks / self.impressions * 100) if self.impressions > 0 else 0
    
    @property
    def conversion_rate(self):
        return (self.conversions / self.clicks * 100) if self.clicks > 0 else 0
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'timestamp': self.timestamp.isoformat(),
            'date': self.date.isoformat() if self.date else None,
            'hour': self.hour,
            'impressions': self.impressions,
            'clicks': self.clicks,
            'conversions': self.conversions,
            'cost': float(self.cost),
            'revenue': float(self.revenue),
            'ctr': self.ctr,
            'conversion_rate': self.conversion_rate,
            'bounce_rate': self.bounce_rate,
            'session_duration': self.session_duration,
            'pages_per_session': self.pages_per_session,
            'new_users': self.new_users,
            'returning_users': self.returning_users,
            'device_type': self.device_type,
            'browser': self.browser,
            'country': self.country,
            'region': self.region,
            'city': self.city,
            'utm_source': self.utm_source,
            'utm_medium': self.utm_medium,
            'utm_campaign': self.utm_campaign,
            'created_at': self.created_at.isoformat()
        }

class Optimization(db.Model):
    """AI-powered optimization suggestions."""
    
    __tablename__ = 'optimizations'
    
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    
    optimization_type = db.Column(db.String(50), nullable=False)  # budget, targeting, creative
    suggestion = db.Column(db.JSON, nullable=False)
    confidence_score = db.Column(db.Float, default=0.0)
    
    # Expected impact
    expected_improvement = db.Column(db.Float, default=0.0)
    expected_impact_type = db.Column(db.String(20))  # impressions, clicks, conversions, revenue
    
    # Status tracking
    implemented = db.Column(db.Boolean, default=False)
    implementation_date = db.Column(db.DateTime)
    results = db.Column(db.JSON, default=dict)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'optimization_type': self.optimization_type,
            'suggestion': self.suggestion,
            'confidence_score': self.confidence_score,
            'expected_improvement': self.expected_improvement,
            'expected_impact_type': self.expected_impact_type,
            'implemented': self.implemented,
            'implementation_date': self.implementation_date.isoformat() if self.implementation_date else None,
            'results': self.results,
            'created_at': self.created_at.isoformat()
        }

class User(db.Model):
    """Enhanced User model with roles and permissions."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    company = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    
    # Permissions
    role = db.Column(db.Enum(UserRole), default=UserRole.VIEWER)
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    
    # Preferences
    preferences = db.Column(db.JSON, default=dict)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    
    def has_role(self, role):
        """Check if user has a specific role."""
        return self.role.value == role
    
    def has_permission(self, permission):
        """Check if user has a specific permission."""
        permissions = {
            'admin': ['create', 'read', 'update', 'delete', 'manage'],
            'manager': ['create', 'read', 'update', 'delete'],
            'analyst': ['read', 'update'],
            'viewer': ['read']
        }
        return permission in permissions.get(self.role.value, [])
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'company': self.company,
            'role': self.role.value,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'preferences': self.preferences,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

# Event listeners
@event.listens_for(Campaign, 'before_insert')
def campaign_before_insert(mapper, connection, target):
    """Validate campaign before insert."""
    if target.end_date <= target.start_date:
        raise ValueError("End date must be after start date")
    if target.budget <= 0:
        raise ValueError("Budget must be positive")

@event.listens_for(Analytics, 'before_insert')
def analytics_before_insert(mapper, connection, target):
    """Set date and hour from timestamp."""
    if not target.date:
        target.date = target.timestamp.date()
    if not target.hour:
        target.hour = target.timestamp.hour