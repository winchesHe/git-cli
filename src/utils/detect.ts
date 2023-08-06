import path from 'node:path'
import { findUp } from 'find-up'

export interface DetectOptions {
  cwd?: string
}

type TupleToUnion<T extends readonly any[]> = T[number]

export const AGENTS = ['npm', 'bun', 'pnpm', 'yarn'] as const

export type Agent = TupleToUnion<typeof AGENTS>

export const agents = AGENTS

// the order here matters, more specific one comes first
export const LOCKS: Record<string, Agent> = {
  'bun.lockb': 'bun',
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
}

export async function detect({ cwd }: DetectOptions = {}) {
  let agent: Agent | null = null
  const lockPath = await findUp(Object.keys(LOCKS), { cwd })

  // detect based on lock
  if (!agent && lockPath)
    agent = LOCKS[path.basename(lockPath)]

  return agent
}
