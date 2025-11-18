# 🚀 FYP Frontend - Complete Implementation Plan

**Project:** Innovation Platform (Innovators + Experts + Investors + Explorers)
**Current Status:** 30% Complete (Auth working, registration broken, no core features)
**Target:** Fully functional MVP
**Estimated Timeline:** 80-120 hours across 4 phases

---

## 📋 BACKEND API CONTRACT (DO NOT BREAK)

### Existing Endpoints (MUST MAINTAIN):
```
POST /api/login
Body: { email: string, password: string }
Response 200: { data: { token: string } }

POST /api/signup
Body: { email: string, password: string, username: string, registerAs: string }
Response 201: Success
Response 401: Duplicate email
Response 402: Duplicate username
```

### Authentication:
- Token stored in: `localStorage.getItem("loginToken")`
- Authorization header: `Bearer ${token}`
- Token interceptor already configured in axios

### New Endpoints Needed (Backend team to implement):
```
POST /api/profile/complete
Body: {
  // Personal info
  firstName: string,
  lastName?: string,
  gender?: string,
  dateOfBirth?: string,

  // Contact info
  phoneNo?: string,
  country?: string,
  city?: string,

  // Role-specific data
  expertise?: string[],
  skills?: string[],
  experienceLevel?: string,
  bio?: string,
  profileImage?: string,
  organizationName?: string, // For investors
  investingExperience?: string[] // For investors
}
Headers: Authorization: Bearer ${token}
Response 200: { data: { user: {...} } }

GET /api/profile
Headers: Authorization: Bearer ${token}
Response 200: { data: { user: {...}, profile: {...} } }

PUT /api/profile
Body: { ...updated fields }
Headers: Authorization: Bearer ${token}
Response 200: { data: { profile: {...} } }

POST /api/logout
Headers: Authorization: Bearer ${token}
Response 200: Success

POST /api/password/forgot
Body: { email: string }
Response 200: Success (sends reset email)

POST /api/password/reset
Body: { token: string, password: string }
Response 200: Success
```

---

## 🎯 PHASE 1: CRITICAL BUG FIXES (Week 1 - 8 hours)

**Goal:** Fix broken functionality, no new features
**Backward Compatibility:** ✅ Zero breaking changes

### 1.1 Fix Registration Flow State Bug (30 min)
**Files:**
- `app/registeration/expert/page.tsx:15`
- `app/registeration/investor/page.tsx:15`

**Changes:**
```diff
- const [currentStep, setCurrentStep] = useState(2);
+ const [currentStep, setCurrentStep] = useState(0);
```

**Testing:** Verify all three registration flows start at Step 1

---

### 1.2 Fix Module-Level State Leak (1 hour)
**Problem:** `let userProfiling = {}` persists across users

**Files:**
- `app/registeration/innovator/page.tsx`
- `app/registeration/expert/page.tsx`
- `app/registeration/investor/page.tsx`

**Solution:** Move to React state with proper typing

**Implementation:**
```typescript
// Instead of: let userProfiling = {}

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

const [registrationData, setRegistrationData] = useState<RegistrationData>({});

// Update handlers
const handlePersonalInfo = (data: any) => {
  setRegistrationData(prev => ({ ...prev, ...data }));
  setCurrentStep(1);
};
```

**Backward Compatibility:** No API changes, internal only

---

### 1.3 Remove Key Anti-Pattern (15 min)
**Problem:** `key={Math.random()}` breaks user input

**Files:** Search for `Math.random()` and remove from Select components
- `app/signup/signup-form.tsx:119`
- All registration forms

**Change:**
```diff
- key={Math.random().toString()}
+ // Remove key prop entirely, or use stable identifier
```

---

### 1.4 Fix Spelling Errors (15 min)
**Files:** Multiple

**Changes:**
- `rememverMe` → `rememberMe` (signin-form.tsx:24, 61)
- `settinhs` → `settings` (components/shared/Header/index.tsx)
- `experties` → `expertise` (where applicable)
- `Pleae` → `Please` (app/signin/page.tsx:17)

---

### 1.5 Environment Variables Setup (30 min)
**Create:** `.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api

# Firebase Configuration (move from code)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

**Update Files:**
- `api/api.config.ts`: Use `process.env.NEXT_PUBLIC_API_BASE_URL`
- `lib/firebaseConfig.ts`: Use env variables

**Backward Compatibility:** ✅ Default values maintain current behavior

---

### 1.6 Add Loading States (1 hour)
**Files:**
- `app/signin/signin-form.tsx` (currently hardcoded `isLoading={false}`)
- All registration forms

**Implementation:**
```typescript
const [isLoading, setIsLoading] = useState(false);

async function submit(data: Signin) {
  setIsLoading(true);
  try {
    const response = await handleLogin(data);
    // ... handle response
  } catch (error) {
    toast.error("Something went wrong");
  } finally {
    setIsLoading(false);
  }
}
```

---

### 1.7 Proper Error Handling (1.5 hours)
**Current Issue:** Errors logged but not shown to users

**Add to all API calls:**
```typescript
import toast from 'react-hot-toast';

try {
  const response = await apiCall();
  if (response.status === 200) {
    toast.success("Success!");
  }
} catch (error) {
  if (error.response?.status === 401) {
    toast.error("Unauthorized");
  } else if (error.response?.status === 500) {
    toast.error("Server error. Please try again.");
  } else {
    toast.error("Something went wrong");
  }
}
```

**Files:** All forms, API calls

---

### 1.8 Remove Console.logs (30 min)
**Action:** Search and remove/replace all console.log with proper logging

**Create:** `lib/logger.ts`
```typescript
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  }
};
```

**Replace:** All `console.log` with `logger.log` or remove entirely

---

### 1.9 Clean Up Commented Code (15 min)
**Files:**
- `app/registeration/layout.tsx` (lines 37-83)
- Any other commented blocks

**Action:** Delete completely (version control keeps history)

---

### 1.10 Create Constants File (1 hour)
**Problem:** Duplicated options across files

**Create:** `data/constants.ts`
```typescript
export const EXPERIENCE_LEVELS = [
  { label: "1-2 years", value: "1-2" },
  { label: "3-5 years", value: "3-5" },
  { label: "5+ years", value: "5+" },
] as const;

export const USER_ROLES = [
  { label: "Explorer", value: "explorer" },
  { label: "Expert", value: "expert" },
  { label: "Innovator", value: "innovator" },
  { label: "Investor", value: "investor" },
] as const;

export const EXPERTISE_AREAS = [
  { label: "Artificial Intelligence", value: "ai" },
  { label: "Web Development", value: "web" },
  { label: "Mobile Development", value: "mobile" },
  // ... add more
] as const;

export const SKILLS = [
  { label: "JavaScript", value: "javascript" },
  { label: "React", value: "react" },
  { label: "Node.js", value: "nodejs" },
  // ... add more
] as const;
```

**Update:** All registration forms to import from constants

---

**PHASE 1 DELIVERABLES:**
✅ Registration flows work correctly (start at step 1)
✅ No data leaks between users
✅ User input doesn't disappear
✅ All spelling corrected
✅ Environment variables configured
✅ Proper loading states
✅ User-friendly error messages
✅ Clean codebase (no console.logs, no commented code)
✅ Reusable constants

**Testing Checklist:**
- [ ] Can complete Innovator registration (steps 1→2→3)
- [ ] Can complete Expert registration (steps 1→2→3)
- [ ] Can complete Investor registration (steps 1→2→3)
- [ ] Select dropdowns don't lose values
- [ ] Loading indicators show during API calls
- [ ] Errors display as toasts
- [ ] .env.local works (change API URL and verify)

---

## 🔧 PHASE 2: PROFILE COMPLETION API INTEGRATION (Week 2 - 20 hours)

**Goal:** Actually save registration data to backend
**Backward Compatibility:** ✅ New endpoints, existing ones unchanged

### 2.1 Create Profile API Controller (2 hours)
**Create:** `api/ProfileController.ts`

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
    return new Promise((resolve, reject) => {
      apiClient
        .post("/profile/complete", data)
        .then((res) => {
          if (res.status === 200 || res.status === 201) {
            resolve(res);
          } else {
            reject(res);
          }
        })
        .catch(({ response }) => {
          reject(response);
        });
    });
  }

  static getProfile(): Promise<any> {
    return apiClient.get("/profile");
  }

  static updateProfile(data: Partial<CompleteProfileData>): Promise<any> {
    return apiClient.put("/profile", data);
  }
}

export default ProfileController;
```

**Backward Compatibility:** ✅ New file, doesn't affect existing auth

---

### 2.2 Create Profile Completion Hook (1.5 hours)
**Create:** `hooks/use-profile.ts`

```typescript
import { useState } from "react";
import ProfileController, { CompleteProfileData } from "@/api/ProfileController";
import toast from "react-hot-toast";

export function useProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeProfile = async (data: CompleteProfileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProfileController.completeProfile(data);
      toast.success("Profile completed successfully!");
      return response;
    } catch (err: any) {
      const errorMsg = err?.data?.message || "Failed to complete profile";
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    setIsLoading(true);
    try {
      const response = await ProfileController.getProfile();
      return response.data;
    } catch (err) {
      toast.error("Failed to fetch profile");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeProfile,
    getProfile,
    isLoading,
    error,
  };
}
```

---

### 2.3 Implement Form Submission - Innovator (2 hours)
**File:** `app/registeration/innovator/innovator-finish-form.tsx`

**Add submission logic:**
```typescript
import { useProfile } from "@/hooks/use-profile";
import { useRouter } from "next/navigation";

export default function InnovatorFinishForm({ updateUserProfiling }: any) {
  const { completeProfile, isLoading } = useProfile();
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});

  const onSubmit: SubmitHandler<InnovatorFinishFormFieldTypes> = async (data) => {
    console.log("Form data:", data);

    // Merge all registration data
    const profileData = {
      ...registrationData, // From parent state
      ...data,
    };

    try {
      await completeProfile(profileData);
      router.push("/dashboard"); // Or wherever completed users go
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... existing form fields ... */}

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

**Pass registration data from parent:**
```typescript
// In app/registeration/innovator/page.tsx
<InnovatorFinishForm
  updateUserProfiling={handleFinishRegistration}
  registrationData={registrationData} // Pass accumulated data
/>
```

---

### 2.4 Implement Form Submission - Expert (1.5 hours)
**File:** `app/registeration/expert/expert-finish-form.tsx`

Same pattern as Innovator, adjusted for expert-specific fields

---

### 2.5 Implement Form Submission - Investor (1.5 hours)
**File:** `app/registeration/investor/investor-finish-form.tsx`

Same pattern, with `organizationName` and `investingExperience` fields

---

### 2.6 Add Form Validation to Finish Forms (2 hours)
**Files:** All finish forms

**Create Zod schemas:**
```typescript
// validators/profile-schemas.ts
import { z } from "zod";

