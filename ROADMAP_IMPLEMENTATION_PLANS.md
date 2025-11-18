# 🗺️ Roadmap Features - Implementation Analysis & Plans

## Confidence Level Analysis

| Feature | Confidence | Complexity | Time Estimate | Priority |
|---------|-----------|------------|---------------|----------|
| **Email Verification** | ✅ **VERY HIGH** | Low | 2-3 hours | **HIGH** |
| **Advanced Search Filters** | ✅ **VERY HIGH** | Low | 3-4 hours | **MEDIUM** |
| **Social Login (Google/GitHub)** | ✅ **HIGH** | Medium | 4-6 hours | **HIGH** |
| **Admin Dashboard** | ✅ **HIGH** | Medium | 6-8 hours | **MEDIUM** |
| **WebSocket Real-time Messaging** | ✅ **HIGH** | Medium-High | 6-8 hours | **HIGH** |
| **Analytics Dashboard** | ✅ **HIGH** | Medium | 5-7 hours | **MEDIUM** |
| **Push Notifications** | 🟡 **MEDIUM** | Medium-High | 8-10 hours | **LOW** |
| **Mobile App (React Native)** | 🟡 **MEDIUM** | Very High | 40+ hours | **LOW** |

---

## ✅ RECOMMENDED IMPLEMENTATION ORDER

Based on value, complexity, and your existing infrastructure:

1. **Email Verification** (2-3 hrs) - Essential security feature
2. **Advanced Search Filters** (3-4 hrs) - Enhances existing feature
3. **Social Login** (4-6 hrs) - Greatly improves UX
4. **WebSocket Messaging** (6-8 hrs) - Major UX improvement
5. **Admin Dashboard** (6-8 hrs) - Platform management
6. **Analytics Dashboard** (5-7 hrs) - Insights and metrics

**Total: 26-36 hours for all 6 features**

---

# 📋 DETAILED IMPLEMENTATION PLANS

---

## 1️⃣ EMAIL VERIFICATION ON SIGNUP

**Confidence**: ✅ VERY HIGH (95%)
**Time**: 2-3 hours
**Priority**: HIGH (Security essential)

### Overview
Add email verification to prevent fake accounts and verify user ownership of email addresses.

### Implementation Details

#### Backend Changes

**1. Update User Model** (`backend/models/user.model.js`):
```javascript
// Add new fields
emailVerified: {
  type: Boolean,
  default: false,
},
emailVerificationToken: String,
emailVerificationExpires: Date,

// Add method to generate verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};
```

**2. Update Email Service** (`backend/utils/email.js`):
```javascript
// Add new email template
exports.sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Verify Your Email - Innovation Platform',
    html: `
      <h2>Welcome ${username}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationURL}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
```

**3. Update Signup Controller** (`backend/controllers/auth-controller.js`):
```javascript
exports.signup = async (req, res) => {
  try {
    // Create user
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      registerAs: req.body.registerAs,
      emailVerified: false,
    });

    // Generate verification token
    const verificationToken = newUser.createEmailVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationEmail(
      newUser.email,
      newUser.username,
      verificationToken
    );

    // Return token (user can still use app, but with limited access)
    const token = getToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      message: 'Account created! Please check your email to verify.',
      data: { user: newUser },
    });
  } catch (err) {
    // Handle error
  }
};
```

**4. Add Verification Controller** (`backend/controllers/auth-controller.js`):
```javascript
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired verification token',
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully!',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Verification failed',
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.emailVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already verified',
      });
    }

    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.username, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification email',
    });
  }
};
```

**5. Add Routes** (`backend/index.js`):
```javascript
app.get("/api/email/verify/:token", authControllers.verifyEmail);
app.post("/api/email/resend-verification", protect, authControllers.resendVerification);
```

**6. Add Middleware** (Optional - restrict unverified users):
```javascript
// backend/middleware/auth.middleware.js
exports.requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      status: 'fail',
      message: 'Please verify your email to access this feature',
    });
  }
  next();
};
```

#### Frontend Changes

**1. Create Verification Page** (`frontend/app/verify-email/[token]/page.tsx`):
```typescript
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/email/verify/${token}`
        );

        if (response.status === 200) {
          setStatus('success');
          setMessage('Email verified successfully!');
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p className="text-green-600">{message}</p>}
      {status === 'error' && <p className="text-red-600">{message}</p>}
    </div>
  );
}
```

**2. Add Verification Banner** (`frontend/app/dashboard/page.tsx`):
```typescript
// Show banner if email not verified
{!user?.emailVerified && (
  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
    <p className="text-yellow-800">
      Please verify your email address.{' '}
      <button onClick={handleResendVerification} className="underline">
        Resend verification email
      </button>
    </p>
  </div>
)}
```

### Files to Create/Modify

**Backend**:
- ✏️ Modify: `backend/models/user.model.js`
- ✏️ Modify: `backend/utils/email.js`
- ✏️ Modify: `backend/controllers/auth-controller.js`
- ✏️ Modify: `backend/index.js`
- ➕ Optional: `backend/middleware/requireVerification.js`

**Frontend**:
- ➕ Create: `frontend/app/verify-email/[token]/page.tsx`
- ✏️ Modify: `frontend/app/dashboard/page.tsx`

### Testing Checklist
- [ ] Sign up creates unverified user
- [ ] Verification email sent
- [ ] Email link works
- [ ] Token expires after 24 hours
- [ ] Resend verification works
- [ ] Verified users see no banner

### Time Breakdown
- Backend implementation: 1.5 hours
- Frontend implementation: 0.5 hours
- Testing: 0.5-1 hour
- **Total: 2-3 hours**

---

## 2️⃣ ADVANCED SEARCH FILTERS

**Confidence**: ✅ VERY HIGH (95%)
**Time**: 3-4 hours
**Priority**: MEDIUM

### Overview
Extend existing search functionality with advanced filters: experience level, skills, location, availability.

### Implementation Details

#### Backend Changes

**1. Enhance Search Controller** (`backend/controllers/search.controller.js`):
```javascript
exports.advancedSearch = async (req, res) => {
  try {
    const {
      query,
      role,
      expertise,
      skills,
      experienceLevel,
      country,
      city,
      minExperience,
      maxExperience,
      sortBy = 'relevance', // relevance, newest, name
      page = 1,
      limit = 20,
    } = req.query;

    // Build user filter
    const userFilter = { isActive: true };

    if (query) {
      userFilter.$or = [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    if (role) {
      userFilter.registerAs = role;
    }

    // Find matching users
    const users = await User.find(userFilter).select('_id');
    const userIds = users.map(u => u._id);

    // Build profile filter
    const profileFilter = { user: { $in: userIds } };

    if (expertise) {
      const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
      profileFilter.expertise = { $in: expertiseArray };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      profileFilter.skills = { $in: skillsArray };
    }

    if (experienceLevel) {
      profileFilter.experienceLevel = experienceLevel;
    }

    if (country) {
      profileFilter.country = { $regex: country, $options: 'i' };
    }

    if (city) {
      profileFilter.city = { $regex: city, $options: 'i' };
    }

    // Build sort options
    let sortOptions = {};
    if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else if (sortBy === 'name') {
      sortOptions.firstName = 1;
    }

    // Execute query with pagination
    const profiles = await Profile.find(profileFilter)
      .populate('user', 'username email registerAs profileCompleted createdAt')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await Profile.countDocuments(profileFilter);

    // Format results
    const results = profiles.map(profile => ({
      userId: profile.user._id,
      username: profile.user.username,
      email: profile.user.email,
      role: profile.user.registerAs,
      firstName: profile.firstName,
      lastName: profile.lastName,
      profileImage: profile.profileImage,
      bio: profile.bio?.substring(0, 150) + '...',
      expertise: profile.expertise,
      skills: profile.skills,
      experienceLevel: profile.experienceLevel,
      city: profile.city,
      country: profile.country,
      joinedAt: profile.user.createdAt,
    }));

    res.status(200).json({
      status: 'success',
      results: results.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: {
        users: results,
      },
    });
  } catch (err) {
    console.error('Advanced search error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Search failed',
    });
  }
};

// Get filter options (for frontend dropdowns)
exports.getFilterOptions = async (req, res) => {
  try {
    const [
      expertiseList,
      skillsList,
      experienceLevels,
      countries,
    ] = await Promise.all([
      Profile.distinct('expertise'),
      Profile.distinct('skills'),
      Profile.distinct('experienceLevel'),
      Profile.distinct('country'),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        expertise: expertiseList.filter(Boolean),
        skills: skillsList.filter(Boolean),
        experienceLevels: experienceLevels.filter(Boolean),
        countries: countries.filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get filter options',
    });
  }
};
```

**2. Add Routes** (`backend/routes/search.routes.js`):
```javascript
router.get('/advanced', searchController.advancedSearch);
router.get('/filters', searchController.getFilterOptions);
```

#### Frontend Changes

**1. Create Advanced Search Page** (`frontend/app/search/page.tsx`):
```typescript
"use client";
import { useState, useEffect } from "react";
import { Input, Select, MultiSelect, Button } from "rizzui";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<any>(null);
  const [expertise, setExpertise] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [country, setCountry] = useState<any>(null);
  const [experienceLevel, setExperienceLevel] = useState<any>(null);
  const [sortBy, setSortBy] = useState("relevance");

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>({});

  useEffect(() => {
    // Load filter options
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/search/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFilterOptions(response.data.data);
    } catch (error) {
      console.error('Failed to load filters');
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (role) params.append('role', role.value);
      if (expertise.length) expertise.forEach(e => params.append('expertise', e.value));
      if (skills.length) skills.forEach(s => params.append('skills', s.value));
      if (country) params.append('country', country.value);
      if (experienceLevel) params.append('experienceLevel', experienceLevel.value);
      params.append('sortBy', sortBy);

      const response = await axios.get(
        `${API_BASE_URL}/search/advanced?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResults(response.data.data.users);
    } catch (error) {
      console.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Advanced Search</h1>

      {/* Search Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Search"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Select
            label="Role"
            options={[
              { value: 'innovator', label: 'Innovator' },
              { value: 'expert', label: 'Expert' },
              { value: 'investor', label: 'Investor' },
            ]}
            value={role}
            onChange={setRole}
          />

          <MultiSelect
            label="Expertise"
            options={filterOptions.expertise?.map(e => ({ value: e, label: e }))}
            value={expertise}
            onChange={setExpertise}
          />

          <MultiSelect
            label="Skills"
            options={filterOptions.skills?.map(s => ({ value: s, label: s }))}
            value={skills}
            onChange={setSkills}
          />

          <Select
            label="Country"
            options={filterOptions.countries?.map(c => ({ value: c, label: c }))}
            value={country}
            onChange={setCountry}
          />

          <Select
            label="Experience Level"
            options={filterOptions.experienceLevels?.map(e => ({ value: e, label: e }))}
            value={experienceLevel}
            onChange={setExperienceLevel}
          />
        </div>

        <div className="mt-4 flex gap-4">
          <Select
            label="Sort By"
            options={[
              { value: 'relevance', label: 'Relevance' },
              { value: 'newest', label: 'Newest First' },
              { value: 'name', label: 'Name' },
            ]}
            value={{ value: sortBy, label: sortBy }}
            onChange={(option) => setSortBy(option.value)}
          />

          <Button onClick={handleSearch} isLoading={isLoading} className="self-end">
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((user: any) => (
          <UserCard key={user.userId} user={user} />
        ))}
      </div>
    </div>
  );
}
```

### Files to Create/Modify

**Backend**:
- ✏️ Modify: `backend/controllers/search.controller.js`
- ✏️ Modify: `backend/routes/search.routes.js`

**Frontend**:
- ➕ Create: `frontend/app/search/page.tsx`
- ➕ Create: `frontend/components/UserCard.tsx`

### Time Breakdown
- Backend: 1.5 hours
- Frontend: 1.5-2 hours
- Testing: 0.5-1 hour
- **Total: 3-4 hours**

---

## 3️⃣ SOCIAL LOGIN (GOOGLE & GITHUB)

**Confidence**: ✅ HIGH (90%)
**Time**: 4-6 hours
**Priority**: HIGH

### Overview
Add OAuth2 authentication with Google and GitHub for easier signup/login.

### Implementation Details

#### Approach: NextAuth.js (Recommended)

**Why NextAuth.js?**
- Built for Next.js
- Handles OAuth flow automatically
- Secure token management
- Easy to integrate with existing JWT system

#### Backend Changes

**1. Install Dependencies**:
```bash
npm install next-auth @next-auth/mongodb-adapter
```

**2. Create NextAuth API Route** (`frontend/app/api/auth/[...nextauth]/route.ts`):
```typescript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${API_BASE_URL}/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          if (response.data.status === 'success') {
            return {
              id: response.data.data.user._id,
              email: response.data.data.user.email,
              token: response.data.token,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        // Check if user exists in your database
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/social`, {
            provider: account.provider,
            providerId: account.providerAccountId,
            email: user.email,
            name: user.name,
            image: user.image,
          });

          user.token = response.data.token;
          user.id = response.data.user._id;
          return true;
        } catch (error) {
          console.error('Social login error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.token;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**3. Add Social Auth Endpoint** (`backend/controllers/auth-controller.js`):
```javascript
exports.socialAuth = async (req, res) => {
  try {
    const { provider, providerId, email, name, image } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const username = email.split('@')[0] + Math.random().toString(36).substr(2, 4);

      user = await User.create({
        username,
        email,
        registerAs: 'innovator', // Default role
        emailVerified: true, // Social logins are pre-verified
        [`${provider}Id`]: providerId,
        profileImage: image,
      });

      // Create basic profile
      await Profile.create({
        user: user._id,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        bio: 'New user',
        profileImage: image,
      });
    } else {
      // Update provider ID if not set
      if (!user[`${provider}Id`]) {
        user[`${provider}Id`] = providerId;
        await user.save();
      }
    }

    const token = getToken(user._id, user.registerAs);

    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Social authentication failed',
    });
  }
};
```

**4. Update User Model** (`backend/models/user.model.js`):
```javascript
googleId: String,
githubId: String,
profileImage: String,
```

**5. Add Route** (`backend/index.js`):
```javascript
app.post("/api/auth/social", authControllers.socialAuth);
```

#### Frontend Changes

**1. Update Sign In Page** (`frontend/app/signin/page.tsx`):
```typescript
import { signIn } from "next-auth/react";

// Add social login buttons
<div className="space-y-3">
  <Button
    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
    variant="outline"
    className="w-full"
  >
    <FcGoogle className="mr-2" />
    Continue with Google
  </Button>

  <Button
    onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
    variant="outline"
    className="w-full"
  >
    <FaGithub className="mr-2" />
    Continue with GitHub
  </Button>
</div>
```

**2. Add Session Provider** (`frontend/app/layout.tsx`):
```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### OAuth Setup Required

**Google**:
1. Go to Google Cloud Console
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`

**GitHub**:
1. Go to GitHub Settings > Developer Settings
2. Create OAuth App
3. Add callback: `http://localhost:3000/api/auth/callback/github`

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Files to Create/Modify

**Backend**:
- ✏️ Modify: `backend/models/user.model.js`
- ✏️ Modify: `backend/controllers/auth-controller.js`
- ✏️ Modify: `backend/index.js`

**Frontend**:
- ➕ Create: `frontend/app/api/auth/[...nextauth]/route.ts`
- ✏️ Modify: `frontend/app/layout.tsx`
- ✏️ Modify: `frontend/app/signin/page.tsx`
- ✏️ Modify: `frontend/app/signup/page.tsx`

### Time Breakdown
- OAuth setup (Google + GitHub): 1 hour
- Backend implementation: 1.5 hours
- Frontend implementation: 1.5 hours
- Testing: 1 hour
- **Total: 4-6 hours**

---

## 4️⃣ WEBSOCKET REAL-TIME MESSAGING

**Confidence**: ✅ HIGH (85%)
**Time**: 6-8 hours
**Priority**: HIGH

### Overview
Replace REST API messaging with Socket.io for instant message delivery, typing indicators, and online status.

### Implementation Details

#### Approach: Socket.io

**Why Socket.io?**
- Industry standard for WebSocket in Node.js
- Auto-reconnection
- Room support for private conversations
- Fallback to polling if WebSocket unavailable

#### Backend Changes

**1. Install Dependencies**:
```bash
cd backend
npm install socket.io
```

**2. Update Server Setup** (`backend/index.js`):
```javascript
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.username = user.username;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.io event handlers
require('./socket/messageHandlers')(io);

// Change app.listen to server.listen
server.listen(process.env.PORT, () => {
  console.log("✓ Server running on port", process.env.PORT);
  console.log("✓ Socket.io enabled");
});
```

**3. Create Socket Handlers** (`backend/socket/messageHandlers.js`):
```javascript
const Message = require('../models/message.model');
const User = require('../models/user.model');

// Store online users
const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Broadcast online status
    io.emit('user:online', {
      userId: socket.userId,
      username: socket.username,
    });

    // Send list of online users to the newly connected user
    socket.emit('users:online', Array.from(onlineUsers.keys()));

    // Join user's personal room
    socket.join(socket.userId);

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content } = data;

        // Save message to database
        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        // Populate sender info
        await message.populate('sender', 'username registerAs');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:received', {
            _id: message._id,
            sender: {
              _id: message.sender._id,
              username: message.sender.username,
            },
            receiver: receiverId,
            content: message.content,
            createdAt: message.createdAt,
            read: false,
          });
        }

        // Send acknowledgment to sender
        socket.emit('message:sent', {
          _id: message._id,
          sender: socket.userId,
          receiver: receiverId,
          content: message.content,
          createdAt: message.createdAt,
          read: false,
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message:error', {
          message: 'Failed to send message',
        });
      }
    });

    // Handle typing indicators
    socket.on('message:typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:typing', {
          userId: socket.userId,
          username: socket.username,
        });
      }
    });

    socket.on('message:stop-typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:stop-typing', {
          userId: socket.userId,
        });
      }
    });

    // Handle message read receipts
    socket.on('message:read', async (data) => {
      try {
        const { messageId, senderId } = data;

        await Message.findByIdAndUpdate(messageId, {
          read: true,
          readAt: new Date(),
        });

        // Notify sender
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read-receipt', {
            messageId,
            readAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username}`);
      onlineUsers.delete(socket.userId);

      // Broadcast offline status
      io.emit('user:offline', {
        userId: socket.userId,
      });
    });
  });
};
```

**4. Update Message Controller** (Keep REST endpoints as fallback):
```javascript
// Keep existing REST endpoints for initial load and offline support
// Socket.io handles real-time delivery
```

#### Frontend Changes

**1. Install Dependencies**:
```bash
cd frontend
npm install socket.io-client
```

**2. Create Socket Service** (`frontend/lib/socket.ts`):
```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;

    this.socket = io(process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Message methods
  sendMessage(receiverId: string, content: string) {
    if (this.socket) {
      this.socket.emit('message:send', { receiverId, content });
    }
  }

  onMessageReceived(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message:received', callback);
    }
  }

  onMessageSent(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message:sent', callback);
    }
  }

  // Typing indicators
  emitTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('message:typing', { receiverId });
    }
  }

  emitStopTyping(receiverId: string) {
    if (this.socket) {
      this.socket.emit('message:stop-typing', { receiverId });
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message:typing', callback);
    }
  }

  onUserStopTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message:stop-typing', callback);
    }
  }

  // Online status
  onUserOnline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:online', callback);
    }
  }

  onUserOffline(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:offline', callback);
    }
  }

  onOnlineUsers(callback: (userIds: string[]) => void) {
    if (this.socket) {
      this.socket.on('users:online', callback);
    }
  }

  // Read receipts
  markAsRead(messageId: string, senderId: string) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId, senderId });
    }
  }

  onReadReceipt(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('message:read-receipt', callback);
    }
  }
}

export const socketService = new SocketService();
```

**3. Create Socket Provider** (`frontend/providers/SocketProvider.tsx`):
```typescript
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/lib/socket';
import AuthController from '@/api/AuthController';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = AuthController.getSession();

    if (token) {
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
```

**4. Update Messages Page** (`frontend/app/messages/[userId]/page.tsx`):
```typescript
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { socketService } from "@/lib/socket";
import { Input, Button } from "rizzui";

export default function ConversationPage() {
  const params = useParams();
  const receiverId = params.userId as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load initial messages from REST API
    loadMessages();

    // Setup Socket.io listeners
    socketService.onMessageReceived((message) => {
      if (message.sender._id === receiverId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();

        // Mark as read
        socketService.markAsRead(message._id, receiverId);
      }
    });

    socketService.onMessageSent((message) => {
      if (message.receiver === receiverId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    socketService.onUserTyping((data) => {
      if (data.userId === receiverId) {
        setIsTyping(true);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (data.userId === receiverId) {
        setIsTyping(false);
      }
    });

    socketService.onUserOnline((data) => {
      if (data.userId === receiverId) {
        setIsOnline(true);
      }
    });

    socketService.onUserOffline((data) => {
      if (data.userId === receiverId) {
        setIsOnline(false);
      }
    });

    return () => {
      // Cleanup
    };
  }, [receiverId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    socketService.sendMessage(receiverId, newMessage);
    setNewMessage("");

    // Stop typing indicator
    socketService.emitStopTyping(receiverId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Emit typing indicator
    socketService.emitTyping(receiverId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(receiverId);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Conversation</h2>
        {isOnline && <p className="text-sm text-green-600">Online</p>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} />
        ))}
        {isTyping && <p className="text-sm text-gray-500">Typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}
```

**5. Add to Layout** (`frontend/app/layout.tsx`):
```typescript
import { SocketProvider } from '@/providers/SocketProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
```

### Features Enabled
- ✅ Instant message delivery
- ✅ Typing indicators
- ✅ Online/offline status
- ✅ Read receipts
- ✅ Auto-reconnection
- ✅ Multiple device support

### Files to Create/Modify

**Backend**:
- ✏️ Modify: `backend/index.js`
- ➕ Create: `backend/socket/messageHandlers.js`

**Frontend**:
- ➕ Create: `frontend/lib/socket.ts`
- ➕ Create: `frontend/providers/SocketProvider.tsx`
- ➕ Create: `frontend/app/messages/[userId]/page.tsx`
- ✏️ Modify: `frontend/app/layout.tsx`

### Testing Checklist
- [ ] Real-time message delivery works
- [ ] Typing indicators show/hide
- [ ] Online status updates
- [ ] Read receipts work
- [ ] Reconnection after disconnect
- [ ] Multiple tabs work correctly

### Time Breakdown
- Backend Socket.io setup: 2 hours
- Frontend Socket client: 2 hours
- UI components: 1.5 hours
- Testing & debugging: 1.5-2 hours
- **Total: 6-8 hours**

---

## 5️⃣ ADMIN DASHBOARD

**Confidence**: ✅ HIGH (90%)
**Time**: 6-8 hours
**Priority**: MEDIUM

### Overview
Create admin role with dashboard to manage users, view analytics, and moderate content.

### Implementation Details

#### Backend Changes

**1. Update User Model** (`backend/models/user.model.js`):
```javascript
role: {
  type: String,
  enum: ['user', 'admin', 'superadmin'],
  default: 'user',
},
```

**2. Create Admin Middleware** (`backend/middleware/admin.middleware.js`):
```javascript
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

exports.requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      status: 'fail',
      message: 'Access denied. Super admin privileges required.',
    });
  }
  next();
};
```

**3. Create Admin Controller** (`backend/controllers/admin.controller.js`):
```javascript
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const Connection = require('../models/connection.model');
const Message = require('../models/message.model');
const Activity = require('../models/activity.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalProfiles,
      totalConnections,
      totalMessages,
      totalActivities,
      newUsersThisMonth,
      activeUsersToday,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ emailVerified: true }),
      Profile.countDocuments(),
      Connection.countDocuments({ status: 'accepted' }),
      Message.countDocuments(),
      Activity.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      }),
      User.countDocuments({
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$registerAs', count: { $sum: 1 } } }
    ]);

    // Growth chart data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          verifiedUsers,
          totalProfiles,
          totalConnections,
          totalMessages,
          totalActivities,
          newUsersThisMonth,
          activeUsersToday,
        },
        usersByRole,
        userGrowth,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats',
    });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, verified } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.registerAs = role;
    }

    if (verified !== undefined) {
      filter.emailVerified = verified === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: { users },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user status',
    });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user and associated data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Profile.findOneAndDelete({ user: userId }),
      Connection.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
      Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
      Activity.deleteMany({ user: userId }),
    ]);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
    });
  }
};

// Promote user to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to promote user',
    });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    res.status(200).json({
      status: 'success',
      data: {
        database: dbStatus,
        uptime: Math.floor(uptime / 60) + ' minutes',
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        },
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get system health',
    });
  }
};
```

**4. Add Admin Routes** (`backend/routes/admin.routes.js`):
```javascript
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin, requireSuperAdmin } = require('../middleware/admin.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Super admin only
router.patch('/users/:userId/promote', requireSuperAdmin, adminController.promoteToAdmin);

// System health
router.get('/system/health', adminController.getSystemHealth);

module.exports = router;
```

**5. Integrate Routes** (`backend/index.js`):
```javascript
const adminRoutes = require('./routes/admin.routes');
app.use("/api/admin", apiLimiter, adminRoutes);
```

#### Frontend Changes

**1. Create Admin Dashboard** (`frontend/app/admin/page.tsx`):
```typescript
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import AuthController from "@/api/AuthController";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = AuthController.getSession();
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error("Access denied");
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.overview.totalUsers}
          icon="👥"
        />
        <StatCard
          title="Verified Users"
          value={stats?.overview.verifiedUsers}
          icon="✓"
        />
        <StatCard
          title="Total Messages"
          value={stats?.overview.totalMessages}
          icon="💬"
        />
        <StatCard
          title="Active Today"
          value={stats?.overview.activeUsersToday}
          icon="🔥"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Users by Role</h2>
          <PieChart data={stats?.usersByRole} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">User Growth (30 Days)</h2>
          <LineChart data={stats?.userGrowth} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Button onClick={() => router.push('/admin/users')}>
          Manage Users
        </Button>
        <Button onClick={() => router.push('/admin/system')}>
          System Health
        </Button>
      </div>
    </div>
  );
}
```

**2. Create User Management Page** (`frontend/app/admin/users/page.tsx`):
```typescript
"use client";
import { useState, useEffect } from "react";
import { Table, Button, Input, Select } from "rizzui";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import AuthController from "@/api/AuthController";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, role]);

  const loadUsers = async () => {
    try {
      const token = AuthController.getSession();
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (search) params.append('search', search);
      if (role) params.append('role', role.value);

      const response = await axios.get(
        `${API_BASE_URL}/admin/users?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(response.data.data.users);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Deactivate this user?')) return;

    try {
      const token = AuthController.getSession();
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        { isActive: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      loadUsers();
      toast.success('User deactivated');
    } catch (error) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;

    try {
      const token = AuthController.getSession();
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      loadUsers();
      toast.success('User deleted');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
        />
        <Select
          placeholder="Filter by role"
          options={[
            { value: 'innovator', label: 'Innovator' },
            { value: 'expert', label: 'Expert' },
            { value: 'investor', label: 'Investor' },
          ]}
          value={role}
          onChange={setRole}
        />
        <Button onClick={loadUsers}>Search</Button>
      </div>

      {/* Users Table */}
      <Table
        data={users}
        columns={[
          { header: 'Username', accessor: 'username' },
          { header: 'Email', accessor: 'email' },
          { header: 'Role', accessor: 'registerAs' },
          {
            header: 'Status',
            accessor: 'isActive',
            cell: (value) => (
              <span className={value ? 'text-green-600' : 'text-red-600'}>
                {value ? 'Active' : 'Inactive'}
              </span>
            ),
          },
          {
            header: 'Actions',
            cell: (row) => (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleDeactivate(row._id)}>
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(row._id)}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <Button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          disabled={users.length < 20}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Features Enabled
- ✅ Dashboard with statistics
- ✅ User management (view, deactivate, delete)
- ✅ User search and filtering
- ✅ Role-based access control
- ✅ System health monitoring
- ✅ Analytics charts
- ✅ Promote users to admin (super admin only)

### Files to Create/Modify

**Backend**:
- ✏️ Modify: `backend/models/user.model.js`
- ➕ Create: `backend/middleware/admin.middleware.js`
- ➕ Create: `backend/controllers/admin.controller.js`
- ➕ Create: `backend/routes/admin.routes.js`
- ✏️ Modify: `backend/index.js`

**Frontend**:
- ➕ Create: `frontend/app/admin/page.tsx`
- ➕ Create: `frontend/app/admin/users/page.tsx`
- ➕ Create: `frontend/app/admin/system/page.tsx`
- ➕ Create: `frontend/components/admin/StatCard.tsx`

### Time Breakdown
- Backend implementation: 2.5 hours
- Frontend dashboard: 2 hours
- User management UI: 1.5 hours
- Testing: 1 hour
- **Total: 6-8 hours**

---

## 6️⃣ ANALYTICS DASHBOARD

**Confidence**: ✅ HIGH (85%)
**Time**: 5-7 hours
**Priority**: MEDIUM

### Overview
Add analytics tracking and visualization for user behavior, engagement metrics, and platform insights.

### Implementation Details

#### Backend Changes

**1. Create Analytics Model** (`backend/models/analytics.model.js`):
```javascript
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        'page_view',
        'profile_view',
        'search',
        'message_sent',
        'connection_made',
        'profile_updated',
      ],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    sessionId: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
analyticsEventSchema.index({ user: 1, createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ sessionId: 1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
module.exports = AnalyticsEvent;
```

**2. Create Analytics Controller** (`backend/controllers/analytics.controller.js`):
```javascript
const AnalyticsEvent = require('../models/analytics.model');
const User = require('../models/user.model');
const Message = require('../models/message.model');
const Connection = require('../models/connection.model');

// Track event
exports.trackEvent = async (req, res) => {
  try {
    const { eventType, metadata } = req.body;

    await AnalyticsEvent.create({
      user: req.user.id,
      eventType,
      metadata,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.headers['x-session-id'],
    });

    res.status(201).json({
      status: 'success',
      message: 'Event tracked',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to track event',
    });
  }
};

// Get user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [
      eventsByType,
      dailyActivity,
      totalEvents,
    ] = await Promise.all([
      // Events by type
      AnalyticsEvent.aggregate([
        { $match: { user: userId, createdAt: { $gte: startDate } } },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ]),

      // Daily activity
      AnalyticsEvent.aggregate([
        { $match: { user: userId, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Total events
      AnalyticsEvent.countDocuments({ user: userId, createdAt: { $gte: startDate } }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalEvents,
        eventsByType,
        dailyActivity,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get analytics',
    });
  }
};

// Get platform analytics (admin only)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalMessages,
      totalConnections,
      topUsers,
      engagementRate,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Message.countDocuments({ createdAt: { $gte: startDate } }),
      Connection.countDocuments({ createdAt: { $gte: startDate } }),

      // Top active users
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$user', eventCount: { $sum: 1 } } },
        { $sort: { eventCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            eventCount: 1,
          },
        },
      ]),

      // Engagement rate (active users / total users)
      User.countDocuments({ lastLogin: { $gte: startDate } }).then(active =>
        User.countDocuments().then(total => (active / total) * 100)
      ),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsers,
          totalMessages,
          totalConnections,
          engagementRate: engagementRate.toFixed(2) + '%',
        },
        topUsers,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get platform analytics',
    });
  }
};
```

**3. Add Analytics Routes** (`backend/routes/analytics.routes.js`):
```javascript
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.use(protect);

// Track event
router.post('/track', analyticsController.trackEvent);

// User analytics
router.get('/user', analyticsController.getUserAnalytics);

// Platform analytics (admin only)
router.get('/platform', requireAdmin, analyticsController.getPlatformAnalytics);

module.exports = router;
```

**4. Integrate Routes** (`backend/index.js`):
```javascript
const analyticsRoutes = require('./routes/analytics.routes');
app.use("/api/analytics", analyticsRoutes);
```

#### Frontend Changes

**1. Create Analytics Hook** (`frontend/hooks/use-analytics.ts`):
```typescript
import axios from 'axios';
import { API_BASE_URL } from '@/api/api.config';
import AuthController from '@/api/AuthController';

export const useAnalytics = () => {
  const trackEvent = async (eventType: string, metadata?: any) => {
    try {
      const token = AuthController.getSession();
      await axios.post(
        `${API_BASE_URL}/analytics/track`,
        { eventType, metadata },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to track event');
    }
  };

  const trackPageView = (page: string) => {
    trackEvent('page_view', { page });
  };

  const trackProfileView = (userId: string) => {
    trackEvent('profile_view', { viewedUserId: userId });
  };

  const trackSearch = (query: string) => {
    trackEvent('search', { query });
  };

  return {
    trackEvent,
    trackPageView,
    trackProfileView,
    trackSearch,
  };
};
```

**2. Create Analytics Dashboard** (`frontend/app/analytics/page.tsx`):
```typescript
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/api/api.config";
import AuthController from "@/api/AuthController";
import { LineChart, BarChart, PieChart } from "@/components/charts";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      const token = AuthController.getSession();
      const response = await axios.get(
        `${API_BASE_URL}/analytics/user?days=${days}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Analytics</h1>

      {/* Time Range Selector */}
      <div className="mb-6">
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Events"
          value={analytics?.totalEvents}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Events by Type</h2>
          <PieChart data={analytics?.eventsByType} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Daily Activity</h2>
          <LineChart data={analytics?.dailyActivity} />
        </div>
      </div>
    </div>
  );
}
```

**3. Add Auto-Tracking** (`frontend/app/layout.tsx`):
```typescript
"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics } from '@/hooks/use-analytics';

export default function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
```

### Features Enabled
- ✅ Event tracking (page views, searches, etc.)
- ✅ User analytics dashboard
- ✅ Platform-wide analytics (admin)
- ✅ Daily activity charts
- ✅ Top users ranking
- ✅ Engagement metrics
- ✅ Automatic page view tracking

### Files to Create/Modify

**Backend**:
- ➕ Create: `backend/models/analytics.model.js`
- ➕ Create: `backend/controllers/analytics.controller.js`
- ➕ Create: `backend/routes/analytics.routes.js`
- ✏️ Modify: `backend/index.js`

**Frontend**:
- ➕ Create: `frontend/hooks/use-analytics.ts`
- ➕ Create: `frontend/app/analytics/page.tsx`
- ➕ Create: `frontend/components/charts/LineChart.tsx`
- ➕ Create: `frontend/components/charts/PieChart.tsx`
- ✏️ Modify: `frontend/app/layout.tsx`

### Time Breakdown
- Backend implementation: 2 hours
- Frontend dashboard: 2 hours
- Charts implementation: 1 hour
- Testing: 1 hour
- **Total: 5-7 hours**

---

# 📊 IMPLEMENTATION SUMMARY

## Total Time Estimate: 26-36 hours

| Feature | Time | Priority | Complexity |
|---------|------|----------|------------|
| Email Verification | 2-3 hrs | HIGH | Low |
| Advanced Search | 3-4 hrs | MEDIUM | Low |
| Social Login | 4-6 hrs | HIGH | Medium |
| WebSocket Messaging | 6-8 hrs | HIGH | Medium-High |
| Admin Dashboard | 6-8 hrs | MEDIUM | Medium |
| Analytics Dashboard | 5-7 hrs | MEDIUM | Medium |

## Recommended Implementation Order

1. **Email Verification** (Day 1) - Quick win, important security
2. **Advanced Search** (Day 1-2) - Extends existing feature
3. **Social Login** (Day 2-3) - Major UX improvement
4. **WebSocket Messaging** (Day 3-4) - Most impactful feature
5. **Admin Dashboard** (Day 5-6) - Platform management
6. **Analytics Dashboard** (Day 6-7) - Insights and metrics

---

# 🚫 NOT RECOMMENDED (Lower Confidence)

## Push Notifications
**Confidence**: 🟡 MEDIUM (60%)
**Complexity**: High
**Time**: 8-10 hours

**Challenges**:
- Requires service worker setup
- Browser permission handling
- Firebase Cloud Messaging integration
- Different for web vs mobile

**Recommendation**: Implement after core features are stable

## Mobile App (React Native)
**Confidence**: 🟡 MEDIUM (50%)
**Complexity**: Very High
**Time**: 40+ hours

**Challenges**:
- Separate codebase to maintain
- App store deployment
- Platform-specific code (iOS/Android)
- Different testing requirements

**Recommendation**: Consider only if web app is fully mature and there's proven demand

---

# ✅ NEXT STEPS

1. **Review this document** and decide which features to implement
2. **Prioritize** based on your project timeline
3. **Start with Email Verification** (quickest, highest value)
4. **Implement one feature at a time** to ensure quality
5. **Test thoroughly** before moving to the next feature

Would you like me to start implementing any of these features? I can begin with Email Verification (2-3 hours) which is the quickest and most important for security.

