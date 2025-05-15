/**
 * Core functionality for ConsentGuard
 */

import { createBanner } from './ui/banner.js';
import { manageCookies } from './cookies.js';
import { addSettingsButton } from './ui/settings-button.js';
import { getSavedPreferences, fetchConfig } from './data.js';
import { recordAnalytics } from './analytics.js';

// Global configuration object
export let config = {
  bannerPosition: 'bottom',
  bannerColor: '#2563eb',
  textColor: '#ffffff',
  buttonColor: '#ffffff',
  buttonTextColor: '#2563eb',
  showPoweredBy: true,
  autoHide: false,
  autoHideTime: 30,
  language: 'en',
  secureFlags: true,
  webhookUrl: '',
  translations: {},
  // Script configuration by category
  scripts: {
    analytics: [
      { 
        id: 'google-analytics', 
        src: "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID",
        async: true
      }
    ],
    advertising: [
      { 
        id: 'facebook-pixel', 
        src: "https://connect.facebook.net/en_US/fbevents.js",
        async: true
      }
    ],
    functional: [],
    social: []
  }
};

// Export the config so other modules can access it
export const setConfig = (newConfig) => {
  config = {
    ...config,
    ...newConfig
  };
  
  // Ensure nested objects like scripts are properly merged
  if (newConfig.scripts) {
    config.scripts = {
      ...config.scripts,
      ...newConfig.scripts
    };
  }
};

/**
 * Initialize the consent manager
 */
export async function init() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
      await initializeConsentManager();
    });
  } else {
    await initializeConsentManager();
  }
}

async function initializeConsentManager() {
  try {
    await fetchConfig();
    const savedPreferences = getSavedPreferences();
    
    if (!savedPreferences) {
      createBanner();
    } else {
      // Reapply saved preferences
      manageCookies(
        savedPreferences.choice, 
        savedPreferences.preferences
      );
      addSettingsButton();
    }
  } catch (error) {
    console.error('ConsentGuard: Failed to initialize', error);
    // Still create the banner with default config
    createBanner();
  }
}
