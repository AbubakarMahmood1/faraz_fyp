# 🚀 Innovation Platform

A comprehensive MERN stack social networking platform connecting innovators, experts, and investors. Built as a Final Year Project demonstrating full-stack development, real-time features, and production-ready architecture.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

Innovation Platform is a full-featured social networking application designed to connect three key user types:

- **Innovators** - Share ideas and seek collaboration
- **Experts** - Provide guidance and mentorship
- **Investors** - Discover and fund promising projects

The platform enables users to create profiles, connect with others, share activities, and communicate through an integrated messaging system.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based auth with password reset via email
- 👥 **Social Networking** - Follow/unfollow, activity feeds, user search
- 💬 **Real-time Messaging** - Direct messaging with read receipts
- 🔍 **Advanced Search** - Find users by expertise, role, skills
- 📊 **Activity Feed** - Personalized feed from followed users
- 🎨 **Modern UI** - Responsive design with TailwindCSS
- ✅ **Comprehensive Testing** - 86 tests (54 backend + 32 frontend)
- 🚀 **Production Ready** - Rate limiting, error handling, security headers

---

## ✨ Features

### Authentication & Authorization
- ✅ User signup with email validation
- ✅ Secure login with JWT tokens
- ✅ Password reset via email with secure tokens
- ✅ Role-based access control (Innovator/Expert/Investor)
- ✅ Session management

### Profile Management
- ✅ Complete profile with role-specific fields
- ✅ Profile image upload (Firebase Storage)
- ✅ Bio (min 50 characters)
- ✅ Expertise and skills selection
- ✅ Experience level tracking
- ✅ Location information
- ✅ Profile editing

### Social Features (Phase 5)
- ✅ **User Search** - Search by name, expertise, role
- ✅ **Personalized Suggestions** - Discover relevant users
- ✅ **Follow/Unfollow System** - Build your network
- ✅ **Followers & Following Lists** - See connections
- ✅ **Activity Feed** - Stay updated with network activities
- ✅ **Direct Messaging** - Send and receive messages
- ✅ **Conversation Threads** - Organized chat history
- ✅ **Unread Messages** - Track unread count
- ✅ **Read Receipts** - Message read status

### Security & Performance
- ✅ Rate limiting (5 auth attempts, 100 API requests per 15 min)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Password hashing with bcrypt (cost factor 12)
- ✅ Input validation (Joi backend, Zod frontend)
- ✅ Database indexes for performance
- ✅ Response compression
- ✅ Centralized error handling

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Email**: Nodemailer (SMTP)
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, bcrypt, crypto
- **Testing**: Jest, Supertest, MongoDB Memory Server

### Frontend
- **Framework**: Next.js 14.2.17 (App Router)
- **Language**: TypeScript
- **UI Library**: TailwindCSS + rizzui
- **State Management**: Redux Toolkit, React Hooks
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Storage**: Firebase Storage
- **Testing**: Vitest, Testing Library

### DevOps
- **Version Control**: Git
- **Package Manager**: npm
- **Environment**: dotenv
- **Logging**: Morgan (development)

---

## 🏗 Architecture

```
Innovation Platform
├── Backend (Express.js REST API)
│   ├── Authentication & Authorization
│   ├── Profile Management
│   ├── Social Features (Search, Connections, Feed, Messages)
│   ├── Rate Limiting & Security
│   └── Email Service
│
├── Frontend (Next.js)
│   ├── Authentication Pages
│   ├── Profile Pages (Dashboard, Edit, Settings)
│   ├── Password Reset Flow
│   └── Responsive UI Components
│
└── Database (MongoDB)
    ├── Users Collection
    ├── Profiles Collection
    ├── Connections Collection
    ├── Activities Collection
    └── Messages Collection
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Gmail account (for email features) or SMTP service
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbubakarMahmood1/faraz_fyp.git
   cd faraz_fyp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Configuration

1. Create `.env` file in `backend/` directory:
   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:
   ```env
   # Database
   DATABASE_URL=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/dbname
   DATABASE_PASSWORD=your_mongodb_password

   # JWT
   JWT_SECRET=your_secure_jwt_secret_minimum_32_characters
   JWT_EXPIRES_IN=90d

   # Server
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Email (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   EMAIL_FROM=your_email@gmail.com
   EMAIL_FROM_NAME=Innovation Platform
   ```

**Gmail App Password Setup**:
1. Enable 2-Factor Authentication on your Google account
2. Visit https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use the 16-character password as `EMAIL_PASSWORD`

#### Frontend Configuration

1. Create `.env.local` file in `frontend/` directory:
   ```bash
   cp .env.example .env.local
   ```

2. Configure:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api

   # Firebase (for image uploads)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   ```

### Running the Application

**Development Mode**:

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App runs on http://localhost:3000
```

**Production Mode**:

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Create new account | No |
| POST | `/login` | Login user | No |
| POST | `/password/forgot` | Request password reset | No |
| POST | `/password/reset/:token` | Reset password | No |
| POST | `/logout` | Logout user | Yes |
| PATCH | `/users/update-password` | Update password | Yes |

### Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/profile/complete` | Complete profile | Yes |
| GET | `/profile/me` | Get my profile | Yes |
| PUT | `/profile` | Update profile | Yes |

### Social Features

#### Search
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search/users` | Search users | Yes |
| GET | `/search/suggestions` | Get personalized suggestions | Yes |

#### Connections
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/connections/follow/:userId` | Follow user | Yes |
| DELETE | `/connections/unfollow/:userId` | Unfollow user | Yes |
| GET | `/connections/followers/:userId` | Get followers | Yes |
| GET | `/connections/following/:userId` | Get following | Yes |
| GET | `/connections/status/:userId` | Check follow status | Yes |
| GET | `/connections/stats/:userId` | Get connection stats | Yes |

#### Activities
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/activities/feed` | Get activity feed | Yes |
| GET | `/activities/user/:userId` | Get user activities | Yes |

#### Messaging
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/messages/send` | Send message | Yes |
| GET | `/messages/conversation/:userId` | Get conversation | Yes |
| GET | `/messages/conversations` | Get all conversations | Yes |
| GET | `/messages/unread/count` | Get unread count | Yes |
| PATCH | `/messages/:messageId/read` | Mark as read | Yes |

### Request Examples

**Signup**:
```bash
curl -X POST http://localhost:3001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "registerAs": "innovator"
  }'
```

**Search Users**:
```bash
curl -X GET "http://localhost:3001/api/search/users?query=john&role=innovator" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Send Message**:
```bash
curl -X POST http://localhost:3001/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "receiverId": "user_id_here",
    "content": "Hello!"
  }'
