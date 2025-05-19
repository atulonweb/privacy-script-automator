
/**
 * Data handling for ConsentGuard
 */

import { config, setConfig } from './core.js';
import { cookieCategories } from './categories.js';
import { getCookie } from './cookies.js';
import { recordAnalytics } from './analytics.js';

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
    
    // Record the script load for analytics
    recordAnalytics('view');
    
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
        timestamp: new Date().toISOString(),
        visitorId: getOrCreateVisitorId() // Get the visitor ID for tracking
      })
    });
  } catch (error) {
    console.error('ConsentGuard: Error notifying webhook', error);
  }
}

/**
 * Get or create a unique visitor ID that persists across sessions
 */
function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('cg_visitor_id');
  
  if (!visitorId) {
    visitorId = 'cgv_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cg_visitor_id', visitorId);
  }
  
  return visitorId;
}

/**
 * Generate a simple session identifier to help track unique visitors
 */
function generateSessionId() {
  let sessionId = sessionStorage.getItem('cg_session_id');
  
  if (!sessionId) {
    sessionId = 'cg_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('cg_session_id', sessionId);
  }
  
  return sessionId;
}
