# Marketing Brain Command Center - Production Deployment Guide

## 🚀 Production Deployment

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/marketing_brain

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Email (optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn-here@sentry.io/project-id

# Environment
FLASK_ENV=production
```

### Docker Deployment

#### Quick Start
```bash
# Clone repository
git clone https://github.com/MateteSam/marketing-brain-command-center.git
cd marketing-brain-command-center

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Documentation: http://localhost:5000/docs
```

#### Production Docker
```bash
# Build production images
docker build -t marketing-brain-frontend ./
docker build -t marketing-brain-backend ./backend/

# Run production containers
docker run -d -p 3000:3000 marketing-brain-frontend
docker run -d -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e SECRET_KEY="..." \
  marketing-brain-backend
```

### Cloud Deployment

#### Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
railway login
railway init
railway up --service backend

# Deploy frontend
railway up --service frontend
```

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Heroku (Backend)
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

### Database Setup

#### PostgreSQL Setup
```sql
-- Create database
createdb marketing_brain

-- Create user
createuser marketing_user
psql -c "ALTER USER marketing_user WITH PASSWORD 'secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE marketing_brain TO marketing_user;"
```

#### Redis Setup
```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### SSL/TLS Configuration

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/marketing-brain
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Let's Encrypt SSL
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Monitoring & Alerting

#### Prometheus & Grafana
```bash
# Install Prometheus
docker run -d --name prometheus -p 9090:9090 prom/prometheus

# Install Grafana
docker run -d --name grafana -p 3001:3000 grafana/grafana

# Add Prometheus as data source
# Dashboard: http://localhost:3001 (admin/admin)
```

#### Health Monitoring
```bash
# Add health check endpoint
curl http://localhost:5000/health

# Monitor with curl
curl -f http://localhost:5000/health || echo "Backend down"
```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_campaigns_user_created ON campaigns(user_id, created_at);
CREATE INDEX idx_analytics_campaign_timestamp ON analytics(campaign_id, timestamp);
CREATE INDEX idx_analytics_date ON analytics(date);

-- Analyze tables
ANALYZE campaigns;
ANALYZE analytics;
```

#### Redis Caching Strategy
```python
# Cache frequently accessed data
# Campaign listings: 5 minutes
# Analytics: 1 minute
# Dashboard stats: 30 seconds
# Predictions: 10 minutes
```

#### CDN Configuration
```bash
# CloudFlare setup
# 1. Add domain
# 2. Update DNS nameservers
# 3. Configure caching rules
# 4. Enable SSL/TLS
```

### Security Best Practices

#### Environment Security
```bash
# Generate secure secrets
python -c "import secrets; print(secrets.token_urlsafe(32))"

# File permissions
chmod 600 .env
chmod 755 backend/
```

#### Rate Limiting
```python
# Configure rate limits
RATELIMIT_DEFAULT = "200 per day, 50 per hour"
RATELIMIT_STORAGE_URL = "redis://localhost:6379/1"
```

### Backup Strategy

#### Database Backups
```bash
# Automated daily backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump marketing_brain > backup_${DATE}.sql
aws s3 cp backup_${DATE}.sql s3://your-bucket/backups/
```

#### Application Backups
```bash
# Backup application code
tar -czf marketing-brain-backup-$(date +%Y%m%d).tar.gz \
  --exclude='.git' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.env' \
  .
```

### Troubleshooting

#### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check user permissions

2. **Redis Connection Issues**
   - Verify Redis is running
   - Check REDIS_URL format
   - Check Redis authentication

3. **Memory Issues**
   - Monitor memory usage: `free -h`
   - Check for memory leaks
   - Increase swap if needed

4. **Performance Issues**
   - Check slow queries: `EXPLAIN ANALYZE`
   - Monitor with `htop`
   - Check Redis cache hit rate

### Monitoring Commands

```bash
# Check system resources
htop
df -h
iostat -x 1

# Check application logs
tail -f logs/app.log

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check Redis performance
redis-cli info
```

### Scaling Guide

#### Horizontal Scaling
```bash
# Load balancer with Nginx
# Multiple backend instances
# Database read replicas
# Redis cluster
```

#### Vertical Scaling
```bash
# Increase server resources
# Optimize database queries
# Add more Redis memory
# Use CDN for static assets
```

### Support & Maintenance

#### Log Rotation
```bash
# Configure logrotate
sudo tee /etc/logrotate.d/marketing-brain <<EOF
/home/user/webapp/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 user user
}
EOF
```

#### Health Check Script
```bash
#!/bin/bash
# health_check.sh

BACKEND_URL="http://localhost:5000/health"
FRONTEND_URL="http://localhost:3000"

# Check backend
curl -f $BACKEND_URL > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Backend is down"
    exit 1
fi

# Check frontend
curl -f $FRONTEND_URL > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Frontend is down"
    exit 1
fi

echo "All services are healthy"
```

This completes the comprehensive deployment guide. Your application is now ready for production with advanced features including:

- ✅ Advanced Analytics with ML predictions
- ✅ Real-time WebSocket updates
- ✅ Comprehensive security measures
- ✅ Performance monitoring
- ✅ Docker containerization
- ✅ Cloud deployment ready
- ✅ SSL/TLS support
- ✅ Backup and recovery
- ✅ Performance optimization
- ✅ Security best practices