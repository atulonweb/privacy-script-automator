
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a CDN URL for the consent script
 * In a production environment, this would point to an actual CDN
 * For development/demo purposes, we're using a local path
 */
export function generateCdnUrl(scriptId: string): string {
  // In production, you'd use your actual CDN domain
  // Example: return `https://cdn.consentguard.com/cg.js?id=${scriptId}`;
  
  // For development/demo purposes, point to the local path
  // This is assuming we're serving the cg.js file from /cdn/cg.js
  return `${window.location.origin}/cdn/cg.js?id=${scriptId}`;
}
