# ORVANTA FINANCIAL — COMPLETE PROJECT SUMMARY

## PROJECT OVERVIEW

Ye ek **full-stack financial trading platform** hai (Forex & Crypto CFDs) teen projects mein:
- **Server** — Express.js REST API + Prisma ORM + PostgreSQL
- **Admin** — React SPA (Vite) for internal admin panel
- **Client** — Next.js website + client dashboard

---

## 1. TECHNOLOGY STACK

| Project | Tech |
|---------|------|
| Server | Express 5, Prisma 7.8, PostgreSQL, Node.js ESM |
| Admin | React 19, Vite, Tailwind CSS 4, react-router-dom 7, Tabler Icons |
| Client | Next.js 15 (App Router + Turbopack), React 19, Tailwind CSS 4, Recharts, Framer Motion, next-themes |

**No axios** — sab `fetch()` wrapper se hota hai.

---

## 2. DATABASE SCHEMA (Prisma — PostgreSQL)

### Tables:

```
User
├── id (UUID PK)
├── name, email (unique), password (bcrypt 14 rounds)
├── role (enum: SUPER_ADMIN | ADMIN | USER)
├── isVerified, isActive
├── otp, otpExpiry (for email verification)
├── resetToken, resetExpiry (for password reset)
├── failedAttempts, lockedUntil (brute-force lockout)
├── lastLoginAt, lastLoginIp
├── assignedRoleId (FK → Role)  ← RBAC
├── theme (optional custom theme)
└── timestamps

Role
├── id (UUID PK)
├── name (unique slug), displayName, description
├── color (hex, used for dynamic theme)
├── theme (preset: default/dark/light/ocean/forest/sunset)
├── isSystem (Super Admin can't be deleted)
├── pages ← RolePage (many-to-many with permissions)
└── users ← User

Page
├── id (UUID PK)
├── slug (unique), name, description, icon, category
├── isActive
└── roles ← RolePage

RolePage (junction table)
├── roleId (FK → Role)
├── pageId (FK → Page)
├── canView, canCreate, canEdit, canDelete
└── @@unique([roleId, pageId])

ActivityLog
├── id (UUID PK)
├── userId (FK → User)
├── action (string), page (string), details (JSON)
├── ip, userAgent
└── createdAt (indexed)
```

---

## 3. ALL API ENDPOINTS

### Auth (`/api/auth`)

| Method | Endpoint | Kya karta hai | Rate Limit |
|--------|----------|---------------|------------|
| POST | `/register` | Naya user banta hai (ADMIN ya USER role). OTP email pe jaata hai. | 3/hour |
| POST | `/login` | Login with email+password. JWT cookie + token. 5 failed = 30min lock. | 5/15min |
| POST | `/send-otp` | OTP resend karta hai email pe | 3/10min |
| POST | `/verify-otp` | 6-digit OTP verify. User verified ho jaata hai. Welcome email jaata hai. | 3/10min |
| POST | `/forgot-password` | Reset token generate + email. Hamesha "success" dikhata hai (enumeration prevent). | 3/15min |
| POST | `/reset-password` | Token se naya password set. Check: naya password purane se alag hona chahiye. | 5/hr |
| POST | `/logout` | Cookie clear | — |
| GET | `/me` | Current user + assigned role + page permissions return karta hai | — |

**Register flow:**
- Client → `{ name, email, password }` → role = USER
- Admin → `{ name, email, password, role: "ADMIN" }` → role = ADMIN

**Login response includes:**
```json
{
  "user": {
    "id", "name", "email", "role", "isVerified",
    "assignedRole": {
      "id", "name", "displayName", "color", "theme",
      "pages": [
        { "canView": true, "canCreate": true, "canEdit": false, "canDelete": false,
          "page": { "slug": "dashboard", "name": "Dashboard", "icon": "...", "category": "main" } }
      ]
    }
  },
  "token": "jwt..."
}
```

### Roles (`/api/roles`) — SUPER_ADMIN only

| Method | Endpoint | Kya karta hai |
|--------|----------|---------------|
| GET | `/` | Saari roles with page assignments + user counts |
| GET | `/:id` | Single role with pages + assigned users |
| POST | `/` | Naya role create (name, displayName, color, theme) |
| PUT | `/:id` | Role update (system role edit nahi hoti) |
| DELETE | `/:id` | Role delete (system role ya jisme users ho nahi hota) |
| POST | `/:id/pages` | Role ke liye pages assign karo with permissions |

