import { resolve } from 'path'
import { fileURLToPath } from 'url'

export const root = resolve(fileURLToPath(import.meta.url), '../../..')
export const pkgDir = resolve(fileURLToPath(import.meta.url), '../..')
export const resolver = (url: string) => resolve(root, url)
