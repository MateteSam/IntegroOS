import logging
from .utils import create_mock_image
import colorsys

logger = logging.getLogger(__name__)

def generate_color_palette(personality='Professional', color_preferences=None):
    """Generate a harmonious color palette based on brand personality and preferences"""
    try:
        # Define sophisticated base colors for different personalities
        personality_colors = {
            'Professional': '#1e40af',  # Deep Blue
            'Creative': '#7c2d92',      # Rich Purple
            'Friendly': '#047857',      # Forest Green
            'Luxury': '#92400e',        # Rich Gold
            'Modern': '#111827',        # Charcoal
            'Playful': '#be185d'        # Vibrant Pink
        }
        
        # Enhanced color preference parsing
        base_color = personality_colors.get(personality, personality_colors['Professional'])
        avoided_colors = []
        
        if color_preferences:
            colors = [c.strip().lower() for c in color_preferences.split(',')]
            for color in colors:
                if 'avoid' in color or 'not' in color:
                    avoided_colors.append(color.replace('avoid', '').replace('not', '').strip())
                else:
                    # More comprehensive color mapping
                    color_map = {
                        'blue': '#1e40af', 'navy': '#1e3a8a', 'light blue': '#3b82f6',
                        'purple': '#7c2d92', 'violet': '#8b5cf6', 'lavender': '#a78bfa',
                        'green': '#047857', 'emerald': '#059669', 'lime': '#65a30d',
                        'gold': '#92400e', 'yellow': '#ca8a04', 'amber': '#d97706',
                        'gray': '#111827', 'grey': '#111827', 'silver': '#6b7280',
                        'pink': '#be185d', 'rose': '#e11d48', 'magenta': '#c2185b',
                        'red': '#dc2626', 'crimson': '#b91c1c', 'maroon': '#7f1d1d',
                        'orange': '#ea580c', 'coral': '#f97316', 'peach': '#fb923c',
                        'teal': '#0f766e', 'cyan': '#0891b2', 'turquoise': '#06b6d4',
                        'brown': '#92400e', 'tan': '#a3a3a3', 'beige': '#d6d3d1'
                    }
                    if color in color_map:
                        base_color = color_map[color]
                        break
        
        # Convert base color to HSV for sophisticated color generation
        rgb = tuple(int(base_color[i:i+2], 16)/255 for i in (1, 3, 5))
        hsv = list(colorsys.rgb_to_hsv(*rgb))
        
        # Generate sophisticated color variations
        colors = {}
        
        # Primary color (base)
        colors['primary'] = base_color
        
        # Secondary color - analogous color (30° shift) with adjusted saturation
        hsv_secondary = hsv.copy()
        hsv_secondary[0] = (hsv_secondary[0] + 0.083) % 1.0  # 30° shift
        hsv_secondary[1] = min(1.0, hsv_secondary[1] * 0.8)  # Reduce saturation
        rgb_secondary = colorsys.hsv_to_rgb(*hsv_secondary)
        colors['secondary'] = '#{:02x}{:02x}{:02x}'.format(
            int(rgb_secondary[0] * 255),
            int(rgb_secondary[1] * 255),
            int(rgb_secondary[2] * 255)
        )
        
        # Accent 1 - Complementary color with reduced intensity
        hsv_accent1 = hsv.copy()
        hsv_accent1[0] = (hsv_accent1[0] + 0.5) % 1.0  # 180° shift
        hsv_accent1[1] = min(1.0, hsv_accent1[1] * 0.7)  # Reduce saturation
        hsv_accent1[2] = min(1.0, hsv_accent1[2] * 1.1)  # Slightly brighter
        rgb_accent1 = colorsys.hsv_to_rgb(*hsv_accent1)
        colors['accent1'] = '#{:02x}{:02x}{:02x}'.format(
            int(rgb_accent1[0] * 255),
            int(rgb_accent1[1] * 255),
            int(rgb_accent1[2] * 255)
        )
        
        # Accent 2 - Triadic color (120° shift) with personality adjustment
        hsv_accent2 = hsv.copy()
        hsv_accent2[0] = (hsv_accent2[0] + 0.333) % 1.0  # 120° shift
        
        # Adjust based on personality
        if personality == 'Luxury':
            hsv_accent2[1] = min(1.0, hsv_accent2[1] * 0.6)  # More muted for luxury
            hsv_accent2[2] = min(1.0, hsv_accent2[2] * 0.9)  # Slightly darker
        elif personality == 'Playful':
            hsv_accent2[1] = min(1.0, hsv_accent2[1] * 1.2)  # More saturated
            hsv_accent2[2] = min(1.0, hsv_accent2[2] * 1.1)  # Brighter
        else:
            hsv_accent2[1] = min(1.0, hsv_accent2[1] * 0.8)  # Balanced saturation
            
        rgb_accent2 = colorsys.hsv_to_rgb(*hsv_accent2)
        colors['accent2'] = '#{:02x}{:02x}{:02x}'.format(
            int(rgb_accent2[0] * 255),
            int(rgb_accent2[1] * 255),
            int(rgb_accent2[2] * 255)
        )
        
        # Validate colors don't match avoided preferences
        if avoided_colors:
            for avoided in avoided_colors:
                if avoided in color_preferences.lower():
                    # Shift hue if color should be avoided
                    for key in colors:
                        if key != 'primary':
                            rgb = tuple(int(colors[key][i:i+2], 16)/255 for i in (1, 3, 5))
                            hsv_temp = list(colorsys.rgb_to_hsv(*rgb))
                            hsv_temp[0] = (hsv_temp[0] + 0.1) % 1.0  # Shift by 36°
                            rgb_temp = colorsys.hsv_to_rgb(*hsv_temp)
                            colors[key] = '#{:02x}{:02x}{:02x}'.format(
                                int(rgb_temp[0] * 255),
                                int(rgb_temp[1] * 255),
                                int(rgb_temp[2] * 255)
                            )
        
        logger.info(f"Generated sophisticated color palette for {personality} personality")
        return colors
        
    except Exception as e:
        logger.error(f"Error generating color palette: {str(e)}")
        # Return fallback palette
        return {
            'primary': '#2563eb',
            'secondary': '#64748b',
            'accent1': '#f59e0b',
            'accent2': '#10b981'
        }

