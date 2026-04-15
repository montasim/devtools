# Authentication System Design for Devtools

**Date:** 2026-04-15
**Status:** Approved
**Author:** Claude + User Collaboration

## Overview

Integrate a simplified authentication system from the nextjs-saas-starter project into the devtools application. The system provides email/password authentication with OTP email verification for registration and password reset, using Resend email service and single-page multi-step forms.

## User Requirements

- Email/password authentication with OTP verification
- Registration with email verification
- Login functionality
- Password reset with OTP
- Protected routes (profile, settings)
- Basic user information (email, password, name)
- Use Resend for email service
- Single-page multi-step forms
- Redirect to `/json?tab=diff` after login

## User Flows

### Registration Flow

1. User visits `/auth/register`
2. **Step 1**: Enter email address → Click "Send OTP"
3. System generates 6-digit OTP, hashes it, stores in database
4. System sends OTP email via Resend
5. **Step 2**: User enters 6-digit OTP → Click "Verify"
6. System validates OTP, marks as used
7. **Step 3**: User enters name and password → Click "Create Account"
8. System creates User account with emailVerified timestamp
9. Redirect to `/auth/login` with success message
10. User logs in with email/password
11. After successful login, redirect to `/json?tab=diff`

### Login Flow

1. User visits `/auth/login`
2. Enter email and password → Click "Login"
3. System validates credentials
4. System checks email verification status
5. System generates JWT token (7-day expiry)
6. System sets HttpOnly cookie with token
7. Redirect to `/json?tab=diff`

### Password Reset Flow

1. User visits `/auth/reset-password`
2. **Step 1**: Enter email address → Click "Send OTP"
3. System generates 6-digit OTP, hashes it, stores in database
4. System sends OTP email via Resend
5. **Step 2**: User enters 6-digit OTP and new password → Click "Reset Password"
6. System validates OTP, marks as used
7. System updates user password hash
8. Redirect to `/auth/login`

### Logout Flow

1. User clicks logout
2. System clears auth cookie
3. Redirect to home page

## Database Schema

### Prisma Models

```prisma
model User {
  id             String    @id @default(uuid())
  email          String    @unique
  passwordHash   String
  name           String
  emailVerified  DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  otps           UserOtp[]
}

model UserOtp {
  id        String   @id @default(uuid())
  email     String
  codeHash  String   // HMAC-SHA256(otp, OTP_HMAC_SECRET)
  intent    String   // REGISTER | PASSWORD_RESET
  used      Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime  @default(now())

  @@index([email, intent, used, expiresAt])
}
```

### Migration Plan

1. Add User and UserOtp models to existing schema
2. Run `prisma migrate dev --name add_auth_system`
3. Generate Prisma client
4. Verify schema in Prisma Studio

## File Structure

```
lib/auth/
  ├── password-policy.ts       # Password validation rules
  ├── crypto.ts                # Enhanced hashing utilities
  ├── jwt.ts                   # JWT generation/verification
  ├── otp.ts                   # OTP generation/hashing/validation
  ├── email.ts                 # Resend email service integration
  ├── session.ts               # Session management utilities
  └── repos/
      ├── user.repo.ts         # User CRUD operations
      └── otp.repo.ts          # OTP lifecycle management

app/api/auth/
  ├── register/
  │   ├── send-otp/route.ts    # POST - Send registration OTP
  │   └── verify-otp/route.ts  # POST - Verify OTP & create account
  ├── login/route.ts           # POST - Email/password login
  ├── logout/route.ts          # POST - Clear session
  ├── me/route.ts              # GET - Get current user
  └── password-reset/
      ├── send-otp/route.ts    # POST - Send reset OTP
      └── confirm/route.ts     # POST - Verify OTP & reset password

app/auth/
  ├── login/page.tsx           # Login page
  ├── register/page.tsx        # Multi-step registration (email → OTP → form)
  └── reset-password/page.tsx  # Multi-step password reset

app/
  ├── profile/page.tsx         # Protected user profile
  └── settings/page.tsx        # Protected user settings

middleware.ts                  # Enhanced with route protection
hooks/useAuth.ts              # Auth hook for components (new)
context/AuthContext.tsx       # Auth state management (new)
```

## Core Components

### OTP System

**Specifications:**

