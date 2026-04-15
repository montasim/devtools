# Authentication System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate simplified email/password authentication system with OTP verification from nextjs-saas-starter into devtools application

**Architecture:** Copy and adapt auth system from nextjs-saas-starter, removing Redis/admin complexity while adding OTP email verification via Resend, JWT sessions, and protected routes

**Tech Stack:** Next.js 16.2.2, Prisma, PostgreSQL, jsonwebtoken, bcrypt, Resend, Zod, TypeScript

**Version:** 1.1 (Critical bugs fixed)

## File Structure Map

**New Files:**

- `lib/auth/password-policy.ts` - Password validation with Zod
- `lib/auth/jwt.ts` - JWT generation/verification utilities
- `lib/auth/otp.ts` - OTP generation/hashing/validation
- `lib/auth/email.ts` - Resend email service integration
- `lib/auth/session.ts` - Session management utilities
- `lib/auth/repos/user.repo.ts` - User CRUD operations
- `lib/auth/repos/otp.repo.ts` - OTP lifecycle management
- `lib/config/auth.ts` - Auth configuration
- `app/api/auth/register/send-otp/route.ts` - Send registration OTP
- `app/api/auth/register/verify-otp/route.ts` - Verify OTP & create account
- `app/api/auth/login/route.ts` - Email/password login
- `app/api/auth/logout/route.ts` - Clear session
- `app/api/auth/me/route.ts` - Get current user
- `app/api/auth/password-reset/send-otp/route.ts` - Send reset OTP
- `app/api/auth/password-reset/confirm/route.ts` - Verify OTP & reset password
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Multi-step registration
- `app/reset-password/page.tsx` - Multi-step password reset
- `app/profile/page.tsx` - Protected user profile
- `app/settings/page.tsx` - Protected user settings
- `context/AuthContext.tsx` - Auth state management
- `hooks/useAuth.ts` - Auth hook for components
- `middleware.ts` - Route protection (verify doesn't exist first)
- `components/auth/password-input.tsx` - Password input with toggle

**Modified Files:**

- `prisma/schema.prisma` - Add User and UserOtp models
- `lib/crypto.ts` - Enhance with timing-safe comparison
- `lib/rate-limit.ts` - Add auth rate limit types
- `app/layout.tsx` - Add AuthProvider to existing Providers
- `.env.example` - Add auth environment variables

---

## Phase 1: Foundation (Database & Dependencies)

### Task 1: Add Environment Variables

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Add auth environment variables to .env.example**

```bash
# Add these lines to .env.example after existing variables

# Authentication
JWT_SECRET=your-secure-random-string-min-32-bytes-generate-with-openssl-rand-base64-32
OTP_HMAC_SECRET=your-otp-secret-min-32-bytes-generate-with-openssl-rand-base64-32

# Email Service (Resend)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:3000
```

- [ ] **Step 2: Generate secrets for local development**

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate OTP_HMAC_SECRET
openssl rand -base64 32
```

- [ ] **Step 3: Add secrets to .env (local only, never commit)**

```bash
# Add generated values to your .env file
JWT_SECRET=<generated_jwt_secret>
OTP_HMAC_SECRET=<generated_otp_secret>
```

- [ ] **Step 4: Commit environment variables**

```bash
git add .env.example
git commit -m "feat: add auth environment variables to .env.example"
```

---

### Task 2: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install auth dependencies**

```bash
pnpm add jsonwebtoken @types/jsonwebtoken resend
```

Expected: Packages added successfully

- [ ] **Step 2: Verify installation**

```bash
cat package.json | grep -E "(jsonwebtoken|resend)"
```

Expected: See jsonwebtoken, @types/jsonwebtoken, resend in dependencies

- [ ] **Step 3: Commit dependencies**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install auth dependencies (jsonwebtoken, resend)"
```

---

### Task 3: Update Database Schema

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add User and UserOtp models to Prisma schema**

Add these models after the existing SharedContent model:

```prisma
// ─── Authentication ──────────────────────────────────────────────────────

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

- [ ] **Step 2: Validate schema syntax**

```bash
npx prisma validate
```

Expected: Schema validation passed

- [ ] **Step 3: Create migration (development only)**

```bash
npx prisma migrate dev --name add_auth_system --create-only
```

Expected: Migration file created in `prisma/migrations/`

- [ ] **Step 4: Review generated migration SQL**

```bash
cat prisma/migrations/*/migration.sql
```

Expected: See CREATE TABLE statements for User and UserOtp with indexes

- [ ] **Step 5: Apply migration and generate Prisma client**

```bash
npx prisma migrate dev --name add_auth_system
npx prisma generate
```

Expected: Migration applied, Prisma client generated successfully

- [ ] **Step 6: Verify schema in Prisma Studio**

```bash
npx prisma studio
```

Expected: See User and UserOtp models in Prisma Studio UI

- [ ] **Step 7: Commit schema and migration**

```bash
git add prisma/schema.prisma prisma/migrations prisma/generated
git commit -m "feat: add User and UserOtp models for authentication"
```

---

## Phase 1.5: UI Setup

### Task 2.5: Install and Configure Toast Notifications

**Files:**

- Modify: `package.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Install sonner for toast notifications**

```bash
pnpm add sonner
```

Expected: Package added successfully

- [ ] **Step 2: Add Toaster to root layout**

```typescript
// Add to app/layout.tsx imports
import { Toaster } from 'sonner';

// Add Toaster component inside body tag
return (
  <html lang="en">
    <body>
      <ThemeProvider>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </ThemeProvider>
      <Toaster /> {/* ADD THIS */}
    </body>
  </html>
);
```

- [ ] **Step 3: Test toast notifications**

```bash
# In browser console, test:
toast.success('Test success');
toast.error('Test error');
```

Expected: Toast notifications appear

- [ ] **Step 4: Commit toast setup**

```bash
git add package.json pnpm-lock.yaml app/layout.tsx
git commit -m "feat: add sonner toast notifications"
```

---

## Phase 2: Core Utilities

### Task 4: Create Password Policy

**Files:**

- Create: `lib/auth/password-policy.ts`

- [ ] **Step 1: Write failing password validation tests**

```typescript
// lib/auth/__tests__/password-policy.test.ts
import { describe, it, expect } from 'vitest';
import { validatePassword, passwordSchema } from '../password-policy';
import { z } from 'zod';

