# Marketing Brain Command Center

A comprehensive AI-powered marketing analytics platform that provides real-time insights, predictive analytics, and campaign management capabilities.

## 🚀 Features

### Core Features
- **Campaign Management**: Create, manage, and optimize marketing campaigns
- **Real-time Analytics**: Track impressions, clicks, conversions, and ROI in real-time
- **Predictive Analytics**: AI-powered performance predictions and optimization suggestions
- **Cohort Analysis**: Deep insights into user behavior and retention patterns
- **WebSocket Support**: Real-time updates and notifications
- **Advanced Security**: JWT authentication, rate limiting, and data validation

### Advanced Features
- **Machine Learning Models**: Gradient Boosting and Random Forest algorithms
- **Performance Monitoring**: Comprehensive metrics and alerting
- **Multi-device Support**: Optimized for desktop, tablet, and mobile
- **API-first Architecture**: RESTful API with comprehensive documentation
- **Database Migrations**: Alembic for schema management
- **Caching Strategy**: Redis for improved performance

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Python 3.11, Flask, SQLAlchemy, Redis, WebSocket
- **Database**: PostgreSQL (production), SQLite (development)
- **Caching**: Redis with advanced caching strategies
- **Monitoring**: Prometheus, Grafana, Sentry
- **Deployment**: Docker, Railway, Vercel, Heroku

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Flask Backend  │    │   PostgreSQL   │
│   (Port 3000)   │────│   (Port 5000)   │────│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                │
                                                │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │  Redis Cache    │    │   Monitoring    │
│   Real-time     │────│   (Port 6379)   │────│   & Logging   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 7+

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/MateteSam/marketing-brain-command-center.git
cd marketing-brain-command-center
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from app import create_app; app, _ = create_app(); from models import db; db.create_all()"

# Start backend
python -m flask run --host=0.0.0.0 --port=5000
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Documentation: http://localhost:5000/docs

### Docker Deployment

```bash
# Quick start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 📊 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Campaign Management

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale Campaign",
  "description": "Summer 2024 promotion",
  "budget": 5000.0,
  "status": "active",
  "start_date": "2024-06-01T00:00:00Z",
  "end_date": "2024-06-30T23:59:59Z",
  "target_audience": {"age": "25-34", "interests": ["technology", "fashion"]},
  "target_locations": ["US", "CA", "UK"],
  "target_demographics": {"gender": "all", "income": "50k-100k"}
}
```

#### Get Campaigns
```http
GET /api/campaigns?page=1&per_page=10&status=active&search=sale
Authorization: Bearer <token>
```

#### Update Campaign
```http
PUT /api/campaigns/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Campaign Name",
  "budget": 7500.0,
  "status": "paused"
}
```

### Analytics

#### Create Analytics Entry
```http
POST /api/campaigns/1/analytics
Authorization: Bearer <token>
Content-Type: application/json

{
  "timestamp": "2024-06-15T12:00:00Z",
  "impressions": 10000,
  "clicks": 500,
  "conversions": 50,
  "cost": 250.0,
  "revenue": 1250.0,
  "bounce_rate": 0.35,
  "session_duration": 180.5,
  "pages_per_session": 3.2,
  "new_users": 400,
  "returning_users": 100,
  "device_type": "mobile",
  "browser": "Chrome",
  "country": "US",
  "region": "California",
  "city": "San Francisco",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "summer_sale"
}
```

### Advanced Analytics

#### Predict Campaign Performance
```http
GET /api/campaigns/1/predict?days=7
Authorization: Bearer <token>
```

#### Cohort Analysis
```http
GET /api/campaigns/1/cohort
Authorization: Bearer <token>
```

#### AI Insights
```http
GET /api/campaigns/1/insights
Authorization: Bearer <token>
```

#### Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_brain

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn-here@sentry.io/project-id

# Environment
FLASK_ENV=development
DEBUG=true
TESTING=false
```

### Redis Configuration

```bash
# Basic Redis setup
redis-server --port 6379 --daemonize yes

# Redis with password
redis-server --port 6379 --requirepass your-redis-password

# Redis with persistence
redis-server --port 6379 --save 900 1 --save 300 10 --save 60 10000
```

## 📈 Analytics Features

### Key Metrics
- **Impressions**: Total ad views
- **Clicks**: Total ad clicks
- **Conversions**: Goal completions
- **CTR**: Click-through rate (Clicks/Impressions)
- **Conversion Rate**: Conversions/Clicks
- **ROAS**: Return on ad spend (Revenue/Cost)
- **CPC**: Cost per click (Cost/Clicks)
- **CPM**: Cost per mille (Cost/Impressions * 1000)
- **CPA**: Cost per acquisition (Cost/Conversions)

### Machine Learning Models

#### Predictive Analytics
- **Impressions Prediction**: Gradient Boosting Regressor
- **Clicks Prediction**: Random Forest Regressor
- **Conversions Prediction**: Random Forest Regressor
- **Revenue Prediction**: Gradient Boosting Regressor

#### Model Evaluation
- **MSE**: Mean Squared Error
- **MAE**: Mean Absolute Error
- **R²**: Coefficient of determination
- **Cross-validation**: 5-fold cross-validation

### Cohort Analysis
- **User Retention**: Track user behavior over time
- **Revenue Cohorts**: Analyze revenue by acquisition date
- **Conversion Cohorts**: Analyze conversion patterns
- **Engagement Cohorts**: Track user engagement over time

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# With coverage
python -m pytest tests/ -v --cov=backend --cov-report=html

# Frontend tests
cd frontend
npm test

# Integration tests
python -m pytest tests/ -m integration
```

### Test Coverage
```bash
# Generate coverage report
python -m pytest tests/ --cov=backend --cov-report=term-missing

# View HTML coverage report
open htmlcov/index.html
```

## 🚀 Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up --service backend
railway up --service frontend
```

### Heroku (Backend)
```bash
# Install Heroku CLI
npm install -g heroku

# Deploy
git add .
git commit -m "Deploy to Heroku"
heroku create marketing-brain-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DATABASE_URL=postgresql://...
heroku config:set REDIS_URL=redis://...

git push heroku main
```

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Docker Deployment
```bash
# Build images
docker build -t marketing-brain-frontend ./
docker build -t marketing-brain-backend ./backend/

# Run with Docker Compose
docker-compose up -d
```

## 📊 Monitoring

### Prometheus Metrics
- **request_count**: Total HTTP requests
- **request_duration**: Request duration histogram
- **database_connections**: Active database connections
- **cache_hits**: Redis cache hit rate
- **model_predictions**: ML model predictions count

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/health/db

# Redis connection
curl http://localhost:5000/health/redis
```

### Logging
```python
# Structured logging
logger.info("Campaign created", campaign_id=campaign.id, user_id=user.id)
logger.warning("Rate limit exceeded", user_id=user.id, endpoint=request.endpoint)
logger.error("Database connection failed", error=str(e))
```

## 🔒 Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting by user and IP
- **Input Validation**: Comprehensive validation with Marshmallow
- **SQL Injection Prevention**: ORM with parameterized queries
- **CORS Configuration**: Cross-origin resource sharing
- **HTTPS Enforcement**: SSL/TLS encryption
- **Security Headers**: XSS protection, CSRF tokens

### Security Best Practices
- Use environment variables for sensitive data
- Implement proper input validation
- Use HTTPS in production
- Regular security audits
- Keep dependencies updated
- Monitor for security vulnerabilities

## 📞 Support

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/MateteSam/marketing-brain-command-center/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MateteSam/marketing-brain-command-center/discussions)
- **Documentation**: [Wiki](https://github.com/MateteSam/marketing-brain-command-center/wiki)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flask**: Web framework
- **React**: Frontend framework
- **SQLAlchemy**: ORM and database toolkit
- **Redis**: In-memory data store
- **Scikit-learn**: Machine learning library
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.io**: Real-time bidirectional event-based communication

---

**Made with ❤️ by the Marketing Brain team**