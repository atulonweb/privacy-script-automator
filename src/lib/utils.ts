
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
  // For production with Azure CDN
  // Replace this URL with your actual Azure CDN endpoint
  const cdnBaseUrl = 'https://consentguard.azureedge.net/cdn/cg.js';
  // Or if you set up a custom domain:
  // const cdnBaseUrl = 'https://cdn.consentguard.com/cdn/cg.js';
  
  // For local development/testing, uncomment this:
  // return `${window.location.origin}/cdn/cg.js?id=${scriptId}`;
  
  // Use the Azure CDN URL
  return `${cdnBaseUrl}?id=${scriptId}`;
}
