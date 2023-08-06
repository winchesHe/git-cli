import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export * from './spinner'
export * from './sleep'
export * from './detect'
export * from './color'

export const root = resolve(fileURLToPath(import.meta.url), '../../..')
export const pkgDir = resolve(fileURLToPath(import.meta.url), '../..')
export const resolver = (url: string) => resolve(root, url)