- 6-digit numeric codes (100000-999999)
- 15-minute expiry from generation
- HMAC-SHA256 hashing with OTP_HMAC_SECRET
- Rate limiting: 3 OTP requests per hour per email
- One-time use enforcement (marked as used after verification)
- Automatic cleanup of expired OTPs via cron job

**Security Features:**

- Hashed storage (never store plain OTPs)
- Intent-based validation (REGISTER vs PASSWORD_RESET)
- Expiry checking
- Used flag to prevent replay attacks

### Email Templates

**Registration OTP Email:**

```
Subject: Verify your email for Devtools

Your verification code is: {OTP}

This code expires in 15 minutes.

If you didn't request this, please ignore this email.
```

**Password Reset OTP Email:**

```
Subject: Reset your password for Devtools

Your password reset code is: {OTP}

This code expires in 15 minutes.

If you didn't request this, please ignore this email.
```

### Session Management

**JWT Token Structure:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890 + 7 days
}
```

**Cookie Configuration:**

- HttpOnly: true (prevents XSS)
- Secure: true (HTTPS only in production)
- SameSite: strict (prevents CSRF)
- MaxAge: 7 days
- Path: /

**Token Validation:**

- Verify signature with JWT_SECRET
- Check expiry
- Fetch user from database to ensure account exists
- Check email verification status

### Password Policy

**Requirements:**

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&\*)

**Validation:**

- Zod schema for API validation
- Client-side validation for better UX
- Clear error messages for failed requirements

### Security Features

**Rate Limiting:**

- Use existing `lib/rate-limit.ts`
- 3 OTP requests per hour per email
- 5 login attempts per 15 minutes per IP
- 3 password reset requests per hour per email

**Password Security:**

- Bcrypt hashing with cost factor 12
- Never store plain passwords
- Password hash validation on login

**OTP Security:**

- HMAC-SHA256 hashing with secret key
- 15-minute expiry
- One-time use enforcement
- Intent-based validation

**Session Security:**

- HttpOnly cookies prevent XSS
- SameSite=strict prevents CSRF
- Secure flag for HTTPS
- Regular token rotation on logout

## Dependencies

### New Dependencies

```json
{
    "jsonwebtoken": "^9.0.2",
    "@types/jsonwebtoken": "^9.0.2",
    "resend": "^3.0.0"
}
```

### Installation

```bash
pnpm add jsonwebtoken @types/jsonwebtoken resend
```

## Environment Variables

```env
# Authentication
JWT_SECRET=your-secure-random-string-min-32-bytes-generate-with-openssl-rand-base64-32
OTP_HMAC_SECRET=your-otp-secret-min-32-bytes-generate-with-openssl-rand-base64-32

# Email Service (Resend)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:3000

# Rate Limiting (existing)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000
```

### Secret Generation

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate OTP_HMAC_SECRET
openssl rand -base64 32
```

## API Endpoints

### Registration

**POST /api/auth/register/send-otp**

- Request: `{ email: string }`
- Response: `{ success: true, message: string }`
- Rate limit: 3 requests per hour per email
- Generates OTP, hashes it, stores in database
- Sends email via Resend

**POST /api/auth/register/verify-otp**

- Request: `{ email: string, code: string, name: string, password: string }`
- Response: `{ success: true, message: string }`
- Validates OTP, marks as used
- Creates User account
- Sets emailVerified timestamp

### Login

**POST /api/auth/login**

- Request: `{ email: string, password: string }`
- Response: `{ success: true, user: { id, email, name } }`
- Validates credentials
- Checks email verification
- Generates JWT token
- Sets HttpOnly cookie
- Returns user data

### Logout

**POST /api/auth/logout**

- Request: None (uses cookie)
- Response: `{ success: true }`
- Clears auth cookie
- Redirects to home

### Current User

**GET /api/auth/me**

- Request: None (uses cookie)
- Response: `{ user: { id, email, name, emailVerified } }`
- Validates JWT token
- Returns current user data
- Returns 401 if not authenticated

### Password Reset

**POST /api/auth/password-reset/send-otp**

- Request: `{ email: string }`
- Response: `{ success: true, message: string }`
- Rate limit: 3 requests per hour per email
- Generates OTP, hashes it, stores in database
- Sends email via Resend

**POST /api/auth/password-reset/confirm**

- Request: `{ email: string, code: string, password: string }`
- Response: `{ success: true, message: string }`
- Validates OTP, marks as used
- Updates user password hash

## Route Protection

### Protected Routes

- `/profile` - User profile page
- `/settings` - User settings page

### Middleware Logic

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
    // Check for protected routes
    if (
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/settings')
    ) {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            // Redirect to login
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Token is valid, allow request
            return NextResponse.next();
        } catch (error) {
            // Token is invalid, redirect to login
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Allow all other routes
    return NextResponse.next();
}
```

## UI Components

### Registration Page (`/auth/register`)

**State Management:**

```typescript
const [step, setStep] = useState(1); // 1: email, 2: otp, 3: account
const [email, setEmail] = useState('');
const [otp, setOtp] = useState('');
const [name, setName] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
```

**Step 1: Email Input**

- Email input field
- "Send OTP" button
- Loading state during API call
- Success message after OTP sent
- "Continue" button to move to step 2

**Step 2: OTP Verification**

- 6-digit OTP input (auto-focus)
- "Verify" button
- Loading state during API call
- Error message for invalid OTP
- "Resend OTP" option (rate limited)
- "Back" button to return to step 1

**Step 3: Account Creation**

- Name input field
- Password input field (with toggle visibility)
- Confirm password input field
- Password strength indicator
- "Create Account" button
- Loading state during API call
- Error messages for validation failures
- "Back" button to return to step 2

**Success State:**

- Show success message
- "Go to Login" button
- Auto-redirect after 3 seconds

### Login Page (`/auth/login`)

**Components:**

- Email input field
- Password input field (with toggle visibility)
- "Remember me" checkbox
- "Login" button
- Loading state during API call
- Error messages for invalid credentials
- "Forgot password?" link
- "Don't have an account? Sign up" link

**Redirects:**

- Successful login → `/json?tab=diff`
- Already logged in → `/json?tab=diff`

### Reset Password Page (`/auth/reset-password`)

**Step 1: Email Input**

- Email input field
- "Send OTP" button
- Loading state during API call
- Success message after OTP sent
- "Continue" button to move to step 2

**Step 2: Reset Password**

- 6-digit OTP input (auto-focus)
- New password input field (with toggle visibility)
- Confirm password input field
- Password strength indicator
- "Reset Password" button
- Loading state during API call
- Error messages for invalid OTP or validation failures
- "Back" button to return to step 1

**Success State:**

- Show success message
- "Go to Login" button
- Auto-redirect after 3 seconds

### Client-Side Auth State

**AuthContext:**

```typescript
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**useAuth Hook:**

```typescript
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
```

## Implementation Approach

### Phase 1: Foundation

1. **Database Setup**
    - Add User and UserOtp models to Prisma schema
    - Run migration
    - Generate Prisma client

2. **Dependencies**
    - Install jsonwebtoken, @types/jsonwebtoken, resend
    - Add environment variables

3. **Core Utilities**
    - Copy and adapt crypto utilities
    - Create JWT utilities
    - Create OTP utilities
    - Set up email service integration

### Phase 2: Backend

4. **Repository Layer**
    - Create user.repo.ts
    - Create otp.repo.ts

5. **API Routes**
    - Registration endpoints (send-otp, verify-otp)
    - Login endpoint
    - Logout endpoint
    - Me endpoint
    - Password reset endpoints (send-otp, confirm)

### Phase 3: Frontend

6. **Auth State Management**
    - Create AuthContext
    - Create useAuth hook
    - Integrate with root layout

7. **Auth Pages**
    - Registration page (multi-step)
    - Login page
    - Reset password page (multi-step)

8. **Protected Routes**
    - Create profile page
    - Create settings page
    - Update middleware for route protection

### Phase 4: Integration

9. **Navigation**
    - Add auth links to main navigation
    - Add logout functionality
    - Update redirect logic

10. **Testing**
    - Test registration flow end-to-end
    - Test login flow
    - Test password reset flow
    - Test route protection
    - Test email delivery

## Migration Strategy

### Copy from nextjs-saas-starter

**Keep and Adapt:**

- Database models (User, UserOtp)
- Auth utilities (crypto, jwt, otp, email)
- Repository layer (user.repo, otp.repo)
- API routes (register, login, password-reset)
- Auth pages structure

