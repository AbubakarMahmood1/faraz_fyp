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

- 🔐 **Secure Authentication** - JWT + OAuth (Google/GitHub), email verification, password reset
- 👥 **Social Networking** - Follow/unfollow, activity feeds, advanced user search
- 💬 **Real-time Messaging** - WebSocket-powered chat with typing indicators & read receipts
- 🔍 **Advanced Search** - Multi-filter search by expertise, skills, location, experience
- 📊 **Analytics Dashboard** - Personal insights, engagement metrics, activity trends
- 👨‍💼 **Admin Panel** - User management, platform statistics, system health monitoring
- 🎨 **Modern UI** - Responsive design with TailwindCSS and shadcn/ui
- ✅ **Comprehensive Testing** - 86 tests (54 backend + 32 frontend)
- 🚀 **Production Ready** - Rate limiting, error handling, security headers

---

## ✨ Features

### Authentication & Authorization
- ✅ User signup with email validation
- ✅ Email verification with secure tokens (24-hour expiry)
- ✅ Secure login with JWT tokens
- ✅ Social login via Google & GitHub OAuth (NextAuth.js)
- ✅ Password reset via email with secure tokens (10-minute expiry)
- ✅ Role-based access control (User/Admin/Superadmin)
- ✅ User types (Innovator/Expert/Investor/Explorer)
- ✅ Session management with auto-refresh

### Profile Management
- ✅ Complete profile with role-specific fields
- ✅ Profile image upload (Firebase Storage)
- ✅ Bio (min 50 characters)
- ✅ Expertise and skills selection
- ✅ Experience level tracking
- ✅ Location information
- ✅ Profile editing

### Social Features
- ✅ **Advanced User Search** - Multi-filter search (name, expertise, skills, experience, location)
- ✅ **Filter Options API** - Dynamic filter options for all user attributes
- ✅ **Personalized Suggestions** - Discover relevant users based on your profile
- ✅ **Follow/Unfollow System** - Build your network
- ✅ **Followers & Following Lists** - View connections with counts
- ✅ **Connection Status** - Check follow relationship status
- ✅ **Activity Feed** - Personalized feed from followed users
- ✅ **Real-time Messaging** - WebSocket-powered instant messaging
- ✅ **Typing Indicators** - See when someone is typing
- ✅ **Read Receipts** - Single/double check marks for message status
- ✅ **Online Status** - Real-time user presence tracking
- ✅ **Conversation Management** - Organized chat threads with search
- ✅ **Message Notifications** - In-app notifications for new messages
- ✅ **Unread Count Tracking** - Badge counts on conversations

### Admin Panel
- ✅ **Platform Statistics** - Total users, activities, connections, messages
- ✅ **User Management** - View, search, filter all users with pagination
- ✅ **User Details** - Comprehensive user info with stats
- ✅ **Status Management** - Activate/deactivate user accounts
- ✅ **Role Management** - Update user roles (superadmin only)
- ✅ **User Deletion** - Delete users with cascade deletion (superadmin only)
- ✅ **System Health** - Server uptime, memory, CPU, database monitoring
- ✅ **Analytics Charts** - Signup trends, user distribution by role/provider
- ✅ **Time Range Filtering** - View stats for 7/30/90/365 days

### Analytics Dashboard
- ✅ **Personal Analytics** - Followers, following, messages, activities overview
- ✅ **Profile Completeness Score** - Visual progress indicator with recommendations
- ✅ **Engagement Metrics** - Response rate, unique conversations, avg daily activity
- ✅ **Activity Trends** - Daily activity chart (last 7 days)
- ✅ **Message Trends** - Sent/received message chart (last 7 days)
- ✅ **Connection Growth** - Follower growth chart (last 30 days)
- ✅ **Activity Breakdown** - Pie chart by activity type
- ✅ **Behavioral Insights** - Most active day, most active hour
- ✅ **Activity Timeline** - Recent activity feed with details

### Security & Performance
- ✅ Rate limiting (5 auth attempts, 100 API requests per 15 min)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Password hashing with bcrypt (cost factor 12)
- ✅ Input validation (Joi backend, Zod frontend)
- ✅ Database indexes for performance
- ✅ Response compression
- ✅ Centralized error handling
- ✅ Socket.io authentication middleware
- ✅ JWT verification for WebSocket connections

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Real-time**: Socket.io (WebSocket)
- **Email**: Nodemailer (SMTP)
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, bcrypt, crypto
- **Testing**: Jest, Supertest, MongoDB Memory Server

### Frontend
- **Framework**: Next.js 14.2.17 (App Router)
- **Language**: TypeScript
- **UI Library**: TailwindCSS + shadcn/ui + rizzui
- **Authentication**: NextAuth.js (OAuth)
- **Real-time**: Socket.io-client
- **Charts**: Recharts
- **State Management**: Redux Toolkit, React Hooks, Context API
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
├── Backend (Express.js REST API + WebSocket)
│   ├── Authentication & Authorization (JWT + OAuth)
│   ├── Email Verification Service
│   ├── Profile Management
│   ├── Social Features (Search, Connections, Feed)
│   ├── Real-time Messaging (Socket.io)
│   ├── Admin Panel (User Management, Stats, System Health)
│   ├── Analytics Engine (Personal Insights, Engagement Metrics)
│   ├── Rate Limiting & Security
│   └── Email Service (Nodemailer)
│
├── Frontend (Next.js + TypeScript)
│   ├── Authentication (Login, Signup, OAuth, Email Verification)
│   ├── Profile Pages (Dashboard, Edit, Settings)
│   ├── Password Reset Flow
│   ├── User Search & Discovery
│   ├── Real-time Messaging Interface
│   ├── Admin Dashboard (User Management, Platform Stats)
│   ├── Analytics Dashboard (Charts, Metrics, Timeline)
│   └── Responsive UI Components (shadcn/ui)
│
└── Database (MongoDB)
    ├── Users Collection (Auth, OAuth, Roles)
    ├── Profiles Collection (Details, Skills, Projects)
    ├── Connections Collection (Follow/Unfollow)
    ├── Activities Collection (Activity Feed)
    └── Messages Collection (Chat History)
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
   # API
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api

   # NextAuth (OAuth)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # GitHub OAuth
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Firebase (for image uploads)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   ```

**OAuth Setup**:
- **Google**: Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub**: Create OAuth app at [GitHub Settings](https://github.com/settings/developers)

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
| POST | `/social-login` | OAuth login (Google/GitHub) | No |
| POST | `/password/forgot` | Request password reset | No |
| POST | `/password/reset/:token` | Reset password | No |
| POST | `/logout` | Logout user | Yes |
| PATCH | `/users/update-password` | Update password | Yes |

### Email Verification

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/send-verification` | Send verification email | Yes |
| POST | `/auth/verify-email/:token` | Verify email with token | No |
| POST | `/auth/resend-verification` | Resend verification email | Yes |

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

### Admin Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/admin/stats` | Platform statistics | Yes | Admin/Superadmin |
| GET | `/admin/system-health` | System health metrics | Yes | Admin/Superadmin |
| GET | `/admin/users` | Get all users (paginated) | Yes | Admin/Superadmin |
| GET | `/admin/users/:userId` | Get user details | Yes | Admin/Superadmin |
| PATCH | `/admin/users/:userId/status` | Update user status | Yes | Admin/Superadmin |
| PATCH | `/admin/users/:userId/role` | Update user role | Yes | Superadmin |
| DELETE | `/admin/users/:userId` | Delete user | Yes | Superadmin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/personal` | Personal analytics | Yes |
| GET | `/analytics/engagement` | Engagement metrics | Yes |
| GET | `/analytics/timeline` | Activity timeline | Yes |

### WebSocket Events

**Connection**: `ws://localhost:3001` (Socket.io)

**Events Emitted** (Client → Server):
- `join_conversation` - Join chat room
- `leave_conversation` - Leave chat room
- `send_message` - Send message
- `mark_read` - Mark message as read
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `get_online_users` - Request online users list
- `get_unread_count` - Request unread count

