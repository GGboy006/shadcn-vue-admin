import { BASE_URL } from '@/constants/app-config'

export function withBase(path: string): string {
  if (path.startsWith('http') || path.startsWith('data:'))
    return path
  if (path.startsWith('/'))
    return `${BASE_URL}${path.slice(1)}`
  return `${BASE_URL}${path}`
}
