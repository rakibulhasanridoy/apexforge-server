import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

let _auth = null

export const initAuth = async () => {
  const mongoClient = new MongoClient(process.env.MONGODB_URI)
  await mongoClient.connect()
  const db = mongoClient.db()

  _auth = betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5000',
    trustedOrigins: [
      process.env.CLIENT_URL || 'http://localhost:3000',
    ],
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
  })

  return _auth
}

export const getAuth = () => {
  if (!_auth) throw new Error('Auth not initialized')
  return _auth
}