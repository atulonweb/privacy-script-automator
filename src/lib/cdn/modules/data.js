
/**
 * Data handling for ConsentGuard
 */

import { config, setConfig } from './core.js';
import { cookieCategories } from './categories.js';
import { getCookie } from './cookies.js';

// Extract script ID from the current script tag's URL
const scriptElement = document.currentScript || 
  document.querySelector('script[src*="cg.js"]');
const scriptSrc = scriptElement ? scriptElement.src : '';
const url = scriptSrc ? new URL(scriptSrc) : null;

// Script ID for tracking and analytics
export const scriptId = url ? url.searchParams.get('id') : '';

// Check if we're in test mode
export const testMode = url ? url.searchParams.get('testMode') === 'true' : false;

// API endpoint using the Supabase Edge Function
export const API_ENDPOINT = 'https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-config';

/**
 * Fetch configuration from the API
 */
export async function fetchConfig() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_ENDPOINT}?scriptId=${scriptId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch configuration: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Update config with fetched data
    if (data) {
      setConfig(data);
    }
    
    // Log domain activity for analytics
    logDomainActivity().catch(err => console.error('Failed to log activity:', err));
    
    return config;
  } catch (error) {
    console.error('ConsentGuard: Error fetching configuration', error);
    return config; // Return default config on error
  }
}

/**
 * Get saved consent preferences from cookies
 */
export function getSavedPreferences() {
  const consentCookie = getCookie('consentguard_consent');
  const preferencesCookie = getCookie('consentguard_preferences');
  
  if (!consentCookie) return null;
  
  if (consentCookie === 'accept') {
    return { 
      choice: 'accept', 
      preferences: cookieCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
    };
  } else if (consentCookie === 'reject') {
    return { 
      choice: 'reject', 
      preferences: cookieCategories.reduce((acc, cat) => (
        { ...acc, [cat.id]: cat.required }
      ), {})
    };
  } else if (consentCookie === 'partial' && preferencesCookie) {
    try {
      const savedPreferences = JSON.parse(decodeURIComponent(preferencesCookie));
      return { 
        choice: 'partial', 
        preferences: savedPreferences 
      };
    } catch (e) {
      console.error('Error parsing preferences cookie', e);
      return null;
    }
  }
  
  return null;
}

/**
 * Notify webhook about consent changes if configured
 * @param {string} choice - User's consent choice
 * @param {object} preferences - Consent preferences
 */
export async function notifyConsentWebhook(choice, preferences) {
  if (!config.webhookUrl) return;
  
  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scriptId: scriptId,
        choice: choice,
        preferences: preferences,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('ConsentGuard: Error notifying webhook', error);
  }
}

/**
 * Log domain activity for analytics purposes
 * This helps track when a domain was last seen active
 */
async function logDomainActivity() {
  if (testMode) return;
  
  try {
    const domain = window.location.hostname;
    const language = navigator.language || 'en-US';
    
    // Approximate region based on browser language
    // This is a simplification - a real implementation would use IP geolocation
    let region = 'other';
    if (language.includes('en-US') || language.includes('en-CA')) {
      region = 'us';
    } else if (language.match(/^(de|fr|es|it|nl|pt|sv|da|fi|el|cs|et|lv|lt|pl|sk|sl|bg|ro|hr)-?/)) {
      region = 'eu';
    }
    
    await fetch(`${API_ENDPOINT}/activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scriptId: scriptId,
        domain: domain,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        region: region,
        // Browser details to help with unique visitor estimation
        userAgent: navigator.userAgent,
        language: language,
        // Add a simple session identifier
        sessionId: generateSessionId()
      })
    });
  } catch (error) {
    // Silent fail - don't disrupt user experience for analytics
    console.error('ConsentGuard: Error logging domain activity', error);
  }
}

/**
 * Generate a simple session identifier to help track unique visitors
 * A proper implementation would use more robust fingerprinting
 */
function generateSessionId() {
  let sessionId = sessionStorage.getItem('cg_session_id');
  
  if (!sessionId) {
    sessionId = 'cg_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('cg_session_id', sessionId);
  }
  
  return sessionId;
}
