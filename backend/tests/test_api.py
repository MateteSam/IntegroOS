import pytest
import json
from datetime import datetime, timedelta
from backend.app import app as flask_app, db
from backend.models import Campaign, Analytics, User, CampaignStatus

"""Pytest fixtures and tests for API endpoints."""

@pytest.fixture
def app():
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    user_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    }
    response = client.post('/api/auth/register', json=user_data)
    tokens = response.json
    return {
        'Authorization': f"Bearer {tokens['access_token']}"
    }
    
def test_create_campaign(client, auth_headers):
        """Test creating a campaign."""
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat(),
            'target_audience': {'age': '25-34'},
            'target_locations': ['US', 'CA']
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        assert response.status_code == 201
        assert response.json['name'] == 'Test Campaign'
    
def test_get_campaigns(client, auth_headers):
        """Test getting campaigns."""
        response = client.get('/api/campaigns', headers=auth_headers)
        assert response.status_code == 200
        assert 'campaigns' in response.json
    
def test_update_campaign(client, auth_headers):
        """Test updating a campaign."""
        # Create campaign first
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        campaign_id = response.json['id']
        
        # Update campaign
        update_data = {'name': 'Updated Campaign Name'}
        response = client.put(f'/api/campaigns/{campaign_id}', json=update_data, headers=auth_headers)
        assert response.status_code == 200
        assert response.json['name'] == 'Updated Campaign Name'
    
def test_delete_campaign(client, auth_headers):
        """Test deleting a campaign."""
        # Create campaign
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        campaign_id = response.json['id']
        
        # Delete campaign
        response = client.delete(f'/api/campaigns/{campaign_id}', headers=auth_headers)
        assert response.status_code == 200

def test_create_analytics(client, auth_headers):
        """Test creating analytics entry."""
        # Create campaign first
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        campaign_id = response.json['id']
        
        # Create analytics
        analytics_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'impressions': 1000,
            'clicks': 50,
            'conversions': 5,
            'cost': 100.0,
            'revenue': 500.0
        }
        
        response = client.post(f'/api/campaigns/{campaign_id}/analytics', 
                              json=analytics_data, headers=auth_headers)
        assert response.status_code == 201
        assert response.json['impressions'] == 1000
    
def test_get_analytics(client, auth_headers):
        """Test getting campaign analytics."""
        # Create campaign and analytics
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        campaign_id = response.json['id']
        
        response = client.get(f'/api/campaigns/{campaign_id}/analytics', headers=auth_headers)
        assert response.status_code == 200
        assert 'analytics' in response.json

def test_user_registration(client):
        """Test user registration."""
        user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = client.post('/api/auth/register', json=user_data)
        assert response.status_code == 201
        assert response.json['user']['username'] == 'testuser'
    
def test_user_login(client):
        """Test user login."""
        # Register user
        user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        client.post('/api/auth/register', json=user_data)
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = client.post('/api/auth/login', json=login_data)
        assert response.status_code == 200
        assert 'access_token' in response.json

def test_dashboard_stats(client, auth_headers):
        """Test dashboard statistics."""
        response = client.get('/api/dashboard/stats', headers=auth_headers)
        assert response.status_code == 200
        assert 'total_campaigns' in response.json
    
def test_predict_performance(client, auth_headers):
        """Test performance prediction."""
        # Create campaign with data
        campaign_data = {
            'name': 'Test Campaign',
            'description': 'Test campaign description',
            'budget': 1000.0,
            'status': 'active',
            'start_date': datetime.utcnow().isoformat(),
            'end_date': (datetime.utcnow() + timedelta(days=30)).isoformat()
        }
        
        response = client.post('/api/campaigns', json=campaign_data, headers=auth_headers)
        campaign_id = response.json['id']
        
        # Add analytics data
        for i in range(10):
            analytics_data = {
                'timestamp': (datetime.utcnow() - timedelta(days=i)).isoformat(),
                'impressions': 1000 + i*100,
                'clicks': 50 + i*5,
                'conversions': 5 + i,
                'cost': 100.0 + i*10,
                'revenue': 500.0 + i*50
            }
            client.post(f'/api/campaigns/{campaign_id}/analytics', 
                      json=analytics_data, headers=auth_headers)
        
        # Test prediction
        response = client.get(f'/api/campaigns/{campaign_id}/predict', headers=auth_headers)
        assert response.status_code == 200

if __name__ == '__main__':
    pytest.main([__file__, '-v'])