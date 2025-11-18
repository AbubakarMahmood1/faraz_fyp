# 🎯 UNIFIED FYP PROJECT PLAN
## Synchronized Frontend + Backend Implementation

**Project:** Innovation Platform (Final Year Project)
**Current Status:** 25% Complete (Critical Issues Present)
**Target:** Production-Ready MVP
**Total Estimated Time:** 100-120 hours (12-15 working days)
**Plan Version:** 2.0 - Synchronized
**Last Updated:** 2025-11-18

---

## 📊 EXECUTIVE SUMMARY

### Current State:
- **Backend:** 20% complete, CRITICAL security vulnerabilities
- **Frontend:** 30% complete, broken functionality
- **Integration:** 0% - disconnected plans
- **Testing:** 0% - no tests at all
- **Security:** 1/10 - database credentials exposed in Git

### Critical Issues:
🚨 **SECURITY BREACH:** MongoDB password + JWT secret committed to repo
🐛 **BROKEN REGISTRATION:** Forms don't submit data
⚠️ **NO AUTHENTICATION:** Routes not protected
❌ **ZERO TESTS:** No testing infrastructure

### This Plan Fixes:
✅ Eliminates conflicts between frontend/backend plans
✅ Synchronizes timelines with integration checkpoints
✅ Defines exact API contracts (single source of truth)
✅ Prioritizes security fixes first
✅ Enables parallel work where possible
✅ Includes realistic timeline with dependencies

---

## 🔥 PHASE 0: EMERGENCY SECURITY FIXES (Day 1 - 3 hours)
### **DO THIS FIRST - CRITICAL**

**Timeline:** Today, before any other work
**Team:** Backend lead + 1 frontend dev
**Blocker for:** Everything else

### Tasks:

#### 0.1 Remove Exposed Secrets (30 min)
**Backend:**
```bash
# Remove config.env from Git history
git rm --cached backend/config.env
git commit -m "security: remove exposed credentials"

# Fix .gitignore
echo "node_modules/" > backend/.gitignore
echo ".env" >> backend/.gitignore
echo "config.env" >> backend/.gitignore
echo "*.log" >> backend/.gitignore
echo ".DS_Store" >> backend/.gitignore
```

#### 0.2 Change ALL Credentials (30 min)
**Actions:**
- [ ] Change MongoDB password immediately
- [ ] Generate new JWT secret (min 32 chars)
- [ ] Update production database credentials
- [ ] Create `.env` file (not committed)
- [ ] Create `.env.example` (committed)

**Backend `.env.example`:**
```env
PORT=3001
DATABASE_URL=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/fyp?retryWrites=true&w=majority
DATABASE_PASSWORD=your_password_here
JWT_SECRET=your_secret_key_here_min_32_chars
JWT_EXPIRES_IN=90d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### 0.3 Remove Credential Logging (15 min)
**Backend `index.js:13`:**
```javascript
// REMOVE:
console.log(DB);

// REPLACE WITH:
console.log("✓ Database connection configured");
```

#### 0.4 Restrict CORS (15 min)
**Backend `index.js`:**
```javascript
// REPLACE:
app.use(cors());

// WITH:
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

#### 0.5 Frontend Environment Setup (30 min)
**Frontend:**

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Create `frontend/.env.example` (same structure, empty values)

Update `frontend/api/api.config.ts`:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001/api";
```

Update `frontend/lib/firebaseConfig.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

#### 0.6 Verification Test (30 min)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Signup still works
- [ ] Login still works
- [ ] No secrets in console logs
- [ ] Git status clean (no .env files staged)

### Deliverables:
✅ Secrets removed from Git
✅ All credentials changed
✅ Environment variables configured
✅ CORS restricted
✅ Existing auth still works

---

## 📋 API CONTRACT (Single Source of Truth)
### **Version 1.0 - Agreed Between Frontend & Backend**

This section defines EXACTLY what the API should look like. Both teams must implement these specifications.

### Authentication Endpoints:

#### 1. User Signup
```
POST /api/signup

Request:
{
  "username": "string (required, min 3 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "registerAs": "string (required, one of: explorer|expert|innovator|investor)"
}

Response 201 (Success):
{
  "status": "success",
  "token": "jwt_token_string",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "registerAs": "string",
      "profileCompleted": false
    }
  }
}

Response 409 (Duplicate Email):
{
  "status": "fail",
  "message": "Email already exists"
}

Response 409 (Duplicate Username):
{
  "status": "fail",
  "message": "Username already exists"
}

Response 400 (Validation Error):
{
  "status": "fail",
  "message": "Validation error details"
}
```

#### 2. User Login
```
POST /api/login

Request:
{
  "email": "string (required)",
  "password": "string (required)"
}

Response 200 (Success):
{
  "status": "success",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "registerAs": "string",
      "profileCompleted": boolean
    }
  }
}

Response 401 (Invalid Credentials):
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

#### 3. Get User (Public Profile)
```
GET /api/users/:username

Response 200:
{
  "status": "success",
  "data": {
    "user": {
      "username": "string",
      "registerAs": "string",
      "firstName": "string",
      "lastName": "string",
      "profileImage": "string",
      "bio": "string",
      // Role-specific public data
    }
  }
}

Response 404:
{
  "status": "fail",
  "message": "User not found"
}
```

### Profile Endpoints (NEW - Phase 2):

#### 4. Complete Profile Registration
```
POST /api/profile/complete
Headers: Authorization: Bearer {token}

