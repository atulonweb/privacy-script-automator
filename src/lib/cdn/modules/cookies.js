
/**
 * Cookie handling for ConsentGuard
 */

import { config } from './core.js';
import { cookieCategories } from './categories.js';
import { notifyConsentWebhook } from './data.js';
import { loadScriptsByConsent } from './scripts.js';

/**
 * Get cookie by name
 */
export function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

/**
 * Manage cookies based on consent choice
 * @param {string} choice - User's consent choice (accept, reject, partial)
 * @param {object} preferences - Optional preferences for partial consent
 */
export function manageCookies(choice, preferences = null) {
  // Clear any existing consent cookies first
  document.cookie = "consentguard_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "consentguard_preferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  // Set a consent cookie to remember user's choice
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6); // Cookie valid for 6 months
  
  // Build cookie flags
  let cookieFlags = `; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  if (config.secureFlags && window.location.protocol === 'https:') {
    cookieFlags += '; Secure';
  }
  
  document.cookie = `consentguard_consent=${choice}${cookieFlags}`;
  
  // If we have specific preferences, store them too
  if (preferences) {
    const preferencesJson = JSON.stringify(preferences);
    document.cookie = `consentguard_preferences=${encodeURIComponent(preferencesJson)}${cookieFlags}`;
  }
  
  // Prepare preferences object for script loading
  let finalPreferences;
  if (choice === 'accept') {
    // All cookies accepted
    finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: true}), {});
  } else if (choice === 'reject') {
    // Only necessary cookies allowed
    finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: cat.required}), {});
  } else if (choice === 'partial' && preferences) {
    // Use provided preferences
    finalPreferences = preferences;
  } else {
    // Fallback to only necessary cookies
    finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: cat.required}), {});
  }
  
  // Store preferences in a global variable for other scripts to access
  window.ConsentGuardPreferences = finalPreferences;
  
  // Load scripts based on preferences
  loadScriptsByConsent(finalPreferences);
  
  // Notify webhook if configured
  notifyConsentWebhook(choice, finalPreferences);
}