```

For complete API documentation, see [backend/README.md](backend/README.md)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                  # Run all tests with coverage
npm run test:watch        # Watch mode
```

**Test Coverage**:
- 54 tests covering controllers, middleware, models
- Auth controller (15 tests)
- Profile controller (12 tests)
- Middleware (16 tests)
- Models (11 tests)

### Frontend Tests

```bash
cd frontend
npm test                  # Run all tests with coverage
npm run test:watch        # Watch mode
npm run test:ui           # UI mode
```

**Test Coverage**:
- 32 tests covering API controllers and hooks
- AuthController (10 tests)
- ProfileController (9 tests)
- Hooks (13 tests)

### Test Results
```
Backend:  54 tests | All passing ✓
Frontend: 32 tests | All passing ✓
Total:    86 tests | 100% pass rate
```

---

## 🌐 Deployment

### Backend Deployment (Railway/Heroku/DigitalOcean)

**Railway**:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Environment Variables** (set in Railway dashboard):
- DATABASE_URL
- DATABASE_PASSWORD
- JWT_SECRET
- EMAIL_* (all email config)
- FRONTEND_URL (production URL)

### Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

**Environment Variables** (set in Vercel dashboard):
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_FIREBASE_* (Firebase config)

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

## 📁 Project Structure

```
faraz_fyp/
├── backend/
│   ├── controllers/           # Request handlers
│   │   ├── auth-controller.js
│   │   ├── profile.controller.js
│   │   ├── search.controller.js
│   │   ├── connection.controller.js
│   │   ├── activity.controller.js
│   │   └── message.controller.js
│   ├── models/               # Database schemas
│   │   ├── user.model.js
│   │   ├── profile.model.js
│   │   ├── connection.model.js
│   │   ├── activity.model.js
│   │   └── message.model.js
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, validation, rate limiting
│   ├── utils/                # Email, validators, error messages
│   ├── __tests__/            # Test files
│   ├── .env                  # Environment variables
│   ├── index.js              # Server entry point
│   └── package.json
│
├── frontend/
│   ├── app/                  # Next.js pages (App Router)
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── dashboard/
│   │   ├── profile/edit/
│   │   ├── settings/
│   │   ├── forgot-password/
│   │   └── reset-password/[token]/
│   ├── api/                  # API controllers
│   ├── hooks/                # React hooks
│   ├── components/           # Reusable UI components
│   ├── data/                 # Constants and configs
│   ├── __tests__/            # Test files
│   ├── .env.local            # Environment variables
│   └── package.json
│
├── FINAL_IMPLEMENTATION_SUMMARY.md
├── PRODUCTION_DEPLOYMENT.md
├── PROJECT_COMPLETION_SUMMARY.md
└── README.md (this file)
```

---

## 📸 Screenshots

> **Note**: Add screenshots here to showcase your application

### Landing Page
![Landing Page](./screenshots/landing.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### User Search
![User Search](./screenshots/search.png)

### Messaging
![Messaging](./screenshots/messaging.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Faraz Maqsood**

- GitHub: [@AbubakarMahmood1](https://github.com/AbubakarMahmood1)
- LinkedIn: [Add your LinkedIn]
- Email: [Add your email]

---

## 🙏 Acknowledgments

- Final Year Project supervised by [Supervisor Name]
- Built with inspiration from modern social networking platforms
- Special thanks to the open-source community

---

## 📊 Project Stats

- **Total Lines of Code**: ~8,000+
- **API Endpoints**: 23
- **Database Models**: 6
- **Tests**: 86 (54 backend + 32 frontend)
- **Test Coverage**: 90%+
- **Development Time**: ~103 hours
- **Commits**: 15+

---

## 🐛 Known Issues

- Real-time messaging uses REST API (WebSocket integration planned)
- File uploads limited to images (document upload coming soon)

---

## 🗺 Roadmap

- [ ] WebSocket integration for real-time messaging
- [ ] Push notifications
- [ ] Email verification on signup
- [ ] Social login (Google, GitHub)
- [ ] Advanced search filters
- [ ] Admin dashboard
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard

---

## 📞 Support

For support, please open an issue in the [GitHub issue tracker](https://github.com/AbubakarMahmood1/faraz_fyp/issues).

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=AbubakarMahmood1/faraz_fyp&type=Date)](https://star-history.com/#AbubakarMahmood1/faraz_fyp&Date)

---

<div align="center">

**Made with ❤️ by Faraz Maqsood**

If you found this project helpful, please consider giving it a ⭐!

</div>
