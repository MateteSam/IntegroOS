import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function log(level: string, message: string, data?: any) {
  if (level === 'error') {
    console.error(`[${level.toUpperCase()}] ${message}`, data !== undefined ? data : '');
  } else if (level === 'warn') {
    console.warn(`[${level.toUpperCase()}] ${message}`, data !== undefined ? data : '');
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, data !== undefined ? data : '');
  }
}