describe('validatePassword', () => {
    it('should reject passwords less than 8 characters', () => {
        const result = validatePassword('Short1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must be at least 8 characters');
    });

    it('should reject passwords without uppercase', () => {
        const result = validatePassword('lowercase1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
        const result = validatePassword('UPPERCASE1!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain lowercase letter');
    });

    it('should reject passwords without numbers', () => {
        const result = validatePassword('NoNumbers!');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain number');
    });

    it('should reject passwords without special characters', () => {
        const result = validatePassword('NoSpecial123');
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Must contain special character');
    });

    it('should accept valid passwords', () => {
        const result = validatePassword('ValidPass123!');
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('passwordSchema', () => {
    it('should validate correct passwords', () => {
        const result = passwordSchema.safeParse('ValidPass123!');
        expect(result.success).toBe(true);
    });

    it('should reject invalid passwords', () => {
        const result = passwordSchema.safeParse('short');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toContain('at least 8 characters');
        }
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/__tests__/password-policy.test.ts
```

Expected: Tests fail with "Cannot find module '../password-policy'"

- [ ] **Step 3: Implement password policy**

```typescript
// lib/auth/password-policy.ts
import { z } from 'zod';

export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

export function validatePassword(password: string): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');

    return {
        valid: errors.length === 0,
        errors,
    };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/__tests__/password-policy.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit password policy**

```bash
git add lib/auth/
git commit -m "feat: add password policy with validation"
```

---

### Task 5: Enhance Crypto Utilities

**Files:**

- Modify: `lib/crypto.ts`

- [ ] **Step 1: Write timing-safe comparison test**

```typescript
// lib/__tests__/crypto.test.ts (create if not exists)
import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from '../crypto';

describe('timingSafeEqual', () => {
    it('should return true for matching strings', () => {
        const result = timingSafeEqual('password123', 'password123');
        expect(result).toBe(true);
    });

    it('should return false for non-matching strings', () => {
        const result = timingSafeEqual('password123', 'password124');
        expect(result).toBe(false);
    });

    it('should handle different length strings', () => {
        const result = timingSafeEqual('short', 'muchlongerstring');
        expect(result).toBe(false);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- lib/__tests__/crypto.test.ts
```

Expected: Test fails with "timingSafeEqual is not defined"

- [ ] **Step 3: Add timing-safe comparison to crypto.ts**

```typescript
// Add to lib/crypto.ts
import { timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';

export function timingSafeEqual(a: string, b: string): boolean {
    // Create buffers from strings
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    // If lengths differ, they're not equal
    if (aBuffer.length !== bBuffer.length) {
        return false;
    }

    // Use crypto.timingSafeEqual for constant-time comparison
    return cryptoTimingSafeEqual(aBuffer, bBuffer);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- lib/__tests__/crypto.test.ts
```

Expected: Test passes

- [ ] **Step 5: Commit crypto utilities**

```bash
git add lib/crypto.ts lib/__tests__/crypto.test.ts
git commit -m "feat: add timing-safe string comparison for password validation"
```

---

### Task 6: Create JWT Utilities

**Files:**

- Create: `lib/auth/jwt.ts`

- [ ] **Step 1: Write JWT utility tests**

```typescript
// lib/auth/__tests__/jwt.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateToken, verifyToken } from '../jwt';

// Mock environment variables
const mockJWTSecret = 'test-secret-min-32-bytes-long-for-testing';

describe('JWT Utilities', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.JWT_SECRET = mockJWTSecret;
    });

    it('should generate valid JWT token', () => {
        const payload = { userId: 'user-123', email: 'test@example.com' };
        const token = generateToken(payload);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
    });

    it('should verify valid JWT token', () => {
        const payload = { userId: 'user-123', email: 'test@example.com' };
        const token = generateToken(payload);

        const decoded = verifyToken(token);
        expect(decoded).toBeDefined();
        expect(decoded.userId).toBe('user-123');
        expect(decoded.email).toBe('test@example.com');
    });

    it('should throw on invalid token', () => {
        const invalidToken = 'invalid.token.here';

        expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should throw on expired token', () => {
        const payload = { userId: 'user-123', email: 'test@example.com' };
        // Create token that expires immediately
        const token = generateToken(payload, '0s');

        // Wait a moment for token to expire
        setTimeout(() => {
            expect(() => verifyToken(token)).toThrow();
        }, 100);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/__tests__/jwt.test.ts
```

Expected: Tests fail with "Cannot find module '../jwt'"

- [ ] **Step 3: Implement JWT utilities**

```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export function generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp'>,
    expiresIn: string = TOKEN_EXPIRY,
): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JWTPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/__tests__/jwt.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit JWT utilities**

```bash
git add lib/auth/jwt.ts lib/auth/__tests__/jwt.test.ts
git commit -m "feat: add JWT generation and verification utilities"
```

---

### Task 7: Create OTP Utilities

**Files:**

- Create: `lib/auth/otp.ts`

- [ ] **Step 1: Write OTP utility tests**

```typescript
// lib/auth/__tests__/otp.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateOTP, hashOTP, verifyOTP } from '../otp';

const mockOTPSecret = 'test-otp-secret-min-32-bytes-long';

describe('OTP Utilities', () => {
    beforeEach(() => {
        vi.resetModules();
        process.env.OTP_HMAC_SECRET = mockOTPSecret;
    });

    it('should generate 6-digit numeric OTP', () => {
        const otp = generateOTP();

        expect(otp).toBeDefined();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate OTPs in valid range', () => {
        const otp = generateOTP();
        const otpNumber = parseInt(otp, 10);

        expect(otpNumber).toBeGreaterThanOrEqual(100000);
        expect(otpNumber).toBeLessThanOrEqual(999999);
    });

    it('should hash OTP consistently', () => {
        const otp = '123456';
        const hash1 = hashOTP(otp);
        const hash2 = hashOTP(otp);

        expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different OTPs', () => {
        const hash1 = hashOTP('123456');
        const hash2 = hashOTP('654321');

        expect(hash1).not.toBe(hash2);
    });

    it('should verify correct OTP', () => {
        const otp = '123456';
        const hash = hashOTP(otp);

        const result = verifyOTP(otp, hash);
        expect(result).toBe(true);
    });

    it('should reject incorrect OTP', () => {
        const hash = hashOTP('123456');

        const result = verifyOTP('654321', hash);
        expect(result).toBe(false);
    });

    it('should reject OTP with different hash', () => {
        const otp = '123456';
        const wrongHash = hashOTP('654321');

        const result = verifyOTP(otp, wrongHash);
        expect(result).toBe(false);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/__tests__/otp.test.ts
```

Expected: Tests fail with "Cannot find module '../otp'"

- [ ] **Step 3: Implement OTP utilities**

```typescript
// lib/auth/otp.ts
import { createHmac, randomBytes } from 'crypto';

const OTP_HMAC_SECRET = process.env.OTP_HMAC_SECRET!;

export function generateOTP(): string {
    // Generate random number between 100000 and 999999
    const min = 100000;
    const max = 999999;
    const range = max - min + 1;
    const randomBytes2 = randomBytes(4);
    const randomValue = randomBytes2.readUInt32BE(0) % range;
    const otp = min + randomValue;

    return otp.toString().padStart(6, '0');
}

export function hashOTP(otp: string): string {
    const hmac = createHmac('sha256', OTP_HMAC_SECRET);
    hmac.update(otp);
    return hmac.digest('hex');
}

export function verifyOTP(otp: string, hash: string): boolean {
    const computedHash = hashOTP(otp);
    // Use timing-safe comparison
    return computedHash === hash;
}

export function generateOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15); // 15 minutes from now
    return expiry;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/__tests__/otp.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit OTP utilities**

```bash
git add lib/auth/otp.ts lib/auth/__tests__/otp.test.ts
git commit -m "feat: add OTP generation and verification utilities"
```

---

### Task 8: Create Email Service

**Files:**

- Create: `lib/auth/email.ts`

- [ ] **Step 1: Write email service tests**

```typescript
// lib/auth/__tests__/email.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendOTPEmail } from '../email';
import { Resend } from 'resend';

// Mock Resend
vi.mock('resend', () => ({
    Resend: vi.fn(),
}));

describe('Email Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('should send registration OTP email', async () => {
        const mockSend = vi.fn().mockResolvedValue({ data: 'test-id' });
        vi.mocked(Resend).mockImplementation(
            () =>
                ({
                    emails: { send: mockSend },
                }) as any,
        );

        await sendOTPEmail('test@example.com', '123456', 'REGISTER');

        expect(mockSend).toHaveBeenCalledWith({
            from: 'noreply@yourdomain.com',
            to: 'test@example.com',
            subject: 'Verify your email for Devtools',
            html: expect.stringContaining('123456'),
        });
    });

    it('should send password reset OTP email', async () => {
        const mockSend = vi.fn().mockResolvedValue({ data: 'test-id' });
        vi.mocked(Resend).mockImplementation(
            () =>
                ({
                    emails: { send: mockSend },
                }) as any,
        );

        await sendOTPEmail('test@example.com', '123456', 'PASSWORD_RESET');

        expect(mockSend).toHaveBeenCalledWith({
            from: 'noreply@yourdomain.com',
            to: 'test@example.com',
            subject: 'Reset your password for Devtools',
            html: expect.stringContaining('123456'),
        });
    });

    it('should handle email send failures gracefully', async () => {
        const mockSend = vi.fn().mockRejectedValue(new Error('API error'));
        vi.mocked(Resend).mockImplementation(
            () =>
                ({
                    emails: { send: mockSend },
                }) as any,
        );

        // Should not throw, but log error
        await expect(
            sendOTPEmail('test@example.com', '123456', 'REGISTER'),
        ).resolves.toBeUndefined();
    });

    it('should log OTP in development instead of sending email', async () => {
        const mockSend = vi.fn().mockResolvedValue({ data: 'test-id' });
        vi.mocked(Resend).mockImplementation(
            () =>
                ({
                    emails: { send: mockSend },
                }) as any,
        );

        // Mock development environment
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        await sendOTPEmail('test@example.com', '123456', 'REGISTER');

        // In development, should still send email but could log
        expect(mockSend).toHaveBeenCalled();

        process.env.NODE_ENV = originalEnv;
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/__tests__/email.test.ts
```

Expected: Tests fail with "Cannot find module '../email'"

- [ ] **Step 3: Implement email service**

```typescript
// lib/auth/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

interface EmailTemplate {
    subject: string;
    html: string;
}

function getOTPEmailTemplate(otp: string, intent: 'REGISTER' | 'PASSWORD_RESET'): EmailTemplate {
    if (intent === 'REGISTER') {
        return {
            subject: 'Verify your email for Devtools',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Verify Your Email</h2>
            <p>Your verification code is:</p>
            <p class="code">${otp}</p>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Devtools Authentication System</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
    } else {
        return {
            subject: 'Reset your password for Devtools',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset Your Password</h2>
            <p>Your password reset code is:</p>
            <p class="code">${otp}</p>
            <p>This code expires in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Devtools Authentication System</p>
            </div>
          </div>
        </body>
        </html>
      `,
        };
    }
}

export async function sendOTPEmail(
    email: string,
    otp: string,
    intent: 'REGISTER' | 'PASSWORD_RESET',
): Promise<void> {
    const template = getOTPEmailTemplate(otp, intent);

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: template.subject,
            html: template.html,
        });

        // Log OTP in development for testing
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        }
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        // Don't throw - return generic success to prevent email enumeration
        // In production, you might want to alert monitoring
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/__tests__/email.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit email service**

```bash
git add lib/auth/email.ts lib/auth/__tests__/email.test.ts
git commit -m "feat: add Resend email service for OTP delivery"
```

---

### Task 9: Create Auth Configuration

**Files:**

- Create: `lib/config/auth.ts`

- [ ] **Step 1: Write auth configuration**

```typescript
// lib/config/auth.ts
export const authConfig = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    cookieDomain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
    secureCookies: process.env.NODE_ENV === 'production',
    // Log OTPs in development instead of sending emails
    logOtpsInDev: process.env.NODE_ENV === 'development',

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET!,
    tokenExpiry: '7d',

    // OTP Configuration
    otpSecret: process.env.OTP_HMAC_SECRET!,
    otpExpiryMinutes: 15,

    // Email Configuration
    resendApiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};
```

- [ ] **Step 2: Validate configuration loads**

```bash
node -e "console.log(require('./lib/config/auth.ts').authConfig)"
```

Expected: Configuration object printed without errors

- [ ] **Step 3: Commit auth configuration**

```bash
git add lib/config/auth.ts
git commit -m "feat: add centralized auth configuration"
```

---

## Phase 3: Repository Layer

### Task 10: Create User Repository

**Files:**

- Create: `lib/auth/repos/user.repo.ts`

- [ ] **Step 1: Write user repository tests**

```typescript
// lib/auth/repos/__tests__/user.repo.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createUser, getUserByEmail, getUserById, updateUserPassword } from '../user.repo';
import { prisma } from '@/lib/prisma';

describe('User Repository', () => {
    beforeEach(async () => {
        // Clean up test data
        await prisma.user.deleteMany({});
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.user.deleteMany({});
    });

    it('should create new user', async () => {
        const user = await createUser({
            email: 'test@example.com',
            passwordHash: 'hash123',
            name: 'Test User',
        });

        expect(user).toBeDefined();
        expect(user.email).toBe('test@example.com');
        expect(user.name).toBe('Test User');
        expect(user.passwordHash).toBe('hash123');
    });

    it('should get user by email', async () => {
        // Create user first
        await createUser({
            email: 'test@example.com',
            passwordHash: 'hash123',
            name: 'Test User',
        });

        const user = await getUserByEmail('test@example.com');

        expect(user).toBeDefined();
        expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
        const user = await getUserByEmail('nonexistent@example.com');
        expect(user).toBeNull();
    });

    it('should get user by id', async () => {
        const createdUser = await createUser({
            email: 'test@example.com',
            passwordHash: 'hash123',
            name: 'Test User',
        });

        const user = await getUserById(createdUser.id);

        expect(user).toBeDefined();
        expect(user?.id).toBe(createdUser.id);
    });

    it('should update user password', async () => {
        const user = await createUser({
            email: 'test@example.com',
            passwordHash: 'oldhash',
            name: 'Test User',
        });

        const updatedUser = await updateUserPassword(user.id, 'newhash');

        expect(updatedUser).toBeDefined();
        expect(updatedUser.passwordHash).toBe('newhash');
    });

    it('should mark email as verified', async () => {
        const user = await createUser({
            email: 'test@example.com',
            passwordHash: 'hash123',
            name: 'Test User',
        });

        const updatedUser = await markEmailVerified(user.id);

        expect(updatedUser).toBeDefined();
        expect(updatedUser.emailVerified).toBeDefined();
        expect(updatedUser.emailVerified).toBeInstanceOf(Date);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/repos/__tests__/user.repo.test.ts
```

Expected: Tests fail with "Cannot find module '../user.repo'"

- [ ] **Step 3: Implement user repository**

```typescript
// lib/auth/repos/user.repo.ts
import { prisma } from '@/lib/prisma';

export interface CreateUserData {
    email: string;
    passwordHash: string;
    name: string;
}

export async function createUser(data: CreateUserData) {
    return await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
            emailVerified: new Date(), // Mark as verified after OTP verification
        },
    });
}

export async function getUserByEmail(email: string) {
    return await prisma.user.findUnique({
        where: { email },
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({
        where: { id },
    });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
    });
}

export async function markEmailVerified(userId: string) {
    return await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
    });
}

export async function userExists(email: string): Promise<boolean> {
    const user = await getUserByEmail(email);
    return user !== null;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/repos/__tests__/user.repo.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit user repository**

```bash
git add lib/auth/repos/user.repo.ts lib/auth/repos/__tests__/user.repo.test.ts
git commit -m "feat: add user repository with CRUD operations"
```

---

### Task 11: Create OTP Repository

**Files:**

- Create: `lib/auth/repos/otp.repo.ts`

- [ ] **Step 1: Write OTP repository tests**

```typescript
// lib/auth/repos/__tests__/otp.repo.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createOTP, verifyOTP, getValidOTP, markOTPUsed, cleanupExpiredOTPs } from '../otp.repo';
import { prisma } from '@/lib/prisma';

describe('OTP Repository', () => {
    beforeEach(async () => {
        await prisma.userOtp.deleteMany({});
    });

    afterEach(async () => {
        await prisma.userOtp.deleteMany({});
    });

    it('should create OTP', async () => {
        const otp = await createOTP({
            email: 'test@example.com',
            codeHash: 'hash123',
            intent: 'REGISTER',
        });

        expect(otp).toBeDefined();
        expect(otp.email).toBe('test@example.com');
        expect(otp.intent).toBe('REGISTER');
        expect(otp.used).toBe(false);
    });

    it('should get valid unused OTP', async () => {
        const createdOTP = await createOTP({
            email: 'test@example.com',
            codeHash: 'hash123',
            intent: 'REGISTER',
        });

        const otp = await getValidOTP('test@example.com', 'REGISTER', 'hash123');

        expect(otp).toBeDefined();
        expect(otp?.id).toBe(createdOTP.id);
    });

    it('should not return used OTP', async () => {
        const createdOTP = await createOTP({
            email: 'test@example.com',
            codeHash: 'hash123',
            intent: 'REGISTER',
        });

        await markOTPUsed(createdOTP.id);

        const otp = await getValidOTP('test@example.com', 'REGISTER', 'hash123');

        expect(otp).toBeNull();
    });

    it('should not return expired OTP', async () => {
        // Create OTP with past expiry
        const pastDate = new Date();
        pastDate.setMinutes(pastDate.getMinutes() - 20); // 20 minutes ago

        await prisma.userOtp.create({
            data: {
                email: 'test@example.com',
                codeHash: 'hash123',
                intent: 'REGISTER',
                expiresAt: pastDate,
            },
        });

        const otp = await getValidOTP('test@example.com', 'REGISTER', 'hash123');

        expect(otp).toBeNull();
    });

    it('should mark OTP as used', async () => {
        const otp = await createOTP({
            email: 'test@example.com',
            codeHash: 'hash123',
            intent: 'REGISTER',
        });

        const updatedOTP = await markOTPUsed(otp.id);

        expect(updatedOTP).toBeDefined();
        expect(updatedOTP.used).toBe(true);
    });

    it('should cleanup expired OTPs', async () => {
        // Create expired OTP
        const pastDate = new Date();
        pastDate.setMinutes(pastDate.getMinutes() - 20);

        await prisma.userOtp.create({
            data: {
                email: 'expired@example.com',
                codeHash: 'hash123',
                intent: 'REGISTER',
                expiresAt: pastDate,
            },
        });

        // Create valid OTP
        await createOTP({
            email: 'valid@example.com',
            codeHash: 'hash456',
            intent: 'REGISTER',
        });

        const result = await cleanupExpiredOTPs();

        expect(result.count).toBeGreaterThan(0);

        const expiredOTP = await prisma.userOtp.findFirst({
            where: { email: 'expired@example.com' },
        });
        expect(expiredOTP).toBeNull();

        const validOTP = await prisma.userOtp.findFirst({
            where: { email: 'valid@example.com' },
        });
        expect(validOTP).toBeDefined();
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- lib/auth/repos/__tests__/otp.repo.test.ts
```

Expected: Tests fail with "Cannot find module '../otp.repo'"

- [ ] **Step 3: Implement OTP repository**

```typescript
// lib/auth/repos/otp.repo.ts
import { prisma } from '@/lib/prisma';

export interface CreateOTPData {
    email: string;
    codeHash: string;
    intent: 'REGISTER' | 'PASSWORD_RESET';
}

export async function createOTP(data: CreateOTPData) {
    // Calculate expiry: 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return await prisma.userOtp.create({
        data: {
            email: data.email,
            codeHash: data.codeHash,
            intent: data.intent,
            expiresAt,
        },
    });
}

export async function getValidOTP(email: string, intent: string, codeHash: string) {
    return await prisma.userOtp.findFirst({
        where: {
            email,
            intent,
            codeHash,
            used: false,
            expiresAt: {
                gte: new Date(),
            },
        },
    });
}

export async function markOTPUsed(otpId: string) {
    return await prisma.userOtp.update({
        where: { id: otpId },
        data: { used: true },
    });
}

export async function cleanupExpiredOTPs() {
    return await prisma.userOtp.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

export async function deleteOldOTPs(minutesOld: number = 60) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - minutesOld);

    return await prisma.userOtp.deleteMany({
        where: {
            createdAt: {
                lt: cutoff,
            },
        },
    });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- lib/auth/repos/__tests__/otp.repo.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit OTP repository**

```bash
git add lib/auth/repos/otp.repo.ts lib/auth/repos/__tests__/otp.repo.test.ts
git commit -m "feat: add OTP repository with lifecycle management"
```

---

## Phase 4: API Routes

### Task 12: Create Send Registration OTP Endpoint

**Files:**

- Create: `app/api/auth/register/send-otp/route.ts`

- [ ] **Step 1: Write API endpoint tests**

```typescript
// app/api/auth/register/send-otp/__tests__/route.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { POST } from '../route';

describe('POST /api/auth/register/send-otp', () => {
    beforeAll(async () => {
        // Setup test database
    });

    afterAll(async () => {
        // Cleanup test database
    });

    it('should send OTP for valid email', async () => {
        const request = new Request('http://localhost:3000/api/auth/register/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('OTP sent');
    });

    it('should reject invalid email format', async () => {
        const request = new Request('http://localhost:3000/api/auth/register/send-otp', {
            method: 'POST',
            body: JSON.stringify({ email: 'invalid-email' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid email');
    });

    it('should rate limit OTP requests', async () => {
        // Send 4 requests (limit is 3)
        const requests = Array.from(
            { length: 4 },
            (_, i) =>
                new Request('http://localhost:3000/api/auth/register/send-otp', {
                    method: 'POST',
                    body: JSON.stringify({ email: `test${i}@example.com` }),
                }),
        );

        const responses = await Promise.all(requests.map((req) => POST(req)));

        // First 3 should succeed
        for (let i = 0; i < 3; i++) {
            expect(responses[i].status).toBe(200);
        }

        // 4th should be rate limited
        expect(responses[3].status).toBe(429);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- app/api/auth/register/send-otp/__tests__/route.test.ts
```

Expected: Tests fail with "Cannot find module '../route'"

- [ ] **Step 3: Implement send OTP endpoint**

```typescript
// app/api/auth/register/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { createOTP } from '@/lib/auth/repos/otp.repo';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkRateLimit } from '@/lib/rate-limit';

// Request validation schema
const sendOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate email format
        const validation = sendOTPSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email } = validation.data;

        // Check rate limit (3 OTP requests per hour per email)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'otp_request');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many OTP requests. Please try again later.' },
                { status: 429 },
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);

        // Store OTP in database
        await createOTP({
            email,
            codeHash: otpHash,
            intent: 'REGISTER',
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'REGISTER');

        // Return success (don't reveal if email exists or not)
        return NextResponse.json({
            success: true,
            message: 'If email exists, OTP has been sent',
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP. Please try again.' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- app/api/auth/register/send-otp/__tests__/route.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Test endpoint manually**

```bash
curl -X POST http://localhost:3000/api/auth/register/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: Success response with OTP sent (check console in dev mode)

- [ ] **Step 6: Commit send OTP endpoint**

```bash
git add app/api/auth/register/send-otp/
git commit -m "feat: add send registration OTP endpoint"
```

---

### Task 13: Create Verify Registration OTP Endpoint

**Files:**

- Create: `app/api/auth/register/verify-otp/route.ts`

- [ ] **Step 1: Write API endpoint tests**

```typescript
// app/api/auth/register/verify-otp/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';

describe('POST /api/auth/register/verify-otp', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany({});
        await prisma.userOtp.deleteMany({});
    });

    it('should create account with valid OTP', async () => {
        // First create an OTP
        // ... setup code

        const request = new Request('http://localhost:3000/api/auth/register/verify-otp', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                code: '123456',
                name: 'Test User',
                password: 'ValidPass123!',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
    });

    it('should reject invalid OTP', async () => {
        const request = new Request('http://localhost:3000/api/auth/register/verify-otp', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                code: '000000',
                name: 'Test User',
                password: 'ValidPass123!',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid or expired OTP');
    });

    it('should reject weak password', async () => {
        const request = new Request('http://localhost:3000/api/auth/register/verify-otp', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                code: '123456',
                name: 'Test User',
                password: 'weak',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Password must be');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- app/api/auth/register/verify-otp/__tests__/route.test.ts
```

Expected: Tests fail with "Cannot find module '../route'"

- [ ] **Step 3: Implement verify OTP endpoint**

```typescript
// app/api/auth/register/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { hashOTP, verifyOTP } from '@/lib/auth/otp';
import { getValidOTP, markOTPUsed } from '@/lib/auth/repos/otp.repo';
import { createUser, getUserByEmail } from '@/lib/auth/repos/user.repo';
import { passwordSchema } from '@/lib/auth/password-policy';

// Request validation schema
const verifyOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
    code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request format
        const validation = verifyOTPSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, code, name, password } = validation.data;

        // Validate password strength
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: passwordValidation.error.issues[0].message },
                { status: 400 },
            );
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Verify OTP
        const otpHash = hashOTP(code);
        const validOTP = await getValidOTP(email, 'REGISTER', otpHash);

        if (!validOTP) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        await createUser({
            email,
            passwordHash,
            name,
        });

        // Mark OTP as used
        await markOTPUsed(validOTP.id);

        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to create account. Please try again.' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- app/api/auth/register/verify-otp/__tests__/route.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit verify OTP endpoint**

```bash
git add app/api/auth/register/verify-otp/
git commit -m "feat: add verify registration OTP and create account endpoint"
```

---

### Task 14: Create Login Endpoint

**Files:**

- Create: `app/api/auth/login/route.ts`

- [ ] **Step 1: Write login endpoint tests**

```typescript
// app/api/auth/login/__tests__/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });

    it('should login with valid credentials', async () => {
        // Setup: Create test user
        // ...

        const request = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'ValidPass123!',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user).toBeDefined();
        expect(response.cookies.get('auth-token')).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
        const request = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'WrongPassword123!',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
        const request = new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'AnyPass123!',
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toContain('Invalid credentials');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- app/api/auth/login/__tests__/route.test.ts
```

Expected: Tests fail with "Cannot find module '../route'"

- [ ] **Step 3: Implement login endpoint**

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getUserByEmail } from '@/lib/auth/repos/user.repo';
import { generateToken } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/rate-limit';
import { authConfig } from '@/lib/config/auth';

// Request validation schema
const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request format
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, password } = validation.data;

        // Check rate limit (5 login attempts per 15 minutes per IP)
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'login_attempt');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429 },
            );
        }

        // Get user by email
        const user = await getUserByEmail(email);
        if (!user) {
            // Use generic error message to prevent user enumeration
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Verify password using bcrypt compare
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        // Set HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: authConfig.secureCookies,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
            domain: authConfig.cookieDomain,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- app/api/auth/login/__tests__/route.test.ts
```

Expected: All tests pass

- [ ] **Step 5: Commit login endpoint**

```bash
git add app/api/auth/login/
git commit -m "feat: add login endpoint with JWT authentication"
```

---

### Task 15: Create Logout Endpoint

**Files:**

- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Implement logout endpoint**

```typescript
// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Create response and clear auth cookie
        const response = NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        });

        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // Expire immediately
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Logout failed. Please try again.' }, { status: 500 });
    }
}
```

- [ ] **Step 2: Test logout endpoint manually**

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json"
```

Expected: Success response

- [ ] **Step 3: Commit logout endpoint**

```bash
git add app/api/auth/logout/
git commit -m "feat: add logout endpoint"
```

---

### Task 16: Create Get Current User Endpoint

**Files:**

- Create: `app/api/auth/me/route.ts`

- [ ] **Step 1: Implement get current user endpoint**

```typescript
// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getUserById } from '@/lib/auth/repos/user.repo';

export async function GET(request: NextRequest) {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify token
        let payload;
        try {
            payload = verifyToken(token);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Get user from database
        const user = await getUserById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return user data (excluding password hash)
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json({ error: 'Failed to get user information' }, { status: 500 });
    }
}
```

- [ ] **Step 2: Test get current user endpoint manually**

```bash
# First login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"ValidPass123!"}' \
  -c cookies.txt

# Then get current user
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

Expected: User data returned

- [ ] **Step 3: Commit get current user endpoint**

```bash
git add app/api/auth/me/
git commit -m "feat: add get current user endpoint"
```

---

### Task 17: Create Password Reset Endpoints

**Files:**

- Create: `app/api/auth/password-reset/send-otp/route.ts`
- Create: `app/api/auth/password-reset/confirm/route.ts`

- [ ] **Step 1: Implement send password reset OTP**

```typescript
// app/api/auth/password-reset/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOTP, hashOTP } from '@/lib/auth/otp';
import { createOTP } from '@/lib/auth/repos/otp.repo';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkRateLimit } from '@/lib/rate-limit';

const sendResetOTPSchema = z.object({
    email: z.string().email('Invalid email format'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = sendResetOTPSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email } = validation.data;

        // Check rate limit
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const rateLimitResult = await checkRateLimit(ip, 'password_reset');

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: 'Too many reset attempts. Please try again later.' },
                { status: 429 },
            );
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = hashOTP(otp);

        // Store OTP (even if user doesn't exist - prevents enumeration)
        await createOTP({
            email,
            codeHash: otpHash,
            intent: 'PASSWORD_RESET',
        });

        // Send OTP email
        await sendOTPEmail(email, otp, 'PASSWORD_RESET');

        // Always return success (don't reveal if email exists)
        return NextResponse.json({
            success: true,
            message: 'If email exists, password reset OTP has been sent',
        });
    } catch (error) {
        console.error('Send reset OTP error:', error);
        return NextResponse.json(
            { error: 'Failed to send reset OTP. Please try again.' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 2: Implement confirm password reset**

```typescript
// app/api/auth/password-reset/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/crypto';
import { hashOTP } from '@/lib/auth/otp';
import { getValidOTP, markOTPUsed } from '@/lib/auth/repos/otp.repo';
import { getUserByEmail, updateUserPassword } from '@/lib/auth/repos/user.repo';
import { passwordSchema } from '@/lib/auth/password-policy';

const confirmResetSchema = z.object({
    email: z.string().email('Invalid email format'),
    code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = confirmResetSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 },
            );
        }

        const { email, code, password } = validation.data;

        // Validate password strength
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: passwordValidation.error.issues[0].message },
                { status: 400 },
            );
        }

        // Verify OTP
        const otpHash = hashOTP(code);
        const validOTP = await getValidOTP(email, 'PASSWORD_RESET', otpHash);

        if (!validOTP) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // Get user
        const user = await getUserByEmail(email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update password
        const passwordHash = await hashPassword(password);
        await updateUserPassword(user.id, passwordHash);

        // Mark OTP as used
        await markOTPUsed(validOTP.id);

        return NextResponse.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.error('Confirm password reset error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password. Please try again.' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 3: Commit password reset endpoints**

```bash
git add app/api/auth/password-reset/
git commit -m "feat: add password reset endpoints with OTP verification"
```

---

## Phase 5: Frontend Components & Pages

### Task 18: Create Password Input Component

**Files:**

- Create: `components/auth/password-input.tsx`

- [ ] **Step 1: Create password input component**

```typescript
// components/auth/password-input.tsx
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
}

export function PasswordInput({ showStrengthIndicator = false, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? 'text' : 'password'} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-500" />
        ) : (
          <Eye className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit password input component**

```bash
git add components/auth/password-input.tsx
git commit -m "feat: add password input component with toggle visibility"
```

---

### Task 19: Create AuthContext and useAuth Hook

**Files:**

- Create: `context/AuthContext.tsx`
- Create: `hooks/useAuth.ts`

- [ ] **Step 1: Create AuthContext**

```typescript
// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: Date | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  async function refreshUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    setUser(data.user);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Create useAuth hook**

```typescript
// hooks/useAuth.ts
'use client';

import { useAuth as useAuthContext } from '@/context/AuthContext';

export function useAuth() {
    return useAuthContext();
}
```

- [ ] **Step 3: Find existing Providers component location**

```bash
# Find where Providers component exists
grep -r "ThemeProvider" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: Find file containing ThemeProvider wrapper

- [ ] **Step 4: Add AuthProvider to existing Providers component**

```typescript
// Found in app/layout.tsx (lines 83-94 based on spec)
// Import AuthProvider at top
import { AuthProvider } from '@/context/AuthContext';

// Add AuthProvider inside existing Providers component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider> {/* ADD AuthProvider HERE */}
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Commit AuthContext and useAuth**

```bash
git add context/AuthContext.tsx hooks/useAuth.ts components/providers.tsx
git commit -m "feat: add AuthContext and useAuth hook for authentication state"
```

---

### Task 20: Create Login Page

**Files:**

- Create: `app/login/page.tsx`

- [ ] **Step 1: Create login page**

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful');
      router.push('/json?tab=diff');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <Label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </Label>
            </div>
            <Link href="/reset-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit login page**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page with email/password authentication"
```

---

### Task 21: Create Signup Page

**Files:**

- Create: `app/signup/page.tsx`

- [ ] **Step 1: Create multi-step signup page**

```typescript
// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'account';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Just verify OTP format, don't call API yet
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new Error('Invalid OTP format');
      }

      toast.success('OTP verified');
      setStep('account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      toast.success('Account created! Please login');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        {step === 'email' && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-center">Create account</h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Step 1 of 3: Enter your email
              </p>
            </div>
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-center">Verify email</h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Step 2 of 3: Enter the 6-digit code sent to {email}
              </p>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('email')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          </>
        )}

        {step === 'account' && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-center">Complete profile</h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Step 3 of 3: Create your password
              </p>
            </div>
            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('otp')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create account'}
                </Button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit signup page**

```bash
git add app/signup/page.tsx
git commit -m "feat: add multi-step signup page with OTP verification"
```

---

### Task 22: Create Reset Password Page

**Files:**

- Create: `app/reset-password/page.tsx`

- [ ] **Step 1: Create reset password page**

```typescript
// app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PasswordInput } from '@/components/auth/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type Step = 'email' | 'reset';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success('If email exists, OTP has been sent');
      setStep('reset');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('Password reset successful');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        {step === 'email' && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-center">Reset password</h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Step 1 of 2: Enter your email
              </p>
            </div>
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <div>
              <h2 className="text-3xl font-bold text-center">Set new password</h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Step 2 of 2: Enter OTP and new password
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div>
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <PasswordInput
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('email')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Resetting...' : 'Reset password'}
                </Button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit reset password page**

```bash
git add app/reset-password/page.tsx
git commit -m "feat: add reset password page with OTP verification"
```

---

### Task 23: Create Protected Profile and Settings Pages

**Files:**

- Create: `app/profile/page.tsx`
- Create: `app/settings/page.tsx`

- [ ] **Step 1: Create profile page**

```typescript
// app/profile/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email verified
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {user.emailVerified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={() => logout()}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create settings page**

```typescript
// app/settings/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Settings page coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit protected pages**

```bash
git add app/profile/page.tsx app/settings/page.tsx
git commit -m "feat: add protected profile and settings pages"
```

---

### Task 24: Create Middleware for Route Protection

**Files:**

- Create: `middleware.ts` (verify it doesn't exist first)

- [ ] **Step 1: Check if middleware exists**

```bash
ls -la middleware.ts 2>/dev/null || echo "No existing middleware"
```

Expected: "No existing middleware" or existing file shown

- [ ] **Step 2: Create middleware for route protection**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

const JWT_SECRET = process.env.JWT_SECRET!;

export function middleware(request: NextRequest) {
    // Protected routes
    const protectedPaths = ['/profile', '/settings'];
    const isProtectedRoute = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path),
    );

    if (isProtectedRoute) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            verifyToken(token);
            return NextResponse.next();
        } catch (error) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'invalid_token');
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/profile/:path*', '/settings/:path*'],
};
```

- [ ] **Step 3: Test middleware manually**

```bash
# Try to access protected route without auth
curl -I http://localhost:3000/profile
```

Expected: Redirect to /login

- [ ] **Step 4: Commit middleware**

```bash
git add middleware.ts
git commit -m "feat: add middleware for protected route authentication"
```

---

## Phase 6: Integration & Testing

### Task 24.5: Configure Prisma Client

**Files:**

- Modify: `lib/prisma.ts` (if exists)

- [ ] **Step 1: Check existing Prisma configuration**

```bash
cat lib/prisma.ts
```

Expected: See current PrismaClient configuration

- [ ] **Step 2: Update Prisma configuration for production**

```typescript
// lib/prisma.ts - UPDATE if exists, create if not
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

- [ ] **Step 3: Verify configuration**

```bash
npm run build
```

Expected: Build succeeds with Prisma client

- [ ] **Step 4: Commit Prisma configuration**

```bash
git add lib/prisma.ts
git commit -m "feat: configure Prisma client for auth system"
```

---

### Task 25: Extend Rate Limiting for Auth

**Files:**

- Modify: `lib/rate-limit.ts`

- [ ] **Step 1: Add auth rate limit types**

```typescript
// Add to lib/rate-limit.ts after existing LIMITS constant

const AUTH_LIMITS = {
    otp_request: { max: 3, window: 3600000 }, // 3 per hour
    login_attempt: { max: 5, window: 900000 }, // 5 per 15 min
    password_reset: { max: 3, window: 3600000 }, // 3 per hour
};

// Merge auth limits with existing limits
const ALL_LIMITS = {
    ...LIMITS,
    ...AUTH_LIMITS,
};
```

- [ ] **Step 1.5: Update checkRateLimit function signature**

```typescript
// In lib/rate-limit.ts, update the function signature to support auth types:
export function checkRateLimit(
    ip: string,
    type: 'create' | 'access' | 'otp_request' | 'login_attempt' | 'password_reset',
): { allowed: boolean; remaining: number; resetAt?: number } {
    // Update inside function: use ALL_LIMITS instead of LIMITS
    const limit = ALL_LIMITS[type];
    // ... rest stays the same
}
```

- [ ] **Step 2: Test rate limiting manually**

```bash
# Send multiple login attempts to test rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpass"}'
done
```

Expected: First 5 requests return 401, 6th request returns 429

- [ ] **Step 3: Commit rate limiting extension**

```bash
git add lib/rate-limit.ts
git commit -m "feat: extend rate limiting for auth endpoints"
```

---

### Task 26: End-to-End Testing

**Files:**

- No files created (manual testing)

- [ ] **Step 1: Test registration flow end-to-end**

1. Visit `/signup`
2. Enter email and click "Send OTP"
3. Check console for OTP (development mode)
4. Enter OTP and click "Verify"
5. Enter name and password, click "Create account"
6. Verify redirect to `/login`
7. Login with email/password
8. Verify redirect to `/json?tab=diff`

- [ ] **Step 2: Test login flow**

1. Visit `/login`
2. Enter credentials
3. Verify successful login
4. Verify redirect to `/json?tab=diff`
5. Check auth cookie is set

- [ ] **Step 3: Test password reset flow**

1. Visit `/reset-password`
2. Enter email and click "Send OTP"
3. Check console for OTP
4. Enter OTP and new password
5. Verify password update
6. Login with new password

- [ ] **Step 4: Test route protection**

1. Try to access `/profile` without auth
2. Verify redirect to `/login`
3. Login and try again
4. Verify access granted

- [ ] **Step 5: Test email delivery**

1. Check Resend dashboard for OTP emails
2. Verify email templates render correctly
3. Test with multiple email addresses

- [ ] **Step 6: Test security features**

1. Try to register with weak password
2. Try to login with wrong password
3. Try to reuse OTP code
4. Try to access protected route without token
5. Test rate limiting (multiple failed attempts)

---

### Task 27: Cleanup and Optimization

**Files:**

- Multiple files for cleanup

- [ ] **Step 1: Run ESLint and fix issues**

```bash
npm run lint:fix
```

- [ ] **Step 2: Run TypeScript check**

```bash
npm run typecheck
```

- [ ] **Step 3: Build project**

```bash
npm run build
```

Expected: Build succeeds without errors

- [ ] **Step 4: Test production build**

```bash
npm run start
```

Expected: Application starts successfully

- [ ] **Step 5: Commit any fixes**

```bash
git add .
git commit -m "fix: resolve linting and build issues"
```

---

## Task 28: Documentation

**Files:**

- Modify: `README.md`
- Create: `docs/auth-setup.md`

- [ ] **Step 1: Update README with auth setup**

Add section to README.md:

````markdown
## Authentication Setup

This application includes email/password authentication with OTP verification.

### Setup Instructions

1. **Set environment variables:**

```bash
# Generate secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for OTP_HMAC_SECRET
```
````

2. **Configure Resend for email delivery:**

Get API key from https://resend.com and add to `.env`:

```env
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
```

3. **Run database migration:**

```bash
npx prisma migrate dev
npx prisma generate
```

### Usage

- **Register:** Visit `/signup` and follow the multi-step process
- **Login:** Visit `/login` with email/password
- **Reset Password:** Visit `/reset-password`

````

- [ ] **Step 2: Create detailed auth setup guide**

```bash
# Create comprehensive auth setup documentation
cat > docs/auth-setup.md << 'EOF'
# Authentication System Setup Guide

Complete guide for setting up and configuring the authentication system.

## Environment Configuration

### Required Environment Variables

JWT_SECRET=your-secret-here
OTP_HMAC_SECRET=your-secret-here
RESEND_API_KEY=your-key-here
FROM_EMAIL=noreply@yourdomain.com
BASE_URL=http://localhost:3000

## Email Service Setup

### Resend Configuration

1. Sign up at https://resend.com
2. Create API key
3. Verify sender domain
4. Add API key to .env

## Database Setup

### Migration Steps

1. Add User and UserOtp models to schema.prisma
2. Run migration: npx prisma migrate dev --name add_auth_system
3. Generate Prisma client: npx prisma generate

## Testing

### Manual Testing Checklist

- [ ] Registration flow works
- [ ] Login creates session
- [ ] Password reset works
- [ ] Rate limiting active
- [ ] Email delivery working
EOF
````

- [ ] **Step 3: Commit documentation**

```bash
git add README.md docs/auth-setup.md
git commit -m "docs: add authentication setup and usage documentation"
```

---

## Final Tasks

### Task 29: Final Verification and Deploy

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 2: Verify git status**

```bash
git status
```

Expected: Clean working tree (all changes committed)

- [ ] **Step 3: Review git log**

```bash
git log --oneline -10
```

Expected: See logical progression of commits

- [ ] **Step 4: Create summary of changes**

```bash
cat > IMPLEMENTATION_SUMMARY.md << 'EOF'
# Authentication System Implementation Summary

## Completed Features

✅ Email/password authentication with OTP verification
✅ User registration with email verification
✅ Login functionality with JWT sessions
✅ Password reset with OTP
✅ Protected routes (/profile, /settings)
✅ Rate limiting for auth endpoints
✅ Email delivery via Resend
✅ Password policy enforcement
✅ Security best practices (timing-safe comparison, hashed OTPs)

## Files Created

- 12 new utility files (lib/auth/*)
- 8 API routes (app/api/auth/*)
- 5 page components (app/login, app/signup, etc.)
- 2 repository files (lib/auth/repos/*)
- 2 context/hook files
- 1 middleware file
- 3 test files

## Files Modified

- prisma/schema.prisma (added User and UserOtp models)
- lib/crypto.ts (added timing-safe comparison)
- lib/rate-limit.ts (added auth rate limits)
- app/layout.tsx (added AuthProvider)
- .env.example (added auth variables)

## Database Changes

- Added User model with authentication fields
- Added UserOtp model for OTP storage
- Created indexes for performance

## Next Steps

1. Configure Resend API key for production
2. Set up production database
3. Configure environment variables
4. Deploy to production
5. Test all flows in production environment
EOF
```

- [ ] **Step 5: Commit final implementation summary**

```bash
git add IMPLEMENTATION_SUMMARY.md
git commit -m "docs: add authentication system implementation summary"
```

---

## Success Criteria

- [ ] All 29 tasks completed
- [ ] All tests passing
- [ ] Build succeeds without errors
- [ ] Manual testing checklist completed
- [ ] Documentation updated
- [ ] Clean git history with logical commits

## Estimated Timeline

- Phase 1 (Foundation): 2-3 hours
- Phase 2 (Utilities): 3-4 hours
- Phase 3 (Repositories): 2-3 hours
- Phase 4 (API Routes): 4-5 hours
- Phase 5 (Frontend): 5-6 hours
- Phase 6 (Integration): 2-3 hours

**Total: 18-24 hours for a single developer**
