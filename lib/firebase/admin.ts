import admin from 'firebase-admin'

function getPrivateKey(): string | undefined {
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8')
  }
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
}

function getAdminApp() {
  if (admin.apps.length) return admin.apps[0]!
  const privateKey = getPrivateKey()
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  if (!privateKey || !projectId || !clientEmail) {
    if (process.env.NODE_ENV !== 'production') console.warn('Firebase Admin: missing credentials')
    return admin.apps[0] ?? admin.initializeApp()
  }
  return admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) })
}

const app = getAdminApp()
export const adminDb = admin.firestore(app)
export default admin