**Page assignment body:**
```json
{
  "pages": [
    { "pageId": "uuid", "canView": true, "canCreate": true, "canEdit": false, "canDelete": false }
  ]
}
```

### Pages (`/api/pages`) — SUPER_ADMIN only

| Method | Endpoint | Kya karta hai |
|--------|----------|---------------|
| GET | `/` | Saari pages with role assignments |
| POST | `/` | Naya page create (slug, name, icon, category) |
| PUT | `/:id` | Page update |
| DELETE | `/:id` | Page delete |
| POST | `/seed` | 12 default pages seed karta hai |

**Default pages:** dashboard, users, roles, pages, activity, settings, reports, wallet, trading, exchange, news, blog

### Admins (`/api/admins`) — SUPER_ADMIN only

| Method | Endpoint | Kya karta hai |
|--------|----------|---------------|
| GET | `/` | Saare admin users (SUPER_ADMIN + ADMIN) |
| POST | `/` | Naya admin create with role assignment |
| PUT | `/:id` | Admin update (SUPER_ADMIN edit nahi hota) |
| POST | `/:id/deactivate` | Admin deactivate |
| POST | `/:id/activate` | Admin activate |
| DELETE | `/:id` | Admin delete (SUPER_ADMIN delete nahi hota) |

### Activity Logs (`/api/activity`) — SUPER_ADMIN only

| Method | Endpoint | Query Params | Kya karta hai |
|--------|----------|-------------|---------------|
| GET | `/` | page, limit, userId, action, startDate, endDate | Paginated activity logs |
| GET | `/stats` | — | Today/week/month counts, top actions, recent activity, active users |
| GET | `/actions` | — | Available action types list |

### Health Check

| GET | `/api/health` | Status, port, env, timestamp |

---

## 4. MIDDLEWARE

| Middleware | Kya karta hai |
|-----------|---------------|
| `authenticate` | JWT verify (cookie ya header se). `req.user` set karta hai. |
| `authorize(...roles)` | Role check. `req.user.role` allowed roles mein hona chahiye. |
| `bruteForceProtection` | IP-based rate limiting. 5 failed = 30min lockout. In-memory Map. |
| `trackActivity(action, page)` | `res.json()` intercept karke auto-log karta hai 2xx responses pe. |
| `logActivity()` | ActivityLog record likhta hai (IP + user-agent ke saath). |

**Global middleware (app.js):**
- Helmet (CSP, HSTS, referrer policy)
- CORS (admin + client + user origins)
- Body parsing (JSON 1mb, URL-encoded, cookie-parser)
- Global rate limiter (100 req/15min per IP)
- Custom headers (X-Frame-Options DENY, X-XSS-Protection, COOP, CORP, Permissions-Policy)

---

## 5. ADMIN PANEL PAGES

| Route | Page | Kya karta hai |
|-------|------|---------------|
| `/login` | Login | Admin login |
| `/register` | Register | Admin registration + OTP verification |
| `/dashboard` | Dashboard | Overview |
| `/dashboard/admins` | Admins | Admin CRUD, activate/deactivate, role assign |
| `/dashboard/roles` | Roles | Role CRUD + "Assign Pages" modal with permission checkboxes |
| `/dashboard/pages` | Pages | Page CRUD + seed defaults |
| `/dashboard/activity` | Activity Logs | Paginated logs with filters (action, date range) |
| `/dashboard/users` | Users | Coming soon |
| `/dashboard/settings` | Settings | Coming soon |

**Sidebar:** Dashboard, Admins, Roles, Pages, Users, Activity Logs, Settings

---

## 6. CLIENT PAGES

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page |
| `/about` | About | Company info |
| `/platform` | Platform | MT5 platform info |
| `/contact` | Contact | Contact form |
| `/blog` | Blog | Blog listing |
| `/login` | Login | Client login |
| `/register` | Register | Client registration + OTP |
| `/forgot-password` | Forgot Password | Email → reset link |
| `/reset-password` | Reset Password | Token → new password |
| `/dashboard` | Dashboard | Trading dashboard (RBAC filtered sidebar) |
| `/dashboard/analytics` | Analytics | Recharts area+bar charts |

---

## 7. RBAC FLOW (Role-Based Access Control)

### How it works end-to-end:

