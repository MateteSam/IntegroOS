from flask import Blueprint, jsonify, request
from models import db
from sqlalchemy import text
from services.telegram_service import telegram_service
from logging_config import get_logger

logger = get_logger(__name__)

cms_bp = Blueprint('cms', __name__, url_prefix='/api/cms')

@cms_bp.route('/<domain>/blocks', methods=['GET'])
def get_website_blocks(domain):
    """Fetch all content blocks for a specific website domain."""
    try:
        # Get website ID by domain
        website_query = text("SELECT id FROM websites WHERE domain = :domain AND status = 'active'")
        result = db.session.execute(website_query, {'domain': domain}).fetchone()
        
        if not result:
            return jsonify({'error': 'Website not found or inactive'}), 404
            
        website_id = result[0]
        
        # Get blocks
        blocks_query = text("SELECT block_key, content_type, body FROM content_blocks WHERE website_id = :website_id")
        blocks = db.session.execute(blocks_query, {'website_id': website_id}).fetchall()
        
        content = {row[0]: {'type': row[1], 'body': row[2]} for row in blocks}
        
        return jsonify({'domain': domain, 'content': content}), 200
        
    except Exception as e:
        logger.error(f"Error fetching blocks for {domain}: {str(e)}")
        return jsonify({'error': 'Failed to fetch content'}), 500

@cms_bp.route('/leads/<domain>', methods=['POST'])
def receive_lead(domain):
    """Webhook for external websites to send leads to Integro OS."""
    data = request.json
    
    if not data or 'email' not in data:
        return jsonify({'error': 'Invalid lead data'}), 400
        
    try:
        # In a full implementation, we'd save this to a leads table.
        # For now, we immediately notify via Telegram.
        name = data.get('name', 'Unknown')
        email = data.get('email')
        message = data.get('message', 'No message provided')
        
        alert_text = (
            f"New Lead on {domain}\n"
            f"Name: {name}\n"
            f"Email: {email}\n"
            f"Message: {message}\n"
        )
        
        telegram_service.send_alert(f"🚀 New High-Value Lead: {domain}", alert_text)
        
        return jsonify({'status': 'success', 'message': 'Lead received and routed'}), 201
        
    except Exception as e:
        logger.error(f"Error processing lead: {str(e)}")
        return jsonify({'error': 'Failed to process lead'}), 500