Request:
{
  // Personal Info (all roles)
  "firstName": "string (required)",
  "lastName": "string (optional)",
  "gender": "string (optional)",
  "dateOfBirth": "string (optional, ISO date)",
  "phoneNo": "string (optional)",
  "country": "string (optional)",
  "city": "string (optional)",
  "bio": "string (required, min 50 chars)",
  "profileImage": "string (optional, URL)",

  // Role-specific (conditional)
  // For Innovators & Experts:
  "expertise": "string[] (optional)",
  "skills": "string[] (optional)",
  "experienceLevel": "string (optional)",

  // For Investors:
  "organizationName": "string (optional)",
  "investingExperience": "string[] (optional)"
}

Response 200:
{
  "status": "success",
  "data": {
    "profile": { /* all profile fields */ },
    "user": {
      "profileCompleted": true
    }
  }
}

Response 401:
{
  "status": "fail",
  "message": "Unauthorized"
}

Response 400:
{
  "status": "fail",
  "message": "Validation error details"
}
```

#### 5. Get Current User Profile
```
GET /api/profile/me
Headers: Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "data": {
    "user": { /* user fields */ },
    "profile": { /* profile fields */ }
  }
}

Response 401:
{
  "status": "fail",
  "message": "Unauthorized"
}
```

#### 6. Update Profile
```
PUT /api/profile
Headers: Authorization: Bearer {token}

Request:
{
  /* Any profile fields to update */
}

Response 200:
{
  "status": "success",
  "data": {
    "profile": { /* updated profile */ }
  }
}
```

### User Management Endpoints (NEW - Phase 2):

#### 7. Update Password
```
PATCH /api/users/update-password
Headers: Authorization: Bearer {token}

Request:
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)"
}

Response 200:
{
  "status": "success",
  "message": "Password updated successfully"
}

Response 401:
{
  "status": "fail",
  "message": "Current password is incorrect"
}
```

#### 8. Logout
```
POST /api/logout
Headers: Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### 9. Forgot Password
```
POST /api/password/forgot

Request:
{
  "email": "string (required)"
}

Response 200:
{
  "status": "success",
  "message": "Password reset email sent"
}

Response 404:
{
  "status": "fail",
  "message": "No user found with that email"
}
```

#### 10. Reset Password
```
POST /api/password/reset

Request:
{
  "token": "string (required, from email link)",
  "password": "string (required, min 6 chars)"
}

Response 200:
{
  "status": "success",
  "message": "Password reset successfully"
}

Response 400:
{
  "status": "fail",
  "message": "Invalid or expired token"
}
```

### Database Schema:

#### User Model:
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  registerAs: String (enum: explorer|expert|innovator|investor),
  profileCompleted: Boolean (default: false),
  isActive: Boolean (default: true),
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Profile Model:
```javascript
{
  user: ObjectId (ref: User, unique),

  // Personal
  firstName: String (required),
  lastName: String,
  gender: String,
  dateOfBirth: Date,
  phoneNo: String,
  country: String,
  city: String,
  bio: String,
  profileImage: String,

  // Professional (for experts/innovators)
  expertise: [String],
  skills: [String],
  experienceLevel: String,

  // Investor-specific
  organizationName: String,
  investingExperience: [String],

  // Metadata
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🗓️ PHASE 1: CRITICAL FIXES (Days 2-3 - 16 hours)
### **Fix Broken Functionality + Code Quality**

**Timeline:** Days 2-3
**Team:** Both frontend (10h) and backend (6h) in parallel
**Dependencies:** Phase 0 complete

### Backend Tasks (6 hours):

#### 1.1 Fix HTTP Status Codes (30 min)
**File:** `backend/controllers/auth-controller.js`

```javascript
// Line 20: Change 401 → 409
return res.status(409).json({
  status: "fail",
  message: "Email already exists"
});

// Line 30: Change 402 → 409
return res.status(409).json({
  status: "fail",
  message: "Username already exists"
});
```

#### 1.2 Rename & Fix Model (1 hour)
```bash
# Rename directory
mv backend/modal backend/models

# Rename file
mv backend/models/signup-schema.js backend/models/user.model.js
```

**Fix password method in `user.model.js`:**
```javascript
// REPLACE arrow function with regular function
signupSchema.methods.correctPassword = async function(enteredPassword, userPassword) {
  return await bcrypt.compare(enteredPassword, userPassword);
};
```

**Update all imports:**
```javascript
// Change from:
const Signup = require("./modal/signup-schema");

// To:
const User = require("./models/user.model");
```

#### 1.3 Add Schema Fields (30 min)
**File:** `backend/models/user.model.js`

```javascript
const signupSchema = new mongoose.Schema({
  username: { /* existing */ },
  email: { /* existing */ },
  password: { /* existing */ },
  registerAs: { /* existing */ },

  // NEW FIELDS:
  profileCompleted: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
}, {
  timestamps: true, // Adds createdAt, updatedAt
});
```

#### 1.4 Fix Get User Endpoint (30 min)
**File:** `backend/controllers/user-controller.js`

```javascript
// CHANGE:
const { username } = req.body; // Wrong for GET

// TO:
const { username } = req.query; // Correct for GET
```

**Update route in `index.js`:**
```javascript
// Keep as GET, now works with query params
app.get("/api/users/:username", userControllers.getUser);
```

#### 1.5 Add Input Validation (2 hours)
**Install Joi:**
```bash
cd backend && npm install joi
```

**Create:** `backend/utils/validators.js`
```javascript
const Joi = require('joi');