```
1. SUPER_ADMIN creates Roles (Roles page)
   → Name, Display Name, Color, Theme

2. SUPER_ADMIN creates Pages (Pages page)
   → Slug, Name, Icon, Category
   → Ya "Seed Defaults" se 12 pages auto-create

3. SUPER_ADMIN assigns Pages to Roles (Roles → "Assign Pages" button)
   → Toggle checkboxes: View, Create, Edit, Delete per page

4. SUPER_ADMIN creates Admins (Admins page)
   → Assign Role to admin

5. User registers (Client ya Admin register)
   → Role = USER (client) ya ADMIN (admin panel)
   → SUPER_ADMIN manually assigns role via Admins page

6. User logs in → getMe() returns assignedRole with pages

7. Client sidebar filters nav items:
   → const visibleNavItems = allNavItems.filter(item => canView(item.slug))
   → SUPER_ADMIN sees everything (hasPageAccess always returns true)

8. Dynamic theme applies role color:
   → RoleThemeInjector converts hex → oklch CSS variables
   → --brand, --brand-2, --brand-glow, --ring update
```

### SUPER_ADMIN special behavior:
- `hasPageAccess()` always returns full permissions
- Can access all pages, manage all roles/admins
- System roles (Super Admin) can't be deleted

---

## 8. DYNAMIC THEME SYSTEM

```
Role.color (hex) → hexToHsl() → oklch CSS variables
                                    ↓
                         --brand: oklch(0.65 S H)
                         --brand-2: oklch(0.58 S H+10)
                         --brand-glow: oklch(0.78 S H-5)
                         --ring: oklch(0.65 S H)
                                    ↓
                    All Tailwind classes auto-update:
                    bg-brand, text-brand, shadow-brand, etc.
```

Role themes available: default, dark, light, ocean, forest, sunset

---

## 9. SECURITY FEATURES

- bcrypt 14 rounds password hashing
- JWT in httpOnly cookies + localStorage backup
- Dual brute-force protection (IP tracking + account lockout)
- Account locks after 5 failed attempts (30 min)
- Per-route rate limiting (login: 5/15min, register: 3/hr, OTP: 3/10min)
- Email verification (6-digit OTP, 10min expiry)
- Password strength validation (8+ chars, upper, lower, digit, special, no common)
- Helmet security headers (CSP, HSTS, X-Frame-Options DENY)
- CORS whitelist (admin + client + user origins only)
- Activity logging (all admin mutations tracked with IP + user-agent)
- Password reset: new password must differ from current

---

## 10. ENV FILES

### server/.env
```
DATABASE_URL="postgresql://postgres:Ritesh123@localhost:5432/ovantra_financial"
JWT_SECRET="PGCmw/pvoH0J5Z/QM5GBqlzbDZwSCNWL6moGJw6tC+U="
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
ADMIN_URL="http://localhost:5173"
CLIENT_URL="http://localhost:3000"
USER_URL="http://localhost:3001"
BREVO_SMTP_HOST="smtp-relay.brevo.com"
BREVO_SMTP_PORT=587
BREVO_SMTP_USER="your-brevo-login-email@example.com"
BREVO_SMTP_PASS="your-brevo-smtp-key"
BREVO_SENDER_EMAIL="noreply@orvanta.com"
BREVO_SENDER_NAME="ORVANTA Financial"
```

### admin/.env
```
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=ORVANTA Financial
```

### client/.env
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=ORVANTA Financial
```

---

## 11. TEST ACCOUNTS

| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | superadmin@orvanta.com | SuperAdmin@123 |
| ADMIN | admin@orvanta.com | Admin@123 |
| ADMIN | manager@orvanta.com | Manager@123 |
| USER | riteshtest@gmail.com | Ritesh@123 |
| USER | client@orvanta.com | Client@123 |

---

## 12. HOW TO RUN

```bash
# 1. Server (port 4000)
cd server
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js          # Seeds pages, roles, test users
npm run dev                   # Starts on port 4000

# 2. Admin (port 5173)
cd admin
npm install
npm run dev                   # Starts on port 5173

