
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
  // For production, use a reliable CDN URL
  // Currently using a placeholder that works for development/testing
  
  // Use the local environment for testing
  return `${window.location.origin}/lib/cdn/cg.js?id=${scriptId}`;
  
  // When deploying to production, uncomment and use your actual CDN:
  // return `https://cdn.consentguard.com/cg.js?id=${scriptId}`;
}