**Simplify:**

- Remove Redis dependency (use existing rate limiting)
- Remove admin/super admin roles
- Remove OAuth integration
- Remove trusted devices
- Remove activity logs
- Simplify session management

**Adapt to Devtools:**

- Redirect to `/json?tab=diff` after login
- Use existing shadcn/ui components
- Follow existing code style and structure
- Integrate with existing rate limiting

## Success Criteria

- [ ] User can register with email verification
- [ ] User can login with email/password
- [ ] User can reset password with OTP
- [ ] Protected routes require authentication
- [ ] OTP emails are sent via Resend
- [ ] Sessions are managed with JWT tokens
- [ ] Rate limiting prevents abuse
- [ ] Password policy is enforced
- [ ] Email verification is required
- [ ] Logout clears session properly
- [ ] UI is responsive and user-friendly
- [ ] Error handling is clear and helpful

## Security Considerations

1. **Secrets Management**
    - JWT_SECRET must be cryptographically random
    - OTP_HMAC_SECRET must be cryptographically random
    - Never commit secrets to git
    - Use different secrets for development/production

2. **Password Security**
    - Never store plain passwords
    - Use bcrypt with cost factor 12
    - Enforce strong password policy
    - Hash passwords before storage

3. **OTP Security**
    - Never store plain OTPs
    - Use HMAC-SHA256 for hashing
    - Enforce expiry time
    - Mark as used after verification

4. **Session Security**
    - Use HttpOnly cookies
    - Use Secure flag in production
    - Use SameSite=strict
    - Implement token expiry

5. **Rate Limiting**
    - Limit OTP requests per email
    - Limit login attempts per IP
    - Use existing rate limiting infrastructure

6. **Email Security**
    - Never include passwords in emails
    - Use short-lived OTP codes
    - Rate limit email sending
    - Monitor for abuse

## Testing Plan

### Manual Testing

1. **Registration Flow**
    - Visit `/auth/register`
    - Enter email and request OTP
    - Check email for OTP code
    - Enter OTP and verify
    - Enter name and password
    - Verify account creation
    - Verify redirect to login

2. **Login Flow**
    - Visit `/auth/login`
    - Enter credentials
    - Verify successful login
    - Verify redirect to `/json?tab=diff`
    - Check cookie is set

3. **Password Reset Flow**
    - Visit `/auth/reset-password`
    - Enter email and request OTP
    - Check email for OTP code
    - Enter OTP and new password
    - Verify password update
    - Login with new password

4. **Route Protection**
    - Try to access `/profile` without auth
    - Verify redirect to login
    - Login and try again
    - Verify access granted

5. **Security Testing**
    - Try to register with weak password
    - Try to login with wrong password
    - Try to reuse OTP code
    - Try to access protected route without token
    - Try to use expired token

### Automated Testing

- Unit tests for auth utilities
- Integration tests for API routes
- E2E tests for auth flows

## Future Enhancements

- OAuth integration (Google, GitHub)
- Two-factor authentication (TOTP)
- Email change functionality
- Account deletion
- Session management (view active sessions)
- "Remember me" functionality
- Password history enforcement
- Account lockout after failed attempts
- Admin dashboard for user management
- Email template customization
- SMS OTP option
- Progressive profiling

## Rollout Plan

1. **Development**
    - Implement in development environment
    - Test thoroughly with manual testing
    - Verify email delivery with Resend

2. **Staging**
    - Deploy to staging environment
    - Test with real email addresses
    - Verify all flows work end-to-end

3. **Production**
    - Deploy to production
    - Monitor error rates
    - Monitor email delivery rates
    - Gather user feedback

4. **Monitoring**
    - Set up error tracking
    - Monitor authentication success/failure rates
    - Monitor OTP generation and verification rates
    - Monitor email delivery rates

## Documentation Updates

- Update README with auth setup instructions
- Document API endpoints
- Create user guide for auth flows
- Document environment variables
- Create troubleshooting guide
- Update CLAUDE.md with auth context

## Conclusion

This design provides a secure, user-friendly authentication system for the devtools application. It follows industry best practices for password security, OTP verification, and session management while maintaining simplicity and ease of use. The system is designed to be scalable and maintainable, with clear separation of concerns and well-defined interfaces.