def get_tone_from_personality(personality):
    """Get appropriate tone of voice based on brand personality"""
    tone_map = {
        'Professional': ['authoritative', 'clear', 'trustworthy'],
        'Creative': ['imaginative', 'inspiring', 'expressive'],
        'Friendly': ['warm', 'approachable', 'conversational'],
        'Luxury': ['sophisticated', 'refined', 'exclusive'],
        'Modern': ['innovative', 'direct', 'forward-thinking'],
        'Playful': ['energetic', 'fun', 'engaging']
    }
    return tone_map.get(personality, tone_map['Professional'])

def get_industry_keywords(industry):
    """Get relevant keywords for the industry"""
    keyword_map = {
        'Technology': ['innovative', 'cutting-edge', 'solution', 'advanced'],
        'Healthcare': ['caring', 'trusted', 'professional', 'wellness'],
        'Education': ['learning', 'growth', 'knowledge', 'development'],
        'Real Estate': ['location', 'investment', 'quality', 'lifestyle'],
        'Food & Beverage': ['taste', 'quality', 'fresh', 'experience'],
        'Fashion': ['style', 'trend', 'design', 'expression'],
        'Finance': ['security', 'growth', 'stability', 'expertise'],
        'Fitness': ['health', 'strength', 'motivation', 'results'],
        'Beauty': ['confidence', 'radiance', 'luxury', 'care'],
        'Consulting': ['expertise', 'strategy', 'results', 'partnership']
    }
    return keyword_map.get(industry, ['quality', 'service', 'value', 'trust'])