exports.signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  registerAs: Joi.string().valid('explorer', 'expert', 'innovator', 'investor').required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
```

**Create:** `backend/middleware/validation.middleware.js`
```javascript
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'fail',
        message: error.details[0].message,
      });
    }
    next();
  };
};
```

**Update routes:**
```javascript
const { validate } = require('./middleware/validation.middleware');
const { signupSchema, loginSchema } = require('./utils/validators');

app.post("/api/signup", validate(signupSchema), authControllers.signup);
app.post("/api/login", validate(loginSchema), authControllers.login);
```

#### 1.6 Remove Duplicates & Cleanup (1.5 hours)
```bash
# Remove duplicate dependency
npm uninstall bcrypt

# Delete unused file
rm backend/server.js

# Delete test file
rm backend/hello.txt

# Delete commented code in auth-controller.js lines 91-94
```

**Update `package.json`:**
```json
{
  "name": "fyp-backend",
  "version": "1.0.0",
  "description": "Innovation Platform Backend API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest --coverage"
  },
  "author": "Your Name",
  "license": "MIT",
  "dependencies": { /* existing */ }
}
```

### Frontend Tasks (10 hours):

#### 1.1 Fix Registration State Bug (2 hours)
**Files:** All registration pages

**Fix:** `frontend/app/registeration/expert/page.tsx`
```typescript
// Line 10: CHANGE
const [currentStep, setCurrentStep] = useState(2);

// TO:
const [currentStep, setCurrentStep] = useState(0);
```

**Fix:** `frontend/app/registeration/investor/page.tsx` (same change)

**Fix module-level state:** `frontend/app/registeration/innovator/page.tsx`
```typescript
// REMOVE:
let userProfiling = {};

// ADD:
interface RegistrationData {
  // Personal
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  // Contact
  phoneNo?: string;
  country?: string;
  city?: string;
  // Role-specific
  expertise?: string[];
  skills?: string[];
  experienceLevel?: string;
  bio?: string;
  profileImage?: string;
  organizationName?: string;
  investingExperience?: string[];
}

export default function InnovatorRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});

  const handlePersonalInfo = (data: any) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep(1);
  };

  const handleContactInfo = (data: any) => {
    setRegistrationData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  return (
    <>
      {currentStep === 0 && <PersonalInfoForm updateUserProfiling={handlePersonalInfo} />}
      {currentStep === 1 && <ContactInfoForm updateUserProfiling={handleContactInfo} />}
      {currentStep === 2 && <InnovatorFinishForm registrationData={registrationData} />}
    </>
  );
}
```

**Repeat for Expert and Investor pages**

#### 1.2 Remove Key Anti-Pattern (30 min)
**Search and fix:** Find all `key={Math.random()}` in Select components

**File:** `frontend/app/signup/signup-form.tsx:119`
```typescript
// REMOVE:
key={Math.random().toString()}

// Just remove the key prop entirely
```

#### 1.3 Fix Spelling Errors (1 hour)
**Files:** Multiple

Global find and replace:
- `rememverMe` → `rememberMe`
- `settinhs` → `settings`
- `experties` → `expertise`
- `Pleae` → `Please`

#### 1.4 Add Loading States (2 hours)
**File:** `frontend/app/signin/signin-form.tsx`

```typescript
// Add state
const [isLoading, setIsLoading] = useState(false);

async function submit(data: Signin) {
  setIsLoading(true);
  try {
    const response = await handleLogin(data);
    if (response?.status === 200) {
      toast.success("Login successful!");
      router.push("/dashboard");
    }
  } catch (error: any) {
    const message = error?.data?.message || "Login failed";
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
}

// Update button
<Button type="submit" isLoading={isLoading}>
  Sign In
</Button>
```

**Repeat for:**
- Signup form
- All registration forms

#### 1.5 Proper Error Handling (2 hours)
**Update:** `frontend/api/AuthController.ts`

```typescript
static async handleLogin(data: any) {
  try {
    const response = await this.userLogin(data);
    return response;
  } catch (error: any) {
    // Parse error response
    const status = error?.status;
    const message = error?.data?.message;

    // Throw with structured error
    throw {
      status,
      message: message || "An error occurred",
      data: error?.data
    };
  }
}
```

**Add toast notifications to all API calls**

#### 1.6 Create Constants File (1.5 hours)
**Create:** `frontend/data/constants.ts`

```typescript
export const EXPERIENCE_LEVELS = [
  { label: "1-2 years", value: "1-2" },
  { label: "3-5 years", value: "3-5" },
  { label: "5+ years", value: "5+" },
  { label: "10+ years", value: "10+" },
] as const;

export const USER_ROLES = [
  { label: "Explorer", value: "explorer" },
  { label: "Expert", value: "expert" },
  { label: "Innovator", value: "innovator" },
  { label: "Investor", value: "investor" },
] as const;

export const GENDERS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer-not" },
] as const;

export const EXPERTISE_AREAS = [
  { label: "Artificial Intelligence", value: "ai" },
  { label: "Web Development", value: "web" },
  { label: "Mobile Development", value: "mobile" },
  { label: "Data Science", value: "data-science" },
  { label: "Cybersecurity", value: "cybersecurity" },
  { label: "Cloud Computing", value: "cloud" },
  { label: "DevOps", value: "devops" },
  { label: "Blockchain", value: "blockchain" },
] as const;

export const SKILLS = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "React", value: "react" },
  { label: "Node.js", value: "nodejs" },
  { label: "Next.js", value: "nextjs" },
  { label: "MongoDB", value: "mongodb" },
  { label: "PostgreSQL", value: "postgresql" },
] as const;
```

**Update all forms to import from constants**

#### 1.7 Remove Console Logs (1 hour)
**Create:** `frontend/lib/logger.ts`

```typescript
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args); // Always log errors
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  }
};
```

**Replace all `console.log` with `logger.log` or remove**

### Integration Checkpoint #1:
- [ ] Backend: All fixes applied, server starts
- [ ] Frontend: All fixes applied, app starts
- [ ] Test: Signup flow works end-to-end
- [ ] Test: Login flow works end-to-end
- [ ] Test: Registration forms don't crash
- [ ] Test: No console errors

### Deliverables:
✅ Backend: Fixed status codes, validation, model structure
✅ Frontend: Fixed state bugs, loading states, error handling
✅ Both: Clean code, no spelling errors, proper logging
✅ Integration: Existing auth flows work perfectly

---

## 🏗️ PHASE 2: PROFILE COMPLETION (Days 4-7 - 28 hours)
### **Enable Registration Forms to Save Data**

**Timeline:** Days 4-7
**Team:** Backend (14h) then Frontend (14h) - Sequential
**Dependencies:** Phase 1 complete

### Backend Tasks (14 hours):

#### 2.1 Create Profile Model (2 hours)
**Create:** `backend/models/profile.model.js`

```javascript
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // Personal Information
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  gender: String,
  dateOfBirth: Date,
  phoneNo: String,
  country: String,
  city: String,
  bio: {
    type: String,
    required: true,
    minlength: 50,
  },
  profileImage: String,

  // Professional (Experts & Innovators)
  expertise: [String],
  skills: [String],
  experienceLevel: String,

  // Investor-specific
  organizationName: String,
  investingExperience: [String],

  // Metadata
  completedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', profileSchema);
```

#### 2.2 Create Profile Controller (3 hours)
**Create:** `backend/controllers/profile.controller.js`

```javascript
const Profile = require('../models/profile.model');
const User = require('../models/user.model');

// Complete profile registration
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Profile already completed',
      });
    }

    // Create profile
    const profile = await Profile.create({
      user: userId,
      ...req.body,
    });

    // Update user profileCompleted flag
    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    res.status(200).json({
      status: 'success',
      data: {
        profile,
        user: {
          profileCompleted: true,
        },
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    const profile = await Profile.findOne({ user: userId });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        profile,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        status: 'fail',
        message: 'Profile not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
```

#### 2.3 Implement JWT Middleware (2 hours)
**Update:** `backend/controllers/controllers-for-protecting-routes.js`

Rename to: `backend/middleware/auth.middleware.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    // 1) Get token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in',
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'User no longer exists',
      });
    }

    // 4) Grant access
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid or expired token',
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.registerAs)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
```

#### 2.4 Create Routes (2 hours)
**Create:** `backend/routes/profile.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/complete', protect, profileController.completeProfile);
router.get('/me', protect, profileController.getMyProfile);
router.put('/', protect, profileController.updateProfile);

module.exports = router;
```

**Create:** `backend/routes/user.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Public
router.get('/:username', userController.getUser);

module.exports = router;
```

**Update:** `backend/index.js`

```javascript
// Import routes
const profileRoutes = require('./routes/profile.routes');
const userRoutes = require('./routes/user.routes');

// Apply routes
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);

// Keep existing auth routes for now
app.post("/api/signup", validate(signupSchema), authControllers.signup);
app.post("/api/login", validate(loginSchema), authControllers.login);
```

#### 2.5 Add Profile Validation (2 hours)
**Update:** `backend/utils/validators.js`

```javascript
exports.completeProfileSchema = Joi.object({
  // Required for all
  firstName: Joi.string().min(2).required(),
  bio: Joi.string().min(50).required(),

  // Optional common fields
  lastName: Joi.string().min(2).optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not').optional(),
  dateOfBirth: Joi.date().optional(),
  phoneNo: Joi.string().optional(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),

  // Professional fields
  expertise: Joi.array().items(Joi.string()).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  experienceLevel: Joi.string().optional(),

  // Investor fields
  organizationName: Joi.string().optional(),
  investingExperience: Joi.array().items(Joi.string()).optional(),
});
```

**Apply to route:**
```javascript
const { completeProfileSchema } = require('../utils/validators');

router.post('/complete', protect, validate(completeProfileSchema), profileController.completeProfile);
```

#### 2.6 Add Logout & Password Management (3 hours)
**Update:** `backend/controllers/auth-controller.js`

```javascript
// Logout
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Check current password
    const isCorrect = await user.correctPassword(req.body.currentPassword, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect',
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Forgot password (basic version, no email for now)
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email',
      });
    }

    // TODO: Generate reset token and send email
    // For now, just respond with success
    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent (not implemented yet)',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
```

**Add routes:**
```javascript
app.post('/api/logout', protect, authControllers.logout);
app.patch('/api/users/update-password', protect, authControllers.updatePassword);
app.post('/api/password/forgot', authControllers.forgotPassword);
```

### Frontend Tasks (14 hours):

#### 2.1 Create Profile API Controller (1.5 hours)
**Create:** `frontend/api/ProfileController.ts`

```typescript
import { apiClient } from "./api.config";

export interface CompleteProfileData {
  firstName: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNo?: string;
  country?: string;
  city?: string;
  expertise?: string[];
  skills?: string[];
  experienceLevel?: string;
  bio?: string;
  profileImage?: string;
  organizationName?: string;
  investingExperience?: string[];
}

class ProfileController {
  static completeProfile(data: CompleteProfileData): Promise<any> {
    return apiClient.post("/profile/complete", data);
  }

  static getProfile(): Promise<any> {
    return apiClient.get("/profile/me");
  }

  static updateProfile(data: Partial<CompleteProfileData>): Promise<any> {
    return apiClient.put("/profile", data);
  }
}

export default ProfileController;
```

#### 2.2 Create Profile Hook (1.5 hours)
**Create:** `frontend/hooks/use-profile.ts`

```typescript
import { useState } from "react";
import ProfileController, { CompleteProfileData } from "@/api/ProfileController";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const completeProfile = async (data: CompleteProfileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProfileController.completeProfile(data);
      toast.success("Profile completed successfully!");
      router.push("/dashboard");
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to complete profile";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProfileController.getProfile();
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to fetch profile";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<CompleteProfileData>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProfileController.updateProfile(data);
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeProfile,
    getProfile,
    updateProfile,
    isLoading,
    error,
  };
}
```

#### 2.3 Wire Up Innovator Registration (3 hours)
**Update:** `frontend/app/registeration/innovator/innovator-finish-form.tsx`

```typescript
import { useProfile } from "@/hooks/use-profile";

interface InnovatorFinishFormProps {
  registrationData: any;
}

export default function InnovatorFinishForm({ registrationData }: InnovatorFinishFormProps) {
  const { completeProfile, isLoading } = useProfile();

  const onSubmit: SubmitHandler<InnovatorFinishFormFieldTypes> = async (data) => {
    // Merge all registration data
    const profileData = {
      ...registrationData,
      ...data,
    };

    try {
      await completeProfile(profileData);
      // Router push handled in hook
    } catch (error) {
      // Error already handled in hook with toast
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Existing form fields */}

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Complete Registration
      </Button>
    </form>
  );
}
```

**Update parent:** `frontend/app/registeration/innovator/page.tsx`

```typescript
{currentStep === 2 && (
  <InnovatorFinishForm registrationData={registrationData} />
)}
```

#### 2.4 Wire Up Expert Registration (2 hours)
Same pattern as Innovator - update `expert-finish-form.tsx`

#### 2.5 Wire Up Investor Registration (2 hours)
Same pattern as Innovator - update `investor-finish-form.tsx`

#### 2.6 Add Zod Validation to Finish Forms (2 hours)
**Create:** `frontend/validators/profile-schemas.ts`

```typescript
import { z } from "zod";

export const innovatorFinishSchema = z.object({
  expertise: z.array(z.string()).min(1, "Select at least one expertise area"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experienceLevel: z.string().min(1, "Select experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export const expertFinishSchema = z.object({
  expertise: z.array(z.string()).min(1, "Select at least one expertise area"),
  experienceLevel: z.string().min(1, "Select experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export const investorFinishSchema = z.object({
  organizationName: z.string().min(2, "Organization name required"),
  experienceLevel: z.string().min(1, "Select experience level"),
  investingExperience: z.array(z.string()).min(1, "Select investing experience"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().url().optional().or(z.literal("")),
});
```

**Apply to forms:**
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { innovatorFinishSchema } from "@/validators/profile-schemas";

const { handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(innovatorFinishSchema)
});
```

#### 2.7 Update Redux Store (1 hour)
**Update:** `frontend/store/store.ts`

```typescript
const profileDataSlice = createSlice({
  name: "profileData",
  initialState: {
    firstName: "",
    lastName: "",
    role: "",
    profileImage: "",
    profileCompleted: false,
  },
  reducers: {
    setProfileData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearProfileData: (state) => {
      return initialState;
    },
  },
});

export const profileDataActions = profileDataSlice.actions;

// Add to store
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    profileData: profileDataSlice.reducer,
  },
});
```

**Use in components:**
```typescript
import { profileDataActions } from "@/store/store";

// After profile completion
dispatch(profileDataActions.setProfileData(response.data.profile));
```

#### 2.8 Add Logout Functionality (1 hour)
**Update:** `frontend/api/AuthController.ts`

```typescript
static clearSession() {
  localStorage.removeItem("loginToken");
  if (typeof document !== 'undefined') {
    document.cookie = "loginToken=; path=/; max-age=0";
  }
}

static userLogout(): Promise<any> {
  return new Promise((resolve, reject) => {
    apiClient
      .post("/logout")
      .then((res) => {
        this.clearSession();
        resolve(res);
      })
      .catch((err) => {
        // Even if API fails, clear local session
        this.clearSession();
        reject(err);
      });
  });
}
```

**Update Header:**
```typescript
import AuthController from "@/api/AuthController";
import { useRouter } from "next/navigation";
import { userActions, profileDataActions } from "@/store/store";

const router = useRouter();
const dispatch = useDispatch();

const handleLogout = async () => {
  try {
    await AuthController.userLogout();
    dispatch(userActions.setUser(""));
    dispatch(profileDataActions.clearProfileData());
    router.push("/signin");
    toast.success("Logged out successfully");
  } catch (error) {
    toast.error("Logout failed");
  }
};
```

### Integration Checkpoint #2:
- [ ] Backend: Profile endpoints working with Postman
- [ ] Backend: JWT middleware protects routes
- [ ] Backend: Validation rejects invalid data
- [ ] Frontend: All registration forms submit data
- [ ] Frontend: Success toast shows on completion
- [ ] Frontend: Redirect to dashboard works
- [ ] Test: Complete registration as Innovator
- [ ] Test: Complete registration as Expert
- [ ] Test: Complete registration as Investor
- [ ] Test: Logout works

### Deliverables:
✅ Backend: Profile model, controller, routes, validation
✅ Backend: JWT middleware working
✅ Backend: Logout and password endpoints
✅ Frontend: Profile API integration complete
✅ Frontend: All registration flows save to database
✅ Frontend: Logout functionality working
✅ Integration: End-to-end registration works

---

## 🎨 PHASE 3: USER EXPERIENCE (Days 8-11 - 32 hours)
### **Dashboard, Profile Management, Polish**

**Timeline:** Days 8-11
**Team:** Both teams in parallel
**Dependencies:** Phase 2 complete

### Backend Tasks (12 hours):

#### 3.1 Add Rate Limiting (2 hours)
**Install:**
```bash
npm install express-rate-limit
```

**Create:** `backend/middleware/rateLimiter.middleware.js`

```javascript
const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    status: 'fail',
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 min
  message: {
    status: 'fail',
    message: 'Too many requests, please try again later',
  },
});
```

**Apply:**
```javascript
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter.middleware');

app.post("/api/login", authLimiter, validate(loginSchema), authControllers.login);
app.post("/api/signup", authLimiter, validate(signupSchema), authControllers.signup);

// Apply to all API routes
app.use('/api/', apiLimiter);
```

#### 3.2 Add Security Headers (1 hour)
**Install:**
```bash
npm install helmet compression
```

**Update `index.js`:**
```javascript
const helmet = require('helmet');
const compression = require('compression');

// Security headers
app.use(helmet());

// Compression
app.use(compression());
```

#### 3.3 Centralized Error Handling (2 hours)
**Create:** `backend/middleware/error.middleware.js`

```javascript
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    // Production - don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
```

**Apply at end of `index.js`:**
```javascript
const { globalErrorHandler } = require('./middleware/error.middleware');

// All routes above...

// Error handling middleware (must be last)
app.use(globalErrorHandler);
```

#### 3.4 Add Database Indexes (1 hour)
**Update:** `backend/models/user.model.js`

```javascript
// Add indexes for better query performance
signupSchema.index({ email: 1 });
signupSchema.index({ username: 1 });
signupSchema.index({ registerAs: 1 });
```

**Update:** `backend/models/profile.model.js`

```javascript
profileSchema.index({ user: 1 });
```

#### 3.5 Health Check Endpoint (30 min)
**Add to `index.js`:**

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
```

#### 3.6 API Documentation (2 hours)
**Create:** `backend/README.md`

```markdown
# FYP Backend API

## Setup
1. Copy `.env.example` to `.env`
2. Fill in environment variables
3. Run `npm install`
4. Run `npm run dev`

## Environment Variables
See `.env.example`

## API Endpoints
See `/docs/API.md`

## Testing
Run `npm test`
```

**Create:** `backend/docs/API.md`

Copy the API Contract section from this unified plan.

#### 3.7 Request Logging (1.5 hours)
**Install:**
```bash
npm install morgan
```

**Add to `index.js`:**
```javascript
const morgan = require('morgan');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

#### 3.8 Standardize Response Format (2 hours)
**Create:** `backend/utils/apiResponse.js`

```javascript
class APIResponse {
  static success(res, statusCode, data, message = 'Success') {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static fail(res, statusCode, message) {
    return res.status(statusCode).json({
      status: 'fail',
      message,
    });
  }

  static error(res, statusCode, message) {
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }
}

module.exports = APIResponse;
```

**Use in controllers:**
```javascript
const APIResponse = require('../utils/apiResponse');

// Instead of:
res.status(200).json({ status: 'success', data: { user } });

// Use:
APIResponse.success(res, 200, { user }, 'User fetched successfully');
```

### Frontend Tasks (20 hours):

#### 3.1 Build Dashboard Page (6 hours)
**Create:** `frontend/app/dashboard/page.tsx`

```typescript
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { useSelector } from "react-redux";
import AuthController from "@/api/AuthController";

export default function DashboardPage() {
  const router = useRouter();
  const { getProfile, isLoading } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    getProfile()
      .then((data) => {
        setProfile(data.profile);
      })
      .catch(() => {
        router.push("/signin");
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please complete your registration</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-6">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.firstName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile.firstName[0]}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, {profile.firstName} {profile.lastName}!
              </h1>
              <p className="text-gray-600 capitalize">
                Role: {user.registerAs || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Profile Status</h3>
            <p className="text-3xl font-bold text-green-600">Complete</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Experience</h3>
            <p className="text-2xl font-bold">{profile.experienceLevel || "N/A"}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p className="text-2xl font-bold">
              {profile.city ? `${profile.city}, ${profile.country}` : "Not set"}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-gray-700">{profile.bio}</p>
        </div>

        {/* Expertise & Skills */}
        {(profile.expertise || profile.skills) && (
          <div className="bg-white rounded-lg shadow p-6">
            {profile.expertise && profile.expertise.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investor-specific */}
        {profile.organizationName && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-semibold mb-2">Organization</h3>
            <p className="text-lg">{profile.organizationName}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 3.2 Profile Viewing & Editing (4 hours)
**Create:** `frontend/app/profile/page.tsx`

```typescript
"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "rizzui";
import Link from "next/link";

export default function ProfilePage() {
  const { getProfile, isLoading } = useProfile();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile().then((data) => setProfile(data.profile));
  }, []);

  if (isLoading || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href="/profile/edit">
          <Button>Edit Profile</Button>
        </Link>
      </div>

      {/* Profile content (similar to dashboard) */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Display all profile fields */}
      </div>
    </div>
  );
}
```

**Create:** `frontend/app/profile/edit/page.tsx`

```typescript
"use client";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useForm } from "react-hook-form";
import { Button, Input, Textarea } from "rizzui";

export default function EditProfilePage() {
  const { getProfile, updateProfile, isLoading } = useProfile();
  const { register, handleSubmit, reset } = useForm();
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    getProfile().then((data) => {
      setInitialData(data.profile);
      reset(data.profile);
    });
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (!initialData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input label="First Name" {...register("firstName")} />
        <Input label="Last Name" {...register("lastName")} />
        <Textarea label="Bio" {...register("bio")} rows={5} />
        {/* Add more fields */}

        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </form>
    </div>
  );
}
```

#### 3.3 Password Reset Flow (3 hours)
**Create:** `frontend/app/password/forgot/page.tsx`

```typescript
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "rizzui";
import { apiClient } from "@/api/api.config";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await apiClient.post("/password/forgot", data);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            {...register("email", { required: true })}
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Update signin form link:**
```typescript
<Link href="/password/forgot" className="text-blue-500">
  Forgot password?
</Link>
```

#### 3.4 Route Protection Middleware (2 hours)
**Create:** `frontend/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("loginToken")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/signin", "/signup", "/password/forgot", "/password/reset"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route));

  // Protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/registeration"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect logic
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if ((pathname === "/signin" || pathname === "/signup") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Update token storage to set cookie:**
```typescript
// frontend/api/AuthController.ts
static setSession(token: string) {
  localStorage.setItem("loginToken", token);
  if (typeof document !== 'undefined') {
    document.cookie = `loginToken=${token}; path=/; max-age=7776000`; // 90 days
  }
}
```

#### 3.5 Error Boundary (1 hour)
**Create:** `frontend/components/ErrorBoundary.tsx`

```typescript
"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap app in `layout.tsx`:**
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

#### 3.6 Token Expiry Handling (1.5 hours)
**Install:**
```bash
npm install jwt-decode
```

**Update:** `frontend/api/api.config.ts`

```typescript
import { jwtDecode } from "jwt-decode";

// Response interceptor for token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AuthController.clearSession();
      window.location.href = "/signin";
      toast.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);
```

#### 3.7 Enhanced Home Page (2 hours)
**Update:** `frontend/app/page.tsx`

```typescript
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthController from "@/api/AuthController";
import Link from "next/link";
import { Button } from "rizzui";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (typeof window !== 'undefined') {
      const token = AuthController.getSession();
      if (token) {
        router.push("/dashboard");
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Turn Your Ideas Into Reality
          </h1>
          <p className="text-xl mb-8">
            Connect with experts, innovators, and investors to bring your vision to life
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Innovators</h3>
              <p className="text-gray-600">Share your ideas and get support</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Experts</h3>
              <p className="text-gray-600">Provide guidance and mentorship</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Investors</h3>
              <p className="text-gray-600">Discover investment opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explorers</h3>
              <p className="text-gray-600">Browse and connect</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Integration Checkpoint #3:
- [ ] Backend: Rate limiting working
- [ ] Backend: Error handling consistent
- [ ] Backend: Health endpoint returns 200
- [ ] Frontend: Dashboard displays user profile
- [ ] Frontend: Profile editing works
- [ ] Frontend: Route protection redirects correctly
- [ ] Frontend: Token expiry handled gracefully
- [ ] Test: Full user journey (signup → register → dashboard → edit → logout)

### Deliverables:
✅ Backend: Rate limiting, security headers, error handling
✅ Backend: API documentation complete
✅ Frontend: Dashboard with user info
✅ Frontend: Profile viewing and editing
✅ Frontend: Route protection working
✅ Frontend: Enhanced home page
✅ Integration: Smooth end-to-end UX

---

## 🧪 PHASE 4: TESTING & PRODUCTION (Days 12-15 - 24 hours)
### **Testing, Optimization, Deployment**

**Timeline:** Days 12-15
**Team:** Both teams in parallel
**Dependencies:** Phase 3 complete

### Backend Testing (10 hours):

#### 4.1 Setup Testing Framework (2 hours)
**Install:**
```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server
```

**Create:** `backend/jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.test.js'],
};
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### 4.2 Write Auth Tests (3 hours)
**Create:** `backend/__tests__/auth.test.js`

```javascript
const request = require('supertest');
const app = require('../app'); // Need to export app from index.js

describe('Auth Endpoints', () => {
  describe('POST /api/signup', () => {
    it('should create new user', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          registerAs: 'explorer',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // Create user first
      await request(app).post('/api/signup').send({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
        registerAs: 'explorer',
      });

      // Try duplicate
      const res = await request(app).post('/api/signup').send({
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123',
        registerAs: 'explorer',
      });

      expect(res.statusCode).toBe(409);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
          registerAs: 'explorer',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app).post('/api/signup').send({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123',
        registerAs: 'explorer',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
```

#### 4.3 Write Profile Tests (3 hours)
**Create:** `backend/__tests__/profile.test.js`

Test profile completion, updates, and retrieval.

#### 4.4 Write Unit Tests (2 hours)
Test individual functions, models, validators.

### Frontend Testing (8 hours):

#### 4.1 Setup Testing Framework (2 hours)
**Install:**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @testing-library/user-event
```

**Create:** `frontend/jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

**Create:** `frontend/jest.setup.js`

```javascript
import '@testing-library/jest-dom';
```

#### 4.2 Write Component Tests (3 hours)
**Create:** `frontend/__tests__/signin.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SigninForm from '@/app/signin/signin-form';

describe('SigninForm', () => {
  it('renders signin form', () => {
    render(<SigninForm />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows error for invalid email', async () => {
    render(<SigninForm />);
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

#### 4.3 Write Form Validation Tests (2 hours)
Test all Zod schemas with valid and invalid inputs.

#### 4.4 Write Integration Tests (1 hour)
Test complete user flows (signup → login → dashboard).

### Optimization & Polish (6 hours):

#### Backend:
- [ ] Add pagination to list endpoints
- [ ] Optimize database queries
- [ ] Add response caching where appropriate
- [ ] Review and optimize bundle size

#### Frontend:
- [ ] Image optimization (Next.js Image component)
- [ ] Code splitting for large components
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add meta tags for SEO

### Final Checklist:
- [ ] All tests passing (60%+ coverage)
- [ ] No console errors in production build
- [ ] Environment variables documented
- [ ] README files complete
- [ ] API documentation complete
- [ ] Security audit passed
- [ ] Performance optimized (Lighthouse score 80+)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessibility (WCAG AA compliance)

### Deliverables:
✅ Backend: Test suite with 60%+ coverage
✅ Frontend: Test suite for critical flows
✅ Both: Performance optimized
✅ Both: Production build successful
✅ Both: Documentation complete
✅ Project: Ready for deployment

---

## 📅 COMPLETE TIMELINE

| Phase | Days | Hours | Backend | Frontend | Status |
|-------|------|-------|---------|----------|--------|
| **Phase 0: Emergency Security** | Day 1 | 3h | 1.5h | 1.5h | 🔴 Not Started |
| **Phase 1: Critical Fixes** | Days 2-3 | 16h | 6h | 10h | 🔴 Not Started |
| **Phase 2: Profile Completion** | Days 4-7 | 28h | 14h | 14h | 🔴 Not Started |
| **Phase 3: User Experience** | Days 8-11 | 32h | 12h | 20h | 🔴 Not Started |
| **Phase 4: Testing & Production** | Days 12-15 | 24h | 10h | 14h | 🔴 Not Started |
| **TOTAL** | **15 days** | **103h** | **43.5h** | **59.5h** | **0% Complete** |

### Realistic Schedule (Full-Time Work):
- **Week 1:** Phases 0, 1, 2
- **Week 2:** Phase 3
- **Week 3:** Phase 4 + Buffer

### Part-Time Schedule (4 hours/day):
- **Week 1-2:** Phases 0, 1
- **Week 3-4:** Phase 2
- **Week 5-6:** Phase 3
- **Week 7:** Phase 4

---

## 🚀 GETTING STARTED

### Day 1 - START HERE:

#### Morning (2 hours):
1. Remove secrets from Git (30 min)
2. Change all credentials (30 min)
3. Create .env files (30 min)
4. Test backend still works (30 min)

#### Afternoon (1 hour):
1. Create frontend .env.local (30 min)
2. Test frontend still works (30 min)

#### Verification:
- [ ] No secrets in Git
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Signup works
- [ ] Login works

---

## 📞 COMMUNICATION PROTOCOL

### Daily Standup:
- What did I complete yesterday?
- What am I working on today?
- Any blockers?

### Integration Checkpoints:
- After Phase 1: Test auth flows
- After Phase 2: Test registration flows
- After Phase 3: Test full user journey

### When Backend is Blocked:
Frontend can work on:
- UI components
- Form validation
- Styling
- Documentation

### When Frontend is Blocked:
Backend can work on:
- API endpoints
- Tests
- Documentation
- Performance optimization

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Time underestimation | High | Medium | Prioritize Phases 0-2, Phase 3-4 optional for MVP |
| API contract misalignment | High | Low | Single source of truth (this doc), integration checkpoints |
| Breaking changes | Medium | Low | Keep existing endpoints, add new ones |
| Security vulnerabilities | Critical | Low | Phase 0 fixes, security audit in Phase 4 |
| Database migration issues | Medium | Low | New fields optional, backward compatible |

---

## 🎯 SUCCESS CRITERIA

### MVP Complete When:
✅ User can signup, complete registration, login
✅ User can view and edit their profile
✅ Dashboard shows user information
✅ All critical bugs fixed
✅ No security vulnerabilities
✅ Tests passing (60%+ coverage)
✅ Documentation complete
✅ Production build successful

### FYP Submission Ready When:
✅ All MVP criteria met
✅ Performance optimized (Lighthouse 80+)
✅ Accessibility compliant (WCAG AA)
✅ User testing completed
✅ Demo video recorded
✅ Project report written

---

## 📚 RESOURCES

### Documentation:
- `UNIFIED_PROJECT_PLAN.md` (this file) - Master plan
- `backend/docs/API.md` - API reference
- `backend/README.md` - Backend setup
- `frontend/README.md` - Frontend setup

### Code Style:
- Backend: Airbnb JavaScript style
- Frontend: TypeScript strict mode
- Both: ESLint + Prettier

### Git Workflow:
```bash
# Create feature branch
git checkout -b feature/profile-completion

# Make changes, commit
git add .
git commit -m "feat: add profile completion endpoint"

# Push and create PR
git push -u origin feature/profile-completion
```

---

## 📝 NOTES

### API Contract Changes:
Any changes to the API contract must be:
1. Documented in this plan
2. Communicated to both teams
3. Backward compatible (add, don't modify)
4. Tested thoroughly

### Breaking Changes:
**AVOID AT ALL COSTS.** If absolutely necessary:
1. Version the API (`/api/v2/...`)
2. Keep old endpoints working
3. Give frontend team 1 week notice
4. Update integration tests

### Questions?
Document them here for standup discussion.

---

**This is the single source of truth for the project. Both frontend and backend teams must follow this plan. Update this document when plans change.**

**Last Updated:** 2025-11-18
**Next Review:** After Phase 1 completion
