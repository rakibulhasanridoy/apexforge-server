import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

let _auth = null

export const initAuth = async () => {
  const mongoClient = new MongoClient(process.env.MONGODB_URI)
  await mongoClient.connect()
  const db = mongoClient.db()

  // IMPORTANT: BETTER_AUTH_URL must be the FRONTEND URL in production.
  // This ensures the Google OAuth callback goes through the Next.js rewrite
  // proxy, keeping cookies on the frontend domain and avoiding cross-origin
  // cookie issues. Set this env var to your frontend Vercel URL.
  const authBaseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000'
  const clientURL   = process.env.CLIENT_URL       || 'http://localhost:3000'
  const isProd      = process.env.NODE_ENV === 'production'

  _auth = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: authBaseURL,
    debug: !isProd,
    trustedOrigins: [
      clientURL,
      process.env.BETTER_AUTH_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
    advanced: {
      useSecureCookies: isProd,
      crossSubDomainCookies: { enabled: false },
      defaultCookieAttributes: {
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        httpOnly: true,
      },
      trustedProxyHeaders: true,
    },
  })

  return _auth
}

export const getAuth = () => {
  if (!_auth) throw new Error('Auth not initialized')
  return _auth
}
