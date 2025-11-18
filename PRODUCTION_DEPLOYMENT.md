# Production Deployment Guide

Complete guide for deploying the Innovation Platform to production.

## Prerequisites

- MongoDB Atlas account (or self-hosted MongoDB)
- Node.js hosting (Heroku, Railway, DigitalOcean, AWS, etc.)
- Domain name (optional)
- SSL certificate (recommended)

## Backend Deployment

### 1. Environment Configuration

Create production `.env` file with secure values:

```env
NODE_ENV=production
PORT=3001

# Database (MongoDB Atlas)
DATABASE_URL=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/production_db?retryWrites=true&w=majority
DATABASE_PASSWORD=your_secure_mongodb_password

# JWT (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_64_character_secure_random_string_here
JWT_EXPIRES_IN=90d

# Frontend URL (Production)
FRONTEND_URL=https://yourdomain.com
```

### 2. Security Checklist

- [x] Rate limiting enabled (auth: 5/15min, API: 100/15min)
- [x] Helmet security headers configured
- [x] CORS restricted to frontend URL only
- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT tokens with expiration
- [x] Input validation on all endpoints (Joi)
- [x] Environment variables for sensitive data
- [x] Error messages sanitized in production
- [ ] SSL/TLS certificate installed
- [ ] Database credentials rotated regularly
- [ ] JWT secret rotated periodically

### 3. Database Setup (MongoDB Atlas)

1. Create production cluster
2. Set up database user with strong password
3. Configure IP whitelist (or allow from anywhere if using cloud hosting)
4. Create database indexes (automatically created by Mongoose):
   - User: email, username, registerAs, isActive
   - Profile: user
5. Enable backup/snapshots
6. Set up monitoring alerts

### 4. Deploy to Hosting Platform

#### Option A: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your_mongodb_url
heroku config:set DATABASE_PASSWORD=your_password
heroku config:set JWT_SECRET=your_secret
heroku config:set FRONTEND_URL=https://yourdomain.com

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

#### Option B: Railway

1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Option C: DigitalOcean App Platform

1. Create new app from GitHub
2. Set environment variables
3. Configure build command: `npm install`
4. Configure run command: `npm start`
5. Deploy

### 5. Post-Deployment

1. Test health endpoint: `https://your-api.com/health`
2. Test authentication endpoints
3. Monitor logs for errors
4. Set up monitoring (e.g., UptimeRobot, Better Uptime)
5. Configure error tracking (e.g., Sentry)

## Frontend Deployment

### 1. Environment Configuration

Create `.env.production` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
# ... other Firebase config
```

### 2. Build for Production

```bash
cd frontend
npm run build
npm start  # or deploy build to hosting
```

### 3. Deploy to Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Other Options:
- **Netlify**: Connect GitHub, auto-deploy on push
- **AWS Amplify**: Continuous deployment from Git
- **DigitalOcean**: Static site hosting

### 4. DNS Configuration

1. Point domain to hosting provider
2. Configure SSL certificate (automatic with Vercel/Netlify)
3. Update CORS in backend to match production domain

## Monitoring & Maintenance

### Health Checks

- Backend: `GET /health`
- Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-11-18T20:00:00.000Z",
  "environment": "production"
}
```

### Logging

Backend logs include:
- Request logs (Morgan in development)
- Error logs (all environments)
- Authentication attempts
- Rate limit violations

### Database Backups

MongoDB Atlas:
- Enable automatic backups
- Set retention period (7-30 days)
- Test restore procedure quarterly

### Performance Monitoring

Monitor:
- API response times
- Database query performance
- Error rates
- Rate limit hits
- Memory usage
- CPU usage

### Security Monitoring

- Failed login attempts
- Rate limit violations
- Unusual API patterns
- Database connection errors
- JWT token expiration issues

## Scaling

### Horizontal Scaling

1. Load balancer in front of multiple backend instances
2. Session-less authentication (JWT) allows any instance to handle requests
3. Database connection pooling configured

### Database Scaling

1. MongoDB Atlas auto-scaling
2. Read replicas for read-heavy operations
3. Database indexes already configured

### Caching

Future improvements:
- Redis for session/token caching
- CDN for static assets
- API response caching

## Backup & Recovery

### Backup Strategy

1. **Database**: Daily automated backups (MongoDB Atlas)
2. **Code**: Version control in Git
3. **Environment Variables**: Securely stored in hosting platform
4. **Media Files**: Firebase Storage (if using file uploads)

### Recovery Plan

1. Database restore from MongoDB Atlas backup
2. Redeploy application from Git
3. Restore environment variables
4. Verify health check passes
5. Test critical user flows

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL and DATABASE_PASSWORD
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

**JWT Invalid/Expired**
- Verify JWT_SECRET matches across deploys
- Check token expiration time
- Ensure system clocks are synchronized

**CORS Errors**
- Verify FRONTEND_URL matches actual frontend domain
- Check CORS configuration in backend
- Ensure credentials: true in requests

**Rate Limit Exceeded**
- Legitimate: Increase limits in rateLimiter.middleware.js
- Attack: Investigate IP patterns, consider IP blocking

## Rollback Procedure

1. Identify last working deployment
2. Rollback to previous Git commit/tag
3. Redeploy
4. Verify health check
5. Monitor logs

## Support & Maintenance

### Regular Tasks

- **Weekly**: Review error logs
- **Monthly**: Rotate credentials (if policy requires)
- **Quarterly**: Security audit
- **Annually**: Dependency updates (npm audit fix)

### Update Process

1. Test updates in development
2. Run full test suite
3. Deploy to staging (if available)
4. Monitor for issues
5. Deploy to production
6. Monitor for issues

## Cost Optimization

### Free Tier Options

- **Backend**: Railway free tier, Heroku free tier (with limitations)
- **Database**: MongoDB Atlas M0 (512MB free)
- **Frontend**: Vercel free tier (generous limits)
- **Monitoring**: UptimeRobot free tier

### Paid Recommendations

- **Backend**: Railway ($5-20/month), DigitalOcean ($12/month)
- **Database**: MongoDB Atlas M10+ ($57/month)
- **CDN**: Cloudflare (free) or AWS CloudFront
- **Monitoring**: Better Uptime, Sentry

## Security Best Practices

1. **Never commit `.env` files** - Use .gitignore
2. **Rotate secrets regularly** - JWT_SECRET, DB passwords
3. **Use environment variables** - Never hardcode secrets
4. **Enable 2FA** - On hosting accounts
5. **Review dependencies** - Run `npm audit` regularly
6. **Monitor logs** - Check for suspicious activity
7. **Rate limiting** - Already implemented
8. **HTTPS only** - Enforce SSL/TLS
9. **Input validation** - Already implemented with Joi
10. **SQL injection prevention** - Using Mongoose ODM

## Compliance

### GDPR (if applicable)

- User data deletion endpoint (TODO)
- Data export capability (TODO)
- Privacy policy
- Cookie consent

### Data Protection

- Passwords hashed, never stored plain
- JWT tokens expire
- HTTPS encryption in transit
- Database encryption at rest (MongoDB Atlas)

---

**Last Updated**: November 2025
**Deployment Status**: Ready for Production ✅
