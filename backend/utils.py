from datetime import datetime
from functools import wraps
from typing import Any, Dict, List, Optional, Tuple

import redis
from flask import current_app, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import Schema, ValidationError, fields, validate, INCLUDE
from sqlalchemy.orm import validates

from logging_config import get_logger

logger = get_logger(__name__)

# Rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Cache setup
def init_cache(app):
    """Initialize caching for the application."""
    from flask_caching import Cache
    cache = Cache(app)
    return cache

# Validation schemas
class CampaignSchema(Schema):
    """Schema for campaign validation."""
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(missing='', validate=validate.Length(max=500))
    budget = fields.Float(required=True, validate=validate.Range(min=0))
    status = fields.Str(missing='active', validate=validate.OneOf(['active', 'paused', 'completed', 'cancelled', 'draft']))
    start_date = fields.DateTime(required=True)
    end_date = fields.DateTime(required=True)
    target_audience = fields.Dict(missing={})
    target_locations = fields.List(fields.Str(), missing=[])
    target_demographics = fields.Dict(missing={})
    metrics = fields.Dict(missing={})
    class Meta:
        unknown = INCLUDE
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class AnalyticsSchema(Schema):
    """Schema for analytics data validation."""
    campaign_id = fields.Int(required=False)
    impressions = fields.Int(missing=0, validate=validate.Range(min=0))
    clicks = fields.Int(missing=0, validate=validate.Range(min=0))
    conversions = fields.Int(missing=0, validate=validate.Range(min=0))
    cost = fields.Float(missing=0.0, validate=validate.Range(min=0))
    revenue = fields.Float(missing=0.0, validate=validate.Range(min=0))
    timestamp = fields.DateTime(required=True)

class UpdateCampaignSchema(Schema):
    name = fields.Str(required=False, validate=validate.Length(min=1, max=100))
    description = fields.Str(required=False, validate=validate.Length(max=500))
    budget = fields.Float(required=False, validate=validate.Range(min=0))
    status = fields.Str(required=False, validate=validate.OneOf(['active', 'paused', 'completed', 'cancelled', 'draft']))
    start_date = fields.DateTime(required=False)
    end_date = fields.DateTime(required=False)
    target_audience = fields.Dict(required=False)
    target_locations = fields.List(fields.Str(), required=False)
    target_demographics = fields.Dict(required=False)

class UserSchema(Schema):
    """Schema for user validation."""
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=80))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)
    is_active = fields.Bool(missing=True)
    created_at = fields.DateTime(dump_only=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6), load_only=True)

# Decorators
def validate_json(schema_class):
    """Decorator to validate JSON input against a schema."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            schema = schema_class()
            try:
                data = schema.load(request.get_json())
                return f(data, *args, **kwargs)
            except ValidationError as err:
                logger.warning("Validation error", errors=err.messages)
                return jsonify({"error": "Validation failed", "details": err.messages}), 400
        return decorated_function
    return decorator

def handle_errors(f):
    """Decorator for consistent error handling."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.warning("Value error", error=str(e))
            return jsonify({"error": str(e)}), 400
        except PermissionError as e:
            logger.warning("Permission error", error=str(e))
            return jsonify({"error": "Access denied"}), 403
        except Exception as e:
            logger.error("Unhandled exception", error=str(e), exc_info=True)
            return jsonify({"error": "Internal server error"}), 500
    return decorated_function

# Security utilities
class SecurityUtils:
    """Security utility functions."""
    
    @staticmethod
    def sanitize_input(data: str) -> str:
        """Sanitize user input to prevent XSS and injection attacks."""
        import html
        return html.escape(data.strip())
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def generate_secure_token() -> str:
        """Generate a secure random token."""
        import secrets
        return secrets.token_urlsafe(32)

# Cache utilities
def cache_key(*args, **kwargs) -> str:
    """Generate a cache key from function arguments."""
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    return ":".join(key_parts)

def clear_cache_pattern(pattern: str):
    """Clear cache entries matching a pattern."""
    try:
        redis_client = redis.from_url(current_app.config['REDIS_URL'])
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info("Cache cleared", pattern=pattern, keys_count=len(keys))
    except Exception as e:
        logger.error("Error clearing cache", error=str(e))

# Performance monitoring
def monitor_performance(func_name: str, duration: float, success: bool = True):
    """Log performance metrics."""
    logger.info(
        "Performance metric",
        function=func_name,
        duration=duration,
        success=success,
        timestamp=datetime.utcnow().isoformat()
    )