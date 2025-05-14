
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a CDN URL for the consent script
 * Points to the Azure CDN hosting the script
 */
export function generateCdnUrl(scriptId: string): string {
  // Azure Front Door endpoint
  const cdnBaseUrl = 'https://consentguard-aea4bfcrf8aagkc5.z01.azurefd.net/cg.js';
  
  // For local development/testing, uncomment this:
  // return `${window.location.origin}/cdn/cg.js?id=${scriptId}`;
  
  // Use the Azure CDN URL
  return `${cdnBaseUrl}?id=${scriptId}`;
}
