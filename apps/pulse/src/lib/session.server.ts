import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'
import {
  createSession,
  isSessionValid,
  publicUser,
  readOnly,
  withDb,
  type User,
} from './db.server'

const SESSION_COOKIE =
  process.env.NODE_ENV === 'production' ? '__Host-pulse-session' : 'pulse_session'

export type PublicUser = ReturnType<typeof publicUser>

function cookieFlags() {
  const secure = process.env.NODE_ENV === 'production'
  return [
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    'Max-Age=604800',
  ]
    .filter(Boolean)
    .join('; ')
}

export function setSessionCookie(token: string) {
  setResponseHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; ${cookieFlags()}`)
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production'
  setResponseHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`,
  )
}

export function readSessionToken() {
  const header = getRequestHeader('cookie')
  if (!header) return null

  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq) === SESSION_COOKIE) {
      return part.slice(eq + 1)
    }
  }

  return null
}

export async function getSessionUser(): Promise<PublicUser | null> {
  const token = readSessionToken()
  if (!token) return null

  return readOnly((db) => {
    const session = db.sessions.find((item) => item.id === token)
    if (!isSessionValid(session)) return null
    const user = db.users.find((item) => item.id === session?.userId)
    return user ? publicUser(user) : null
  })
}

export async function issueSession(user: User) {
  const session = createSession(user.id)
  await withDb((db) => {
    db.sessions = db.sessions.filter((item) => item.userId !== user.id)
    db.sessions.push(session)
  })
  setSessionCookie(session.id)
}

export async function destroySession() {
  const token = readSessionToken()
  if (token) {
    await withDb((db) => {
      db.sessions = db.sessions.filter((item) => item.id !== token)
    })
  }
  clearSessionCookie()
}
