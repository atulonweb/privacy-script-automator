
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
  // For development, use the local environment
  if (window.location.hostname === 'localhost' || window.location.hostname.includes('.lovableproject.com')) {
    return `${window.location.origin}/lib/cdn/cg.js?id=${scriptId}`;
  }
  
  // For production, use the Azure Front Door endpoint
  return `https://consentguard-aea4bfcrf8aagkc5.z01.azurefd.net/cg.js?id=${scriptId}`;
}