**Events Received** (Server → Client):
- `message_sent` - Message sent confirmation
- `new_message` - New message received
- `message_read` - Message marked as read
- `message_notification` - New message notification
- `user_typing` - Typing indicator
- `user_status` - User online/offline status
- `online_users` - List of online users
- `unread_count` - Unread message count

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
│   │   ├── auth-controller.js       # Auth, OAuth, Email Verification
│   │   ├── profile.controller.js    # Profile CRUD
│   │   ├── search.controller.js     # Advanced Search
│   │   ├── connection.controller.js # Follow/Unfollow
│   │   ├── activity.controller.js   # Activity Feed
│   │   ├── message.controller.js    # Messaging REST API
│   │   ├── admin.controller.js      # Admin Panel
│   │   └── analytics.controller.js  # Analytics
│   ├── models/               # Database schemas
│   │   ├── user.model.js            # Users, OAuth, Roles
│   │   ├── profile.model.js         # User Profiles
│   │   ├── connection.model.js      # Connections
│   │   ├── activity.model.js        # Activities
│   │   └── message.model.js         # Messages
│   ├── routes/               # API routes
│   │   ├── profile.routes.js
│   │   ├── user.routes.js
│   │   ├── verification.routes.js   # Email Verification
│   │   ├── search.routes.js
│   │   ├── connection.routes.js
│   │   ├── activity.routes.js
│   │   ├── message.routes.js
│   │   ├── admin.routes.js          # Admin Routes
│   │   └── analytics.routes.js      # Analytics Routes
│   ├── middleware/           # Middleware
│   │   ├── auth.middleware.js       # JWT Auth
│   │   ├── admin.middleware.js      # Admin Auth
│   │   ├── socket.middleware.js     # Socket.io Auth
│   │   ├── validation.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   └── error.middleware.js
│   ├── socket/               # WebSocket handlers
│   │   └── messageHandlers.js       # Real-time messaging
│   ├── utils/                # Utilities
│   │   ├── email.js                 # Email Service
│   │   ├── validators.js
│   │   └── errorMessages.js
│   ├── __tests__/            # Test files
│   ├── .env                  # Environment variables
│   ├── index.js              # Server entry (Express + Socket.io)
│   └── package.json
│
├── frontend/
│   ├── app/                  # Next.js pages (App Router)
│   │   ├── api/auth/[...nextauth]/  # NextAuth OAuth
│   │   ├── signin/                  # Login + OAuth
│   │   ├── signup/                  # Signup
│   │   ├── verify-email/            # Email Verification
│   │   ├── dashboard/               # User Dashboard
│   │   ├── profile/edit/            # Edit Profile
│   │   ├── settings/                # Settings
│   │   ├── forgot-password/         # Forgot Password
│   │   ├── reset-password/[token]/  # Reset Password
│   │   ├── search/                  # Advanced Search
│   │   ├── messages/                # Real-time Messaging
│   │   ├── analytics/               # Analytics Dashboard
│   │   └── admin/                   # Admin Panel
│   │       └── users/               # User Management
│   ├── contexts/             # React Context
│   │   ├── AuthContext.tsx
│   │   └── SocketContext.tsx        # Socket.io Context
│   ├── lib/socket/           # WebSocket client
│   │   └── socketService.ts         # Socket.io Service
│   ├── components/           # UI components (shadcn/ui)
│   ├── hooks/                # React hooks
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

- **Total Lines of Code**: ~12,000+
- **API Endpoints**: 35+ (REST) + 8 (WebSocket Events)
- **Database Models**: 5
- **Controllers**: 8
- **Routes**: 9
- **Middleware**: 6
- **Tests**: 86 (54 backend + 32 frontend)
- **Test Coverage**: 90%+
- **Development Time**: ~125 hours
- **Commits**: 20+
- **Features**:
  - ✅ Authentication (Local + OAuth)
  - ✅ Email Verification
  - ✅ Profile Management
  - ✅ Advanced Search
  - ✅ Social Networking
  - ✅ Real-time Messaging (WebSocket)
  - ✅ Admin Panel
  - ✅ Analytics Dashboard

---

## 🐛 Known Issues

- File uploads limited to images (document upload coming soon)
- OAuth callback URLs must be configured in Google/GitHub developer console

---

## 🗺 Roadmap

### ✅ Completed
- [x] Email verification on signup
- [x] Social login (Google, GitHub OAuth)
- [x] Advanced search filters
- [x] Admin dashboard
- [x] WebSocket integration for real-time messaging
- [x] Analytics dashboard

### 🔜 Future Enhancements
- [ ] Push notifications (Web Push API)
- [ ] Document & file uploads
- [ ] Video call integration (WebRTC)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (ML-based insights)
- [ ] Content moderation
- [ ] Multi-language support (i18n)

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