# 3. Client (port 3000)
cd client
npm install
npm run dev                   # Starts on port 3000
```

---

## 13. FILE STRUCTURE

```
D:\ovantra-financial\
├── server/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── prisma.config.ts
│   ├── prisma/
│   │   ├── schema.prisma          ← 5 models (User, Role, Page, RolePage, ActivityLog)
│   │   └── seed.js                ← Seeds 12 pages, 4 roles, 5 test users
│   └── src/
│       ├── server.js               ← Entry point
│       ├── app.js                  ← Express app + middleware + routes
│       ├── config/
│       │   ├── env.js              ← Env var centralization
│       │   ├── db.js               ← PrismaClient (PostgreSQL adapter)
│       │   └── nodemailer.js       ← Brevo SMTP + 3 email templates
│       ├── controllers/
│       │   └── authController.js   ← register, login, OTP, reset, getMe, logout
│       ├── middleware/
│       │   ├── auth.js             ← JWT authenticate + authorize
│       │   ├── bruteForce.js       ← IP tracking + account lockout
│       │   └── activityLog.js      ← Auto-log admin actions
│       ├── routes/
│       │   ├── auth.js             ← /api/auth/*
│       │   ├── roles.js            ← /api/roles/* (SUPER_ADMIN)
│       │   ├── pages.js            ← /api/pages/* (SUPER_ADMIN)
│       │   ├── admin.js            ← /api/admins/* (SUPER_ADMIN)
│       │   └── activity.js         ← /api/activity/* (SUPER_ADMIN)
│       └── utils/
│           └── validation.js       ← Password + email validation
│
├── admin/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                 ← Routes: login, register, dashboard/*
│       ├── config/env.ts
│       ├── context/AuthContext.tsx  ← Auth state + JWT management
│       ├── services/api.ts         ← Fetch wrapper + authAPI
│       ├── layouts/AdminLayout.tsx  ← Sidebar + header
│       └── pages/
│           ├── Login.tsx
│           ├── Register.tsx
│           ├── Dashboard.tsx
│           ├── Roles.tsx           ← Role CRUD + page assignment modal
│           ├── Admins.tsx          ← Admin CRUD + role assign
│           ├── Pages.tsx           ← Page CRUD + seed
│           └── Activity.tsx        ← Paginated activity logs
│
└── client/
    ├── .env
    ├── .gitignore
    ├── package.json
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx          ← Root: AuthProvider + RoleThemeProvider
        │   ├── globals.css         ← CSS variables (brand colors, dark mode)
        │   ├── (main)/             ← Public pages (home, about, platform, contact, blog)
        │   ├── login/page.tsx
        │   ├── register/page.tsx
        │   ├── forgot-password/page.tsx
        │   ├── reset-password/page.tsx
        │   └── dashboard/
        │       ├── layout.tsx      ← DashboardLayout wrapper
        │       ├── page.tsx        ← Client dashboard
        │       └── analytics/page.tsx
        ├── lib/
        │   ├── env.ts
        │   ├── api.ts              ← Fetch wrapper + types (User, AssignedRole, PageAccess)
        │   └── AuthContext.tsx      ← RBAC helpers (canView, canCreate, etc.)
        └── components/
            ├── site/
            │   ├── ThemeProvider.tsx ← RoleThemeProvider (dynamic color injection)
            │   ├── DashboardLayout.tsx ← RBAC-filtered sidebar
            │   ├── Navbar.tsx
            │   └── Footer.tsx
            └── pages/
                ├── ClientLogin.tsx
                ├── ClientRegister.tsx
                ├── ClientDashboard.tsx
                ├── ChartsPage.tsx
                ├── ForgotPassword.tsx
                └── ResetPassword.tsx
```

---

## 14. KEY CONCEPTS FOR NEXT AI

1. **Prisma 7** uses `prisma.config.ts` (not url in schema). Client uses `@prisma/adapter-pg` with `pg.Pool`.

2. **Register endpoint** accepts optional `role` field. If `role: "ADMIN"` → ADMIN, else USER. Admin panel auto-passes `role: "ADMIN"`.

3. **getMe endpoint** returns full `assignedRole` with `pages[]` including permissions. Client uses this for RBAC.

4. **Client RBAC** is frontend-only filtering. Server still protects SUPER_ADMIN routes with `authorize("SUPER_ADMIN")`.

5. **Dynamic theme** works by converting hex color to oklch CSS variables at runtime via `RoleThemeInjector`.

6. **All admin pages** use `/* eslint-disable @typescript-eslint/no-explicit-any */` and `/* eslint-disable react-hooks/set-state-in-effect */` at top.

7. **Brevo SMTP** is used for emails. Credentials are placeholders — user needs to fill real Brevo SMTP key.

8. **No axios anywhere** — all HTTP is native `fetch()` with typed wrappers in `api.ts` files.
