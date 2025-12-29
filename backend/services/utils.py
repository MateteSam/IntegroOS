import logging
import os
from PIL import Image, ImageDraw
import base64
from io import BytesIO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_logging():
    """Configure logging for the application"""
    return logger

def encode_image_to_base64(image):
    """Convert a PIL Image to base64 string"""
    if not image:
        logger.error("Received null or empty image")
        return None
        
    try:
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        logger.info("Successfully encoded image to base64")
        return img_str
    except AttributeError as ae:
        logger.error(f"Invalid image object: {str(ae)}")
        return None
    except OSError as oe:
        logger.error(f"Image encoding failed - OS Error: {str(oe)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error encoding image to base64: {str(e)}")
        return None

def create_mock_image(width=300, height=300, color='#663399', style='primary'):
    """Create a sophisticated mock logo for testing when AI generation fails"""
    try:
        logger.info(f"Creating mock image: {width}x{height}, color: {color}, style: {style}")
        
        # Convert hex color to RGB if it's a hex code
        if isinstance(color, str) and color.startswith('#'):
            r = int(color[1:3], 16)
            g = int(color[3:5], 16)
            b = int(color[5:7], 16)
            primary_color = (r, g, b)
        else:
            primary_color = color
            
        # Create lighter and darker variations
        lighter_color = tuple(min(255, int(c * 1.3)) for c in primary_color)
        darker_color = tuple(max(0, int(c * 0.7)) for c in primary_color)
        
        # Create base image with subtle gradient background
        image = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(image)
        
        # Draw different sophisticated patterns based on style
        if style == 'primary':
            # Modern geometric logo with layered elements
            center_x, center_y = width // 2, height // 2
            
            # Background circle
            circle_radius = min(width, height) // 3
            draw.ellipse([
                center_x - circle_radius, center_y - circle_radius,
                center_x + circle_radius, center_y + circle_radius
            ], fill=lighter_color, outline=primary_color, width=3)
            
            # Central geometric shape
            rect_size = circle_radius // 2
            draw.rectangle([
                center_x - rect_size, center_y - rect_size,
                center_x + rect_size, center_y + rect_size
            ], fill=primary_color)
            
            # Accent lines
            line_length = circle_radius // 3
            draw.line([
                center_x - line_length, center_y - circle_radius - 10,
                center_x + line_length, center_y - circle_radius - 10
            ], fill=darker_color, width=4)
            
        elif style == 'alternative':
            # Minimalist line-art style logo
            center_x, center_y = width // 2, height // 2
            
            # Intersecting circles
            radius1 = min(width, height) // 4
            radius2 = radius1 * 0.8
            
            # First circle
            draw.ellipse([
                center_x - radius1 - 20, center_y - radius1,
                center_x + radius1 - 20, center_y + radius1
            ], outline=primary_color, width=6)
            
            # Second circle
            draw.ellipse([
                center_x - radius2 + 20, center_y - radius2,
                center_x + radius2 + 20, center_y + radius2
            ], outline=darker_color, width=4)
            
            # Central accent
            draw.ellipse([
                center_x - 8, center_y - 8,
                center_x + 8, center_y + 8
            ], fill=primary_color)
            
        else:  # icon
            # Sophisticated icon design
            center_x, center_y = width // 2, height // 2
            
            # Outer ring
            outer_radius = min(width, height) // 2 - 10
            inner_radius = outer_radius - 15
            
            # Create ring effect
            draw.ellipse([
                center_x - outer_radius, center_y - outer_radius,
                center_x + outer_radius, center_y + outer_radius
            ], fill=primary_color)
            
            draw.ellipse([
                center_x - inner_radius, center_y - inner_radius,
                center_x + inner_radius, center_y + inner_radius
            ], fill='white')
            
            # Central symbol - diamond shape
            diamond_size = inner_radius // 2
            diamond_points = [
                (center_x, center_y - diamond_size),  # top
                (center_x + diamond_size, center_y),  # right
                (center_x, center_y + diamond_size),  # bottom
                (center_x - diamond_size, center_y)   # left
            ]
            draw.polygon(diamond_points, fill=darker_color)
            
        # Add subtle shadow effect for depth
        shadow_offset = 2
        shadow_image = Image.new('RGBA', (width + shadow_offset, height + shadow_offset), (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_image)
        
        # Create shadow by drawing the same shape in gray with offset
        shadow_color = (128, 128, 128, 100)  # Semi-transparent gray
        
        # Paste original image on top of shadow
        final_image = Image.new('RGB', (width, height), 'white')
        final_image.paste(image, (0, 0))
        
        encoded = encode_image_to_base64(final_image)
        if encoded:
            logger.info("Successfully created and encoded sophisticated mock image")
            return encoded
        else:
            logger.error("Failed to encode mock image")
            return None
            
    except ValueError as ve:
        logger.error(f"Invalid parameters for mock image: {str(ve)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error creating mock image: {str(e)}")
        return None
