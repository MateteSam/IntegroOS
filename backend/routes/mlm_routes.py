from flask import Blueprint, request, jsonify
from services.brand_generation import generate_brand_assets
import traceback

mlm_routes = Blueprint('mlm_routes', __name__)

@mlm_routes.route('/api/mlm/generate-assets', methods=['POST'])
def generate_assets():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ['businessName', 'companyName', 'industry']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        mapped = {
            'businessName': data.get('businessName') or data.get('companyName') or '',
            'industry': data.get('industry') or '',
            'brandPersonality': data.get('brandPersonality') or 'Professional',
            'targetAudience': data.get('targetMarket') or '',
            'mission': data.get('mission') or '',
            'values': data.get('values') or [],
            'colors': data.get('colors') or ''
        }
        result = generate_brand_assets(mapped)
        return jsonify(result)

    except Exception as e:
        # Log the full error for debugging
        print(f"Error generating MLM assets: {str(e)}")
        print(traceback.format_exc())
        
        # Return a more specific error message to the client
        error_message = str(e) if str(e) else "An unexpected error occurred while generating brand assets"
        return jsonify({
            "error": error_message,
            "details": "Please try again or contact support if the problem persists"
        }), 500
