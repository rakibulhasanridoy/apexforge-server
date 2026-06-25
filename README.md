# ⚡ ApexForge Server — REST API

> Express.js REST API powering the ApexForge Fitness & Gym Management Platform. Handles authentication, class management, bookings, payments, and community forum.

---

## 🌐 Live API URL

🔗 **[https://apexforge-server.vercel.app](https://apexforge-server.vercel.app)**

---

## 📌 Purpose

This is the backend server for ApexForge. It provides secure RESTful API endpoints for user authentication (via Better Auth + JWT), class and booking management, Stripe payment processing, forum operations, and role-based access control for Users, Trainers, and Admins.

---

## 🔗 Related Repositories

- **Client Repository:** [https://github.com/rakibulhasanridoy/apexforge-nextjs](https://github.com/rakibulhasanridoy/apexforge-nextjs)
- **Server Repository:** [https://github.com/rakibulhasanridoy/apexforge-server](https://github.com/rakibulhasanridoy/apexforge-server)

---

## ✨ Key Features

- **Better Auth** integration with Google OAuth and credential-based login
- **JWT Authentication** stored in secure HTTPOnly cookies
- **Role-based middleware** — User, Trainer, Admin route guards
- **MongoDB + Mongoose** for data persistence
- **Stripe** payment intent creation and transaction storage
- **CORS** configured for secure cross-origin requests
- **Lazy initialization** for serverless Vercel deployment
- Clean **RESTful API** structure with modular routes

---

## 📡 API Endpoints Overview

| Route | Description |
|-------|-------------|
| `GET /` | Health check — Welcome message |
| `GET /health` | Server status check |
| `/api/auth/*` | Better Auth (login, register, Google OAuth) |
| `/api/jwt/*` | JWT issue and logout |
| `/api/users/*` | User profile, role management |
| `/api/classes/*` | Class CRUD, featured, search, filter |
| `/api/bookings/*` | Book class, get bookings |
| `/api/forum/*` | Forum posts, likes, comments |
| `/api/payments/*` | Stripe payment intent, transactions |
| `/api/trainers/*` | Trainer applications, approval, management |

---

## 📦 NPM Packages Used

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `better-auth` | Authentication system with Google OAuth |
| `cors` | Cross-Origin Resource Sharing |
| `cookie-parser` | Parse HTTP cookies |
| `dotenv` | Environment variable management |
| `stripe` | Stripe payment processing |
| `jsonwebtoken` | JWT generation and verification |

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `UserProfile` | User role, status, trainer application info |
| `TrainerApplication` | Trainer application with feedback |
| `Class` | Fitness class with status (Pending/Approved) |
| `Booking` | Class bookings linked to user and class |
| `ForumPost` | Community forum posts with likes |
| `Comment` | Nested comments on forum posts |
| `Favorite` | User's saved/favorite classes |
| `Transaction` | Stripe payment records |

---

## 🚀 Run Locally

```bash
# Clone the repo
git clone https://github.com/rakibulhasanridoy/apexforge-server.git
cd apexforge-server

# Install dependencies
npm install

# Create .env and add your variables
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
STRIPE_SECRET_KEY=your_stripe_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Start development server
npm run dev
```

---

## 🧑‍💻 Developer

**Rakibul Hasan Ridoy**
- 🌐 Portfolio: [rakibul-hasan-ridoy.vercel.app](https://rakibul-hasan-ridoy.vercel.app)
- 💼 LinkedIn: [linkedin.com/in/rakibulhasanridoy](https://linkedin.com/in/rakibulhasanridoy)
- 🐙 GitHub: [github.com/rakibulhasanridoy](https://github.com/rakibulhasanridoy)

---

> ⚡ *Engineered for High Performance.*
