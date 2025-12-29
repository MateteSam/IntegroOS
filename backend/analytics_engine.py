from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import json

try:
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import StandardScaler, LabelEncoder
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    from sklearn.model_selection import train_test_split, cross_val_score
    HAS_DATA_SCIENCE_STACK = True
except ImportError:
    HAS_DATA_SCIENCE_STACK = False
    # logger is defined later, so we will handle logging inside the class or after logger is defined
    pass

from models import Campaign, Analytics, db
from logging_config import get_logger

logger = get_logger(__name__)

class AdvancedAnalyticsEngine:
    """Advanced analytics engine with predictive modeling and cohort analysis."""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
    
    def prepare_features(self, campaign: Campaign, analytics_data: List[Analytics]) -> pd.DataFrame:
        """Prepare features for machine learning models."""
        
        # Create feature matrix
        features = []
        
        for analytics in analytics_data:
            feature_vector = {
                # Time-based features
                'hour': analytics.timestamp.hour,
                'day_of_week': analytics.timestamp.weekday(),
                'day_of_month': analytics.timestamp.day,
                'month': analytics.timestamp.month,
                'quarter': (analytics.timestamp.month - 1) // 3 + 1,
                
                # Campaign features
                'campaign_age_days': (analytics.timestamp - campaign.start_date).days,
                'budget_utilization': float(campaign.spent) / float(campaign.budget) if campaign.budget > 0 else 0,
                
                # Performance metrics
                'impressions': analytics.impressions,
                'clicks': analytics.clicks,
                'conversions': analytics.conversions,
                'cost': float(analytics.cost),
                'revenue': float(analytics.revenue),
                
                # Quality metrics
                'bounce_rate': analytics.bounce_rate,
                'session_duration': analytics.session_duration,
                'pages_per_session': analytics.pages_per_session,
                
                # Audience features
                'new_users_ratio': analytics.new_users / (analytics.new_users + analytics.returning_users) 
                                if (analytics.new_users + analytics.returning_users) > 0 else 0,
                
                # Device and location
                'device_mobile': 1 if analytics.device_type == 'mobile' else 0,
                'device_desktop': 1 if analytics.device_type == 'desktop' else 0,
                'device_tablet': 1 if analytics.device_type == 'tablet' else 0,
                
                # UTM tracking
                'utm_source_direct': 1 if analytics.utm_source == 'direct' else 0,
                'utm_source_google': 1 if analytics.utm_source == 'google' else 0,
                'utm_source_facebook': 1 if analytics.utm_source == 'facebook' else 0,
            }
            features.append(feature_vector)
        
        return pd.DataFrame(features)
    
    def train_predictive_models(self, campaign: Campaign) -> Dict[str, Any]:
        """Train predictive models for campaign performance."""
        
        # Get analytics data
        analytics_data = Analytics.query.filter_by(campaign_id=campaign.id).all()
        if len(analytics_data) < 10:
            logger.warning("Insufficient data for training", campaign_id=campaign.id)
            return {"error": "Insufficient data for training"}
        
        try:
            # Prepare features
            X = self.prepare_features(campaign, analytics_data)
            
            # Prepare targets
            y_impressions = X['impressions']
            y_clicks = X['clicks']
            y_conversions = X['conversions']
            y_revenue = X['revenue']
            
            # Remove target variables from features
            feature_cols = [col for col in X.columns if col not in ['impressions', 'clicks', 'conversions', 'revenue']]
            X_features = X[feature_cols]
            
            # Split data
            X_train, X_test, y_train_impr, y_test_impr = train_test_split(
                X_features, y_impressions, test_size=0.2, random_state=42
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train models
            models = {}
            
            # Impressions model
            impr_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            impr_model.fit(X_train_scaled, y_train_impr)
            models['impressions'] = impr_model
            
            # Clicks model
            clicks_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            clicks_model.fit(X_train_scaled, y_clicks)
            models['clicks'] = clicks_model
            
            # Conversions model
            conv_model = RandomForestRegressor(n_estimators=100, random_state=42)
            conv_model.fit(X_train_scaled, y_conversions)
            models['conversions'] = conv_model
            
            # Revenue model
            revenue_model = RandomForestRegressor(n_estimators=100, random_state=42)
            revenue_model.fit(X_train_scaled, y_revenue)
            models['revenue'] = revenue_model
            
            # Store models and scalers
            self.models[campaign.id] = models
            self.scalers[campaign.id] = scaler
            
            # Evaluate models
            results = {}
            for name, model in models.items():
                y_pred = model.predict(X_test_scaled)
                y_test = (
                    y_impressions if name == 'impressions' else
                    (y_clicks if name == 'clicks' else (y_conversions if name == 'conversions' else y_revenue))
                )
                
                results[name] = {
                    'mse': float(mean_squared_error(y_test, y_pred)),
                    'mae': float(mean_absolute_error(y_test, y_pred)),
                    'r2': float(r2_score(y_test, y_pred)),
                    'cv_scores': [float(score) for score in cross_val_score(model, X_train_scaled, y_test, cv=5)]
                }
            
            logger.info("Models trained successfully", campaign_id=campaign.id, results=results)
            return results
            
        except Exception as e:
            logger.error("Error training models", campaign_id=campaign.id, error=str(e))
            return {"error": str(e)}
    
    def predict_campaign_performance(self, campaign: Campaign, days_ahead: int = 7) -> Dict[str, Any]:
        """Predict campaign performance for the next N days."""
        
        if campaign.id not in self.models:
            self.train_predictive_models(campaign)
        
        if campaign.id not in self.models:
            return {"error": "Models not available"}
        
        try:
            # Generate future dates
            predictions = []
            base_date = datetime.utcnow()
            
            for i in range(days_ahead):
                future_date = base_date + timedelta(days=i+1)
                
                # Create feature vector for prediction
                features = {
                    'hour': 12,  # Midday prediction
                    'day_of_week': future_date.weekday(),
                    'day_of_month': future_date.day,
                    'month': future_date.month,
                    'quarter': (future_date.month - 1) // 3 + 1,
                    'campaign_age_days': (future_date - campaign.start_date).days,
                    'budget_utilization': float(campaign.spent) / float(campaign.budget) if campaign.budget > 0 else 0,
                    'impressions': campaign.impressions,
                    'clicks': campaign.clicks,
                    'conversions': campaign.conversions,
                    'cost': float(campaign.spent),
                    'revenue': float(campaign.revenue),
                    'bounce_rate': 0.5,  # Default assumption
                    'session_duration': 120,  # Default assumption
                    'pages_per_session': 2.5,  # Default assumption
                    'new_users_ratio': 0.7,  # Default assumption
                    'device_mobile': 1,
                    'device_desktop': 0,
                    'device_tablet': 0,
                    'utm_source_direct': 0,
                    'utm_source_google': 1,
                    'utm_source_facebook': 0,
                }
                
                # Prepare feature vector
                feature_cols = [k for k in features.keys() if k not in ['impressions', 'clicks', 'conversions', 'revenue']]
                feature_vector = [features[col] for col in feature_cols]
                
                # Scale features
                scaler = self.scalers[campaign.id]
                feature_scaled = scaler.transform([feature_vector])
                
                # Make predictions
                models = self.models[campaign.id]
                
                pred_impressions = max(0, int(models['impressions'].predict(feature_scaled)[0]))
                pred_clicks = max(0, int(models['clicks'].predict(feature_scaled)[0]))
                pred_conversions = max(0, int(models['conversions'].predict(feature_scaled)[0]))
                pred_revenue = max(0, float(models['revenue'].predict(feature_scaled)[0]))
                
                predictions.append({
                    'date': future_date.isoformat(),
                    'predicted_impressions': pred_impressions,
                    'predicted_clicks': pred_clicks,
                    'predicted_conversions': pred_conversions,
                    'predicted_revenue': pred_revenue,
                    'predicted_ctr': (pred_clicks / pred_impressions * 100) if pred_impressions > 0 else 0,
                    'predicted_conversion_rate': (pred_conversions / pred_clicks * 100) if pred_clicks > 0 else 0,
                    'predicted_cpc': float(campaign.spent) / pred_clicks if pred_clicks > 0 else 0
                })
            
            # Aggregate predictions
            total_predictions = {
                'total_impressions': sum(p['predicted_impressions'] for p in predictions),
                'total_clicks': sum(p['predicted_clicks'] for p in predictions),
                'total_conversions': sum(p['predicted_conversions'] for p in predictions),
                'total_revenue': sum(p['predicted_revenue'] for p in predictions),
                'daily_predictions': predictions
            }
            
            return total_predictions
            
        except Exception as e:
            logger.error("Error predicting performance", campaign_id=campaign.id, error=str(e))
            return {"error": str(e)}
    
    def cohort_analysis(self, campaign: Campaign) -> Dict[str, Any]:
        """Perform cohort analysis on campaign data."""
        
        analytics_data = Analytics.query.filter_by(campaign_id=campaign.id).all()
        if not analytics_data:
            return {"error": "No analytics data available"}
        
        try:
            # Create cohort data
            cohort_data = []
            for analytics in analytics_data:
                cohort_data.append({
                    'cohort_date': analytics.timestamp.date(),
                    'conversions': analytics.conversions,
                    'revenue': float(analytics.revenue),
                    'cost': float(analytics.cost),
                    'users': analytics.new_users + analytics.returning_users,
                    'days_since_start': (analytics.timestamp.date() - campaign.start_date.date()).days
                })
            
            df = pd.DataFrame(cohort_data)
            if df.empty:
                return {"error": "No cohort data available"}
            
            # Group by cohort
            cohort_grouped = df.groupby('cohort_date').agg({
                'conversions': 'sum',
                'revenue': 'sum',
                'cost': 'sum',
                'users': 'sum'
            }).reset_index()
            
            # Calculate retention metrics
            cohort_analysis = []
            for _, row in cohort_grouped.iterrows():
                cohort_analysis.append({
                    'cohort_date': row['cohort_date'].isoformat(),
                    'conversions': int(row['conversions']),
                    'revenue': float(row['revenue']),
                    'cost': float(row['cost']),
                    'users': int(row['users']),
                    'roi': float(row['revenue'] / row['cost']) if row['cost'] > 0 else 0,
                    'conversion_rate': float(row['conversions'] / row['users']) if row['users'] > 0 else 0
                })
            
            return {
                'cohorts': cohort_analysis,
                'total_cohorts': len(cohort_analysis),
                'average_roi': float(df['revenue'].sum() / df['cost'].sum()) if df['cost'].sum() > 0 else 0,
                'total_users': int(df['users'].sum()),
                'total_revenue': float(df['revenue'].sum()),
                'total_conversions': int(df['conversions'].sum())
            }
            
        except Exception as e:
            logger.error("Error in cohort analysis", campaign_id=campaign.id, error=str(e))
            return {"error": str(e)}
    
    def generate_insights(self, campaign: Campaign) -> Dict[str, Any]:
        """Generate actionable insights from campaign data."""
        
        analytics_data = Analytics.query.filter_by(campaign_id=campaign.id).all()
        if not analytics_data:
            return {"error": "No analytics data available"}
        
        try:
            # Calculate key metrics
            total_impressions = sum(a.impressions for a in analytics_data)
            total_clicks = sum(a.clicks for a in analytics_data)
            total_conversions = sum(a.conversions for a in analytics_data)
            total_cost = sum(float(a.cost) for a in analytics_data)
            total_revenue = sum(float(a.revenue) for a in analytics_data)
            
            insights = []
            
            # Performance insights
            if total_impressions > 0:
                ctr = total_clicks / total_impressions * 100
                if ctr < 1:
                    insights.append({
                        'type': 'warning',
                        'category': 'performance',
                        'message': 'Low click-through rate detected. Consider improving ad creatives or targeting.',
                        'metric': 'ctr',
                        'value': round(ctr, 2),
                        'suggestion': 'Test new ad creatives or refine audience targeting'
                    })
            
            # Budget insights
            budget_utilization = float(campaign.spent) / float(campaign.budget) * 100
            if budget_utilization > 90:
                insights.append({
                    'type': 'warning',
                    'category': 'budget',
                    'message': 'Campaign budget is nearly exhausted.',
                    'metric': 'budget_utilization',
                    'value': round(budget_utilization, 2),
                    'suggestion': 'Consider increasing budget or optimizing spend'
                })
            
            # ROI insights
            if total_cost > 0:
                roi = total_revenue / total_cost
                if roi < 1:
                    insights.append({
                        'type': 'critical',
                        'category': 'roi',
                        'message': 'Negative ROI detected. Campaign is losing money.',
                        'metric': 'roi',
                        'value': round(roi, 2),
                        'suggestion': 'Pause campaign and analyze performance issues'
                    })
                elif roi > 5:
                    insights.append({
                        'type': 'success',
                        'category': 'roi',
                        'message': 'Excellent ROI performance. Consider scaling this campaign.',
                        'metric': 'roi',
                        'value': round(roi, 2),
                        'suggestion': 'Increase budget and expand targeting'
                    })
            
            # Device insights
            device_data = {}
            for analytics in analytics_data:
                device = analytics.device_type or 'unknown'
                if device not in device_data:
                    device_data[device] = {'clicks': 0, 'conversions': 0}
                device_data[device]['clicks'] += analytics.clicks
                device_data[device]['conversions'] += analytics.conversions
            
            best_device = max(device_data.items(), key=lambda x: x[1]['conversions'])
            insights.append({
                'type': 'info',
                'category': 'device',
                'message': f'Best performing device: {best_device[0]}',
                'metric': 'device_performance',
                'value': best_device[1]['conversions'],
                'suggestion': f'Optimize campaigns for {best_device[0]} users'
            })
            
            return {
                'insights': insights,
                'total_insights': len(insights),
                'critical_issues': len([i for i in insights if i['type'] == 'critical']),
                'warnings': len([i for i in insights if i['type'] == 'warning']),
                'opportunities': len([i for i in insights if i['type'] == 'success'])
            }
            
        except Exception as e:
            logger.error("Error generating insights", campaign_id=campaign.id, error=str(e))
            return {"error": str(e)}

# Global analytics instance
analytics_engine = AdvancedAnalyticsEngine()