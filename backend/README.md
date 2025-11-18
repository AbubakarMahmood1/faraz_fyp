# FYP Backend API

Innovation Platform Backend - Final Year Project

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **Password Reset**: Email-based password reset with secure tokens (10min expiry)
- **Email Service**: Nodemailer integration for transactional emails
- **Profile Management**: Complete user profile system with role-based fields
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security best practices
- **Error Handling**: Centralized error handling with environment-aware responses
- **Request Logging**: Morgan logging in development mode
- **Database Indexes**: Optimized queries for better performance
- **Input Validation**: Joi validation on all endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer (SMTP)
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, bcryptjs, crypto
- **Performance**: Compression middleware
- **Testing**: Jest, Supertest, MongoDB Memory Server

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd backend
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Database
DATABASE_URL=your_mongodb_connection_string
DATABASE_PASSWORD=your_database_password

# JWT
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
JWT_EXPIRES_IN=90d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (Required for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Innovation Platform
```

**Email Setup Guide:**
- For Gmail: Enable 2FA, then create an [App Password](https://myaccount.google.com/apppasswords)
- For SendGrid: Use API key as password with `apikey` as username
- For Mailgun: Use SMTP credentials from Mailgun dashboard

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/signup` | Create new user account | 5/15min |
| POST | `/api/login` | Login user | 5/15min |
| POST | `/api/password/forgot` | Send password reset email | 5/15min |
| POST | `/api/password/reset/:token` | Reset password with token | 5/15min |

### Authentication (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/logout` | Logout current user |
| PATCH | `/api/users/update-password` | Update password |

### Profile (Protected)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/profile/complete` | Complete user profile | 100/15min |
| GET | `/api/profile/me` | Get current user's profile | 100/15min |
| PUT | `/api/profile` | Update profile | 100/15min |

### Users (Public)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/users/:username` | Get user by username | 100/15min |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

## Request/Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error message"
}
```

## Testing

### Run all tests with coverage:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run unit tests only:
```bash
npm run test:unit
```

### Test Coverage Goals

- Statements: 80%+
- Branches: 80%+
- Functions: 80%+
- Lines: 80%+

## Project Structure

```
backend/
├── controllers/          # Request handlers
│   ├── auth-controller.js
│   ├── profile.controller.js
│   └── user-controller.js
├── middleware/          # Custom middleware
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── rateLimiter.middleware.js
│   └── validation.middleware.js
├── models/              # Database schemas
│   ├── profile.model.js
│   └── user.model.js
├── routes/              # Route definitions
│   ├── profile.routes.js
│   └── user.routes.js
├── utils/               # Utility functions
│   └── validators.js
├── __tests__/           # Test files
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── setup.js
├── index.js             # Application entry point
├── jest.config.js       # Jest configuration
└── package.json         # Dependencies and scripts
```

## Security Features

### Rate Limiting
- Authentication endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Profile endpoints: 20 updates per 15 minutes

### Security Headers (Helmet.js)
- Content Security Policy
- X-DNS-Prefetch-Control
- X-Frame-Options (clickjacking protection)
- X-Content-Type-Options (MIME sniffing protection)
- X-XSS-Protection

### Password Security
- Bcrypt hashing with cost factor 12
- Minimum 6 characters
- Stored hashed, never plain text

### CORS
- Restricted to frontend URL only
- Credentials enabled for cookie-based authentication

## Error Handling

### Development Mode
- Detailed error information
- Stack traces included
- Full error object

### Production Mode
- Sanitized error messages
- No stack traces
- Generic error messages for security

## Performance Optimization

- **Compression**: Gzip compression for all responses
- **Database Indexes**: Indexed fields for faster queries
  - User: email, username, registerAs, isActive
  - Profile: user
- **Connection Pooling**: MongoDB connection pooling
- **Selective Field Returns**: Password excluded from user queries

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | MongoDB connection string | Yes |
| DATABASE_PASSWORD | MongoDB password | Yes |
| JWT_SECRET | Secret key for JWT signing | Yes |
| JWT_EXPIRES_IN | JWT expiration time | Yes |
| PORT | Server port | Yes |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| NODE_ENV | Environment (development/production) | No |

## Maintenance

### Database Migrations
No migrations required - Mongoose handles schema evolution

### Monitoring
- Health check endpoint: `GET /health`
- Request logging in development mode
- Error logging in all environments

## Contributing

1. Follow existing code style
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation

## License

MIT

## Author

Faraz Maqsood - Final Year Project
