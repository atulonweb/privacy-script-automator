
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a CDN URL for the consent script
 * Points to a valid CDN hosting the script
 */
export function generateCdnUrl(scriptId: string): string {
  // Always use the local environment
  return `${window.location.origin}/lib/cdn/cg.js?id=${scriptId}`;
}
