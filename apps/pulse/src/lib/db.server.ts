import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { hashPassword } from './password.server'

export type User = {
  id: string
  name: string
  email: string
  passwordHash: string
  createdAt: number
}

export type Session = {
  id: string
  userId: string
  expiresAt: number
}

export type Project = {
  id: string
  userId: string
  name: string
  description: string
  createdAt: number
}

export type Task = {
  id: string
  projectId: string
  userId: string
  title: string
  status: 'todo' | 'doing' | 'done'
  createdAt: number
}

export type Database = {
  users: User[]
  sessions: Session[]
  projects: Project[]
  tasks: Task[]
}

const DATA_DIR = path.join(process.cwd(), '.data')
const DATA_FILE = path.join(DATA_DIR, 'pulse.json')
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

let writeQueue: Promise<void> = Promise.resolve()

function emptyDb(): Database {
  return { users: [], sessions: [], projects: [], tasks: [] }
}

export function createId() {
  return crypto.randomUUID()
}

async function readDb(): Promise<Database> {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    return JSON.parse(raw) as Database
  } catch {
    return emptyDb()
  }
}

async function writeDb(db: Database) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf8')
}

export async function withDb<T>(mutator: (db: Database) => Promise<T> | T) {
  const run = writeQueue.then(async () => {
    const db = await ensureSeeded(await readDb())
    const result = await mutator(db)
    await writeDb(db)
    return result
  })
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

export async function readOnly<T>(reader: (db: Database) => Promise<T> | T) {
  const db = await ensureSeeded(await readDb())
  return reader(db)
}

async function ensureSeeded(db: Database): Promise<Database> {
  if (db.users.length > 0) return db

  const userId = createId()
  db.users.push({
    id: userId,
    name: 'Ada Lovelace',
    email: 'ada@pulse.dev',
    passwordHash: await hashPassword('password123'),
    createdAt: Date.now(),
  })

  const websiteId = createId()
  const courseId = createId()
  db.projects.push(
    {
      id: websiteId,
      userId,
      name: 'Marketing site',
      description: 'Public pages, SEO, and the Pulse landing experience.',
      createdAt: Date.now() - 86_400_000,
    },
    {
      id: courseId,
      userId,
      name: 'TanStack Start v2',
      description: 'Course app covering routing, server functions, and auth.',
      createdAt: Date.now() - 43_200_000,
    },
  )
  db.tasks.push(
    {
      id: createId(),
      projectId: websiteId,
      userId,
      title: 'Write homepage copy',
      status: 'done',
      createdAt: Date.now() - 80_000_000,
    },
    {
      id: createId(),
      projectId: websiteId,
      userId,
      title: 'Add SEO meta tags',
      status: 'doing',
      createdAt: Date.now() - 40_000_000,
    },
    {
      id: createId(),
      projectId: courseId,
      userId,
      title: 'Ship server-function CRUD',
      status: 'done',
      createdAt: Date.now() - 20_000_000,
    },
    {
      id: createId(),
      projectId: courseId,
      userId,
      title: 'Add protected dashboard',
      status: 'todo',
      createdAt: Date.now() - 10_000_000,
    },
  )

  await writeDb(db)
  return db
}

export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }
}

export function createSession(userId: string): Session {
  return {
    id: createId(),
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  }
}

export function isSessionValid(session: Session | undefined) {
  return Boolean(session && session.expiresAt > Date.now())
}
