import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names with conflict resolution.
 *
 * Combines `clsx` (conditional classes, falsy filtering) with `tailwind-merge`
 * (later classes win when conflicting utilities are present).
 *
 * @example
 * cn('px-2 py-2', isActive && 'bg-blue-500', 'p-4') // => 'py-2 p-4 bg-blue-500'
 *
 * @param inputs - Class names or conditional class expressions.
 * @returns The merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
