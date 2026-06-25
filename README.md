# ApexForge Server

Backend REST API for the **ApexForge** Fitness & Gym Management Platform.

## 🚀 Live URL
_Add your deployed server URL here_

## 📦 NPM Packages Used
| Package | Purpose |
|---|---|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `mongodb` | Native MongoDB driver (Better Auth) |
| `better-auth` | Authentication (email/password + Google OAuth) |
| `jsonwebtoken` | JWT token generation & verification |
| `cookie-parser` | Parse httpOnly cookies |
| `cors` | Cross-Origin Resource Sharing |
| `stripe` | Payment processing |
| `dotenv` | Environment variable management |
| `nodemon` | Dev server hot reload |

## 🔧 Setup

```bash
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

## 🔐 Environment Variables
See `.env.example` for all required variables.

## 🗂️ API Routes
| Route | Description |
|---|---|
| `POST /api/auth/*` | Better Auth (login, register, Google) |
| `POST /api/jwt/token` | Issue JWT after login |
| `POST /api/jwt/logout` | Clear JWT cookie |
| `GET /api/users` | All users (admin) |
| `GET /api/classes` | Browse classes (public, paginated) |
| `GET /api/classes/featured` | Top classes by bookings |
| `POST /api/classes` | Create class (trainer) |
| `GET /api/forum` | Forum posts (public, paginated) |
| `POST /api/forum` | Create post (trainer/admin) |
| `POST /api/payments/create-payment-intent` | Stripe checkout |
| `POST /api/trainers/apply` | Apply as trainer |
| `GET /api/trainers/favorites` | User favorites |