export const innovatorFinishSchema = z.object({
  expertise: z.array(z.string()).min(1, "Select at least one expertise area"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  experienceLevel: z.string().min(1, "Select experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().optional(),
});

export const expertFinishSchema = z.object({
  expertise: z.array(z.string()).min(1, "Select at least one expertise area"),
  experienceLevel: z.string().min(1, "Select experience level"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().optional(),
});

export const investorFinishSchema = z.object({
  organizationName: z.string().min(2, "Organization name required"),
  experienceLevel: z.string().min(1, "Select experience level"),
  investingExperience: z.array(z.string()).min(1, "Select investing experience"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  profileImage: z.string().optional(),
});
```

**Apply to forms using react-hook-form:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(innovatorFinishSchema)
});
```

---

### 2.7 Handle Profile Completion Success (1 hour)
**Create:** `app/dashboard/page.tsx` (basic version)

```typescript
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import AuthController from "@/api/AuthController";

export default function DashboardPage() {
  const router = useRouter();
  const { getProfile, isLoading } = useProfile();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    // Fetch user profile
    getProfile()
      .then((data) => setProfile(data))
      .catch(() => router.push("/signin"));
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome, {profile?.firstName}!</h1>
      <p>Your role: {profile?.role}</p>
      {/* Add more dashboard content */}
    </div>
  );
}
```

---

### 2.8 Update Redux Store (1 hour)
**Extend:** `store/store.ts`

Add profile slice:
```typescript
const profileDataSlice = createSlice({
  name: "profileData",
  initialState: {
    firstName: "",
    lastName: "",
    role: "",
    profileImage: "",
    // ... other fields
  },
  reducers: {
    setProfileData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearProfileData: () => initialState,
  },
});

export const profileDataActions = profileDataSlice.actions;
```

**Store profile data after login/completion:**
```typescript
dispatch(profileDataActions.setProfileData(response.data.profile));
```

---

### 2.9 Add Route Protection Middleware (2 hours)
**Create:** `middleware.ts` (Next.js 14 middleware)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("loginToken")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/signin", "/signup", "/password/forgot"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Registration routes (need token but no complete profile)
  const registrationRoutes = ["/registeration"];
  const isRegistrationRoute = registrationRoutes.some(route => pathname.startsWith(route));

  // Protected routes (need token AND complete profile)
  const protectedRoutes = ["/dashboard", "/profile"];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Redirect logic
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Note:** Currently using localStorage for token. For middleware to work, need to:
1. Keep localStorage for backward compatibility
2. Also set cookie when storing token (for middleware access)

**Update:** `api/AuthController.ts`
```typescript
static setSession(token: string) {
  localStorage.setItem("loginToken", token);
  // Also set cookie for middleware
  document.cookie = `loginToken=${token}; path=/; max-age=2592000`; // 30 days
}
```

---

### 2.10 Add Logout Functionality (1.5 hours)
**Update:** `api/AuthController.ts`

```typescript
static clearSession() {
  localStorage.removeItem("loginToken");
  document.cookie = "loginToken=; path=/; max-age=0";
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

**Create:** `hooks/use-auth.ts` (extend existing)
```typescript
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

return { handleLogin, handleSignup, handleLogout, setSession };
```

**Update:** `components/shared/Header/index.tsx`

```typescript
import { useAuth } from "@/hooks/use-auth";
import { Button } from "rizzui";

export default function MainHeader() {
  const { handleLogout } = useAuth();
  const user = useSelector((state: any) => state.user);

  return (
    // ... existing header
    {user?.username ? (
      <div className="flex items-center gap-4">
        <span>Welcome, {user.username}</span>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>
    ) : (
      <Link href="/signup">
        <button>Join us</button>
      </Link>
    )}
  );
}
```

---

### 2.11 Testing & Validation (3 hours)
**Test scenarios:**
1. Complete registration as Innovator → verify profile saved
2. Complete registration as Expert → verify profile saved
3. Complete registration as Investor → verify profile saved
4. Logout → verify redirected to signin
5. Access protected route without login → verify redirected
6. Login → verify redirected to dashboard
7. Refresh during registration → verify data persists (localStorage)

---

**PHASE 2 DELIVERABLES:**
✅ Profile completion API integration
✅ All registration flows submit data to backend
✅ Dashboard page for authenticated users
✅ Logout functionality
✅ Route protection
✅ Form validation on finish forms
✅ Redux store includes profile data
✅ Success/error feedback to users

**Backend Requirements (coordinate with backend team):**
- [ ] `POST /api/profile/complete` endpoint
- [ ] `GET /api/profile` endpoint
- [ ] `POST /api/logout` endpoint
- [ ] Profile table/schema in database
- [ ] Link profiles to users via token/user_id

---

## 🎨 PHASE 3: USER EXPERIENCE & FEATURES (Week 3-4 - 30 hours)

**Goal:** Build actual platform features
**Backward Compatibility:** ✅ All additions, no changes to existing

### 3.1 Enhance Home Page (4 hours)
**File:** `app/page.tsx`

**For unauthenticated users:**
- Hero section with value proposition
- Features showcase
- CTA to sign up
- How it works section
- Role explanations (Innovator, Expert, Investor, Explorer)

**For authenticated users:**
- Redirect to `/dashboard` instead of showing empty page

---

### 3.2 Build Dashboard (8 hours)
**Create:** `app/dashboard/page.tsx`

**Features:**
- User profile summary (image, name, role, bio)
- Role-specific content:
  - **Innovators:** "My Ideas", "Find Experts", "Find Investors"
  - **Experts:** "My Expertise", "Browse Ideas", "Consultation Requests"
  - **Investors:** "Investment Opportunities", "Portfolio", "Browse Ideas"
  - **Explorers:** "Trending Ideas", "Top Experts", "Success Stories"
- Quick stats (profile completion %, connections, etc.)
- Activity feed (placeholder for now)

---

### 3.3 Profile Viewing & Editing (6 hours)
**Create:** `app/profile/page.tsx`

**Features:**
- View own profile
- Edit profile button
- Update personal info
- Change profile image
- Update bio
- Update expertise/skills

**Create:** `app/profile/edit/page.tsx`

**Features:**
- Pre-populated form with current data
- Submit updates via `ProfileController.updateProfile()`
- Image upload with preview
- Form validation
- Success/error feedback

---

### 3.4 Password Reset Flow (4 hours)
**Create:**
- `app/password/forgot/page.tsx`
- `app/password/reset/page.tsx`

**Forgot Password Page:**
```typescript
async function handleForgotPassword(email: string) {
  try {
    await apiClient.post("/password/forgot", { email });
    toast.success("Reset link sent to your email");
  } catch (error) {
    toast.error("Failed to send reset link");
  }
}
```

**Reset Password Page:**
- Accept token from URL query parameter
- New password + confirm password fields
- Submit to `/api/password/reset`

**Update:** `app/signin/signin-form.tsx`
```diff
- <Link href="/" className="text-blue-500">
+ <Link href="/password/forgot" className="text-blue-500">
```

---

### 3.5 Explorer User Flow (3 hours)
**Create:** `app/registeration/explorer/page.tsx`

Since explorers are just browsing:
- Simple one-page registration
- Optional profile image
- Optional bio ("Tell us about yourself")
- Submit and redirect to dashboard/explore

Or: Skip additional registration entirely, redirect to dashboard after signup

---

### 3.6 Error Boundaries (2 hours)
**Create:** `components/ErrorBoundary.tsx`

```typescript
"use client";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap app:** `app/layout.tsx`
```typescript
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

### 3.7 Token Expiry Handling (3 hours)
**Update:** `api/api.config.ts`

```typescript
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

**Add token expiry check on app load:**
```typescript
// hooks/use-auth.ts
const checkTokenExpiry = () => {
  const token = AuthController.getSession();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      AuthController.clearSession();
      return false;
    }
    return true;
  } catch (error) {
    AuthController.clearSession();
    return false;
  }
};
```

---

**PHASE 3 DELIVERABLES:**
✅ Engaging home page for visitors
✅ Functional dashboard with role-specific content
✅ Profile viewing and editing
✅ Password reset flow
✅ Explorer user flow completed
✅ Error boundaries prevent app crashes
✅ Token expiry handling
✅ Smooth UX throughout app

---

## 🚀 PHASE 4: POLISH & PRODUCTION READINESS (Week 5 - 20 hours)

**Goal:** Make it production-ready
**Backward Compatibility:** ✅ Optimizations and enhancements only

### 4.1 Comprehensive Testing (6 hours)
**Setup testing framework:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

**Configure:** `jest.config.js`

**Write tests for:**
- Authentication flows (login, signup, logout)
- Form validation (all Zod schemas)
- Registration completion
- Profile updates
- Error handling
- Route protection

**Example test:**
```typescript
// __tests__/auth/signin.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import SigninForm from "@/app/signin/signin-form";

describe("SigninForm", () => {
  it("shows error for invalid email", async () => {
    render(<SigninForm />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(emailInput, { target: { value: "invalid" } });
    fireEvent.submit(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

---

### 4.2 Performance Optimization (4 hours)
**Add image optimization:** `next.config.mjs`
```typescript
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

**Use Next.js Image component:**
```typescript
import Image from "next/image";

<Image
  src={profileImage}
  alt="Profile"
  width={200}
  height={200}
  priority
/>
```

**Add loading skeletons:**
- Dashboard loading state
- Profile loading state
- Forms loading state

**Code splitting:**
- Lazy load rich text editor
- Lazy load image picker

```typescript
import dynamic from "next/dynamic";

const TextEditor = dynamic(() => import("@/components/shared/textEditor/TextEditor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});
```

---

### 4.3 SEO & Meta Tags (2 hours)
**Update:** `app/layout.tsx`

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Innovation Platform - Connect, Innovate, Invest",
  description: "Connect innovators with experts and investors to turn ideas into reality",
  keywords: "innovation, startup, investors, experts, ideas",
};
```

**Add page-specific metadata:**
```typescript
// app/signin/page.tsx
export const metadata = {
  title: "Sign In - Innovation Platform",
};
```

---

### 4.4 Security Audit (3 hours)
**Checklist:**
- [ ] All API endpoints use authentication
- [ ] No sensitive data in localStorage (consider httpOnly cookies)
- [ ] CSRF protection implemented
- [ ] XSS prevention (sanitize user input, especially rich text)
- [ ] File upload validation (image size, type)
- [ ] Rate limiting on API calls
- [ ] Environment variables not committed

**Add input sanitization:**
```bash
npm install dompurify
```

```typescript
import DOMPurify from "dompurify";

const sanitizedBio = DOMPurify.sanitize(bio);
```

---

### 4.5 Accessibility (A11y) (2 hours)
**Install:** `eslint-plugin-jsx-a11y`

**Ensure:**
- All images have alt text
- Forms have proper labels
- Keyboard navigation works
- Color contrast meets WCAG standards
- Screen reader friendly
- Focus indicators visible

**Test with:**
- Chrome Lighthouse
- axe DevTools

---

### 4.6 Analytics Integration (1 hour)
**Add Google Analytics or similar:**

```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
};

// Usage
trackEvent('registration_completed', { role: 'innovator' });
```

---

### 4.7 Documentation (2 hours)
**Create:** `README.md`

```markdown
# Innovation Platform - Frontend

## Tech Stack
- Next.js 14.2.17
- React 18
- TypeScript
- TailwindCSS
- Redux Toolkit
- React Hook Form + Zod
- Firebase Storage

## Getting Started
1. Clone repository
2. Copy `.env.example` to `.env.local`
3. Fill in environment variables
4. Run `npm install`
5. Run `npm run dev`
6. Open http://localhost:3000

## Environment Variables
See `.env.example`

## Features
- User authentication (login/signup)
- Role-based registration (Innovator, Expert, Investor, Explorer)
- Profile management
- Dashboard
- Password reset

## API Integration
Backend API should be running at URL specified in `NEXT_PUBLIC_API_BASE_URL`

Required endpoints: See IMPLEMENTATION_PLAN.md

## Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
```

**Create:** `.env.example`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# ... etc
```

---

### 4.8 Build & Deploy Preparation (2 hours)
**Test production build:**
```bash
npm run build
npm run start
```

**Fix any build errors**

**Add build optimizations:** `next.config.mjs`
```typescript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
};
```

**Prepare deployment checklist:**
- [ ] Environment variables configured in hosting platform
- [ ] Firebase Storage CORS configured
- [ ] API base URL points to production backend
- [ ] Build succeeds without errors
- [ ] All critical user flows tested in production build

---

**PHASE 4 DELIVERABLES:**
✅ Test coverage for critical flows
✅ Performance optimized (images, code splitting)
✅ SEO configured
✅ Security hardened
✅ Accessibility compliant
✅ Analytics integrated
✅ Documentation complete
✅ Production build ready

---

## 📊 TIMELINE SUMMARY

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| Phase 1: Critical Fixes | Week 1 (8h) | Bug fixes, cleanup | 🔴 Not Started |
| Phase 2: API Integration | Week 2 (20h) | Profile completion, auth | 🔴 Not Started |
| Phase 3: Features | Week 3-4 (30h) | Dashboard, profile, UX | 🔴 Not Started |
| Phase 4: Production | Week 5 (20h) | Testing, optimization | 🔴 Not Started |
| **TOTAL** | **78 hours** | **4 phases** | **0% Complete** |

---

## 🎯 IMMEDIATE NEXT STEPS (Start Here)

### Today:
1. ✅ Create `.env.local` with environment variables
2. ✅ Fix `currentStep` initialization in Expert/Investor registration
3. ✅ Replace module-level state with React state
4. ✅ Remove `key={Math.random()}` from Select components
5. ✅ Fix spelling errors

### This Week:
6. ✅ Add loading states to all forms
7. ✅ Implement proper error handling
8. ✅ Remove console.logs
9. ✅ Create constants file
10. ✅ Test all registration flows end-to-end

### Coordinate with Backend Team:
- Share required API endpoints list
- Agree on request/response formats
- Test integration with `/profile/complete` endpoint
- Implement authentication middleware on backend

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Backend API not ready
**Mitigation:**
- Use mock API responses during development
- Create API interface layer for easy swapping

### Risk 2: Breaking changes during refactor
**Mitigation:**
- Git branch for each phase
- Test existing flows after each change
- Keep Phase 1 changes minimal and isolated

### Risk 3: Time underestimation
**Mitigation:**
- Phase 1 & 2 are MUST-HAVE (28 hours)
- Phase 3 & 4 can be scoped down if needed
- Prioritize core flows over polish

---

## 📝 BACKWARD COMPATIBILITY GUARANTEES

✅ **Existing API contracts unchanged**
- `/api/login` - no changes
- `/api/signup` - no changes
- Token format - no changes
- Request/response structure - no changes

✅ **New endpoints only (no modifications)**
- All profile-related APIs are new
- Backend can implement incrementally

✅ **Existing user flows enhanced, not replaced**
- Login/signup continue to work
- New features are additions

✅ **Environment variables with defaults**
- If `.env.local` missing, falls back to hardcoded values
- No deployment breaks

✅ **Gradual migration**
- Can deploy Phase 1 (fixes) independently
- Phase 2+ requires backend coordination

---

## 🎓 LEARNING OUTCOMES (FYP Context)

This plan demonstrates:
- **Full-stack integration** (Frontend + Backend APIs)
- **Modern React patterns** (Hooks, Context, State Management)
- **Production best practices** (Testing, Security, Performance)
- **Project management** (Phased approach, risk mitigation)
- **Code quality** (TypeScript, Validation, Error handling)

---

**Ready to start? Begin with Phase 1, Task 1.1** 🚀

_For questions or issues, refer to this plan or create a new task in the project board._
