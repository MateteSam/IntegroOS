import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export const log = (level: LogLevel, message: string, meta?: any) => {
  const ts = new Date().toISOString()
  const entry = { ts, level, message, meta }
  try { const arr = JSON.parse(localStorage.getItem('ai-book-logs') || '[]'); arr.push(entry); localStorage.setItem('ai-book-logs', JSON.stringify(arr).slice(-10000)) } catch {}
  if (level === 'error') console.error(message, meta); else if (level === 'warn') console.warn(message, meta); else if (level === 'debug') console.debug(message, meta); else console.log(message, meta)
}