def generate_brand_promise(mission, values, industry):
    """Generate a brand promise based on mission and values"""
    if not mission or not values:
        return "Delivering excellence and innovation in everything we do"
        
    # Extract key themes from mission and values
    keywords = []
    if mission:
        keywords.extend(mission.lower().split())
    if values:
        keywords.extend([v.lower() for v in values])
        
    # Generate appropriate promise based on industry and keywords
    if 'technology' in industry.lower() or any(tech in keywords for tech in ['innovation', 'tech', 'digital']):
        return "Innovating tomorrow's solutions today"
    elif any(service in keywords for service in ['help', 'serve', 'support']):
        return "Building lasting relationships through exceptional service"
    elif any(quality in keywords for quality in ['premium', 'luxury', 'best']):
        return "Delivering unparalleled quality and excellence"
    elif any(creative in keywords for creative in ['creative', 'design', 'art']):
        return "Transforming vision into remarkable experiences"
    else:
        return "Empowering success through dedication and excellence"

def generate_typography(personality):
    """Generate typography recommendations based on brand personality"""
    try:
        font_pairs = {
            'Professional': ('Inter', 'Source Sans Pro'),
            'Creative': ('Playfair Display', 'Lato'),
            'Friendly': ('Poppins', 'Open Sans'),
            'Luxury': ('Cormorant Garamond', 'Crimson Text'),
            'Modern': ('Space Grotesk', 'Inter'),
            'Playful': ('Fredoka One', 'Nunito')
        }
        
        pair = font_pairs.get(personality, font_pairs['Professional'])
        typography = {
            'headingFont': pair[0],
            'bodyFont': pair[1]
        }
            
        logger.info(f"Generated typography for {personality} personality")
        return typography
    except Exception as e:
        logger.error(f"Error generating typography: {str(e)}")
        return None

def generate_brand_assets(brand_data):
    """Generate complete brand identity assets"""
    try:
        logger.info(f"Starting brand asset generation with data: {brand_data}")
        
        # Validate required fields
        required_fields = ['businessName', 'industry', 'brandPersonality', 'targetAudience']
        missing_fields = [field for field in required_fields if not brand_data.get(field)]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
            
        # Generate color palette based on personality and preferences
        personality = brand_data['brandPersonality']
        colors = generate_color_palette(
            personality=personality,
            color_preferences=brand_data.get('colors', '')
        )
        if not colors:
            logger.error("Failed to generate color palette")
            raise Exception("Failed to generate color palette")
            
        # Generate logos with brand colors and appropriate styles
        business_name = brand_data['businessName']
        industry = brand_data['industry']
        logger.info(f"Generating logos for {business_name} in {industry} industry")
        
        # Create varied logo designs based on brand personality
        primary_logo = create_mock_image(300, 150, colors['primary'], 'primary')
        alternative_logo = create_mock_image(300, 150, colors['secondary'], 'alternative')
        icon_logo = create_mock_image(150, 150, colors['accent1'], 'icon')
        
        if not all([primary_logo, alternative_logo, icon_logo]):
            logger.error("Failed to generate one or more logo variants")
            raise Exception("Failed to generate logo variants")
            
        # Generate typography based on personality and industry
        typography = generate_typography(personality)
        if not typography:
            logger.error("Failed to generate typography")
            raise Exception("Failed to generate typography")
            
        # Generate comprehensive brand guidelines
        target_audience = brand_data.get('targetAudience', '').split(',')
        mission = brand_data.get('mission', '')
        values = [v.strip() for v in brand_data.get('values', '').split(',') if v.strip()]
        
        guidelines = {
            'mission': mission,
            'values': values,
            'voice': {
                'personality': personality,
                'tone': get_tone_from_personality(personality),
                'keywords': get_industry_keywords(industry)
            },
            'targetAudience': target_audience,
            'brandPromise': generate_brand_promise(mission, values, industry),
            'usage': {
                'primary': 'Main branding, website headers, and official documents',
                'alternative': 'Social media, marketing materials, and digital content',
                'icon': 'App icons, favicons, and small-format applications'
            }
        }
        
        # Prepare response
        assets = {
            'success': True,
            'assets': {
                'logo': {
                    'primary': primary_logo,
                    'alternative': alternative_logo,
                    'icon': icon_logo
                },
                'colors': colors,
                'typography': typography,
                'brandGuidelines': guidelines
            }
        }
        
        logger.info("Successfully generated all brand assets")
        return assets
        
    except Exception as e:
        logger.error(f"Error generating brand assets: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
