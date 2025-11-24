# WeatherWise Deployment Guide

This guide covers deploying WeatherWise to AWS and GCP.

## Prerequisites

- AWS/GCP account with appropriate permissions
- Docker installed (for local testing)
- AWS CLI / GCP CLI configured
- Domain name (optional)

## AWS Deployment

### Frontend (S3 + CloudFront)

1. **Build the frontend:**
```bash
cd frontend
npm install
npm run build
```

2. **Create S3 bucket:**
```bash
aws s3 mb s3://weatherwise-frontend
aws s3 website s3://weatherwise-frontend --index-document index.html
```

3. **Upload build files:**
```bash
aws s3 sync .next/static s3://weatherwise-frontend/_next/static
aws s3 cp .next/standalone s3://weatherwise-frontend --recursive
```

4. **Create CloudFront distribution:**
   - Origin: S3 bucket
   - Default root object: index.html
   - Enable HTTPS
   - Set environment variable: `NEXT_PUBLIC_API_URL` to your backend URL

### Backend Options

#### Option 1: AWS Lambda + API Gateway

1. **Package for Lambda:**
```bash
cd backend
pip install -r requirements.txt -t .
zip -r lambda-deployment.zip . -x "*.pyc" "__pycache__/*"
```

2. **Create Lambda function:**
```bash
aws lambda create-function \
  --function-name weatherwise-backend \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler app.main.handler \
  --zip-file fileb://lambda-deployment.zip
```

3. **Configure API Gateway:**
   - Create REST API
   - Create resources matching your routes
   - Integrate with Lambda function
   - Deploy to stage

#### Option 2: EC2 with Docker

1. **Launch EC2 instance:**
   - AMI: Amazon Linux 2023
   - Instance type: t3.medium or larger
   - Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Install Docker:**
```bash
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo usermod -aG docker ec2-user
```

3. **Deploy application:**
```bash
# Clone repository
git clone <repo-url>
cd WeatherWise

# Build and run
docker-compose -f docker-compose.prod.yml up -d
```

4. **Set up Application Load Balancer:**
   - Create target group pointing to EC2
   - Create ALB with HTTPS listener
   - Configure health checks

### Database (RDS)

1. **Create RDS PostgreSQL instance:**
```bash
aws rds create-db-instance \
  --db-instance-identifier weatherwise-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20
```

2. **Update backend DATABASE_URL:**
```env
DATABASE_URL=postgresql+asyncpg://admin:password@weatherwise-db.region.rds.amazonaws.com/weatherwise
```

## GCP Deployment

### Frontend (Cloud Storage + Load Balancer)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Create Cloud Storage bucket:**
```bash
gsutil mb gs://weatherwise-frontend
gsutil web set -m index.html gs://weatherwise-frontend
```

3. **Upload files:**
```bash
gsutil -m cp -r .next/static gs://weatherwise-frontend/_next/static
gsutil -m cp -r out/* gs://weatherwise-frontend/
```

4. **Configure Load Balancer:**
   - Create backend bucket
   - Create URL map
   - Create HTTPS proxy
   - Create forwarding rule

### Backend (Cloud Run)

1. **Build and push Docker image:**
```bash
# Set project
gcloud config set project PROJECT_ID

# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/weatherwise-backend ./backend

# Or use Docker directly
docker build -t gcr.io/PROJECT_ID/weatherwise-backend ./backend
docker push gcr.io/PROJECT_ID/weatherwise-backend
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy weatherwise-backend \
  --image gcr.io/PROJECT_ID/weatherwise-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "OPENWEATHER_API_KEY=your-key,DATABASE_URL=your-db-url"
```

3. **Set up Cloud SQL:**
```bash
gcloud sql instances create weatherwise-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create weatherwise --instance=weatherwise-db
```

4. **Connect Cloud Run to Cloud SQL:**
```bash
gcloud run services update weatherwise-backend \
  --add-cloudsql-instances=PROJECT_ID:us-central1:weatherwise-db \
  --set-env-vars "DATABASE_URL=postgresql+asyncpg://user:pass@/weatherwise?host=/cloudsql/PROJECT_ID:us-central1:weatherwise-db"
```

## Environment Variables

### Backend (Production)

```env
APP_NAME=WeatherWise API
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<strong-random-secret>
DATABASE_URL=<production-database-url>
OPENWEATHER_API_KEY=<your-openweather-api-key>
ALLOWED_ORIGINS=["https://yourdomain.com"]
ML_MODEL_PATH=ml/models/weather_lstm.pt
ML_SCALER_PATH=ml/models/scaler.pkl
```

### Frontend (Production)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## ML Model Deployment

The ML model files must be included in the backend deployment:

1. **Train the model locally:**
```bash
cd ml
python train_model.py
```

2. **Copy model files to deployment:**
```bash
cp ml/models/weather_lstm.pt backend/ml/models/
cp ml/models/scaler.pkl backend/ml/models/
```

3. **Ensure model paths are correct in environment variables**

## CI/CD Setup

The GitHub Actions workflow (`.github/workflows/ci.yml`) can be extended for automatic deployment:

1. **Add deployment secrets to GitHub:**
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - GCP_SERVICE_ACCOUNT_KEY

2. **Add deployment step to workflow:**
```yaml
- name: Deploy to AWS
  if: github.ref == 'refs/heads/main'
  run: |
    # Deployment commands
```

## Monitoring

### AWS CloudWatch
- Set up log groups for Lambda/EC2
- Create alarms for errors
- Monitor API Gateway metrics

### GCP Cloud Monitoring
- Enable Cloud Run monitoring
- Set up alerting policies
- Monitor request latency and errors

## Security Checklist

- [ ] Use HTTPS everywhere
- [ ] Set strong SECRET_KEY
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Enable database encryption
- [ ] Set up WAF (Web Application Firewall)
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

## Cost Optimization

- Use appropriate instance sizes
- Enable auto-scaling
- Use Cloud CDN for static assets
- Set up database connection pooling
- Monitor and optimize ML model inference time

## Troubleshooting

### Backend not starting
- Check environment variables
- Verify database connection
- Ensure ML model files exist
- Check logs: `docker logs weatherwise-backend`

### Frontend build fails
- Verify Node.js version (20+)
- Clear `.next` directory
- Check for TypeScript errors

### ML predictions fail
- Verify model files are present
- Check model file paths
- Ensure PyTorch is installed correctly

