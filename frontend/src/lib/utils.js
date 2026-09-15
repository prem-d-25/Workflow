import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names safely with Tailwind CSS precedence resolution.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
