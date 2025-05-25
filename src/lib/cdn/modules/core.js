/**
 * Core functionality for ConsentGuard
 */

import { createBanner } from './ui/banner.js';
import { manageCookies } from './cookies.js';
import { addSettingsButton } from './ui/settings-button.js';
import { getSavedPreferences, fetchConfig } from './data.js';
import { recordAnalytics } from './analytics.js';
import { loadGoogleAnalyticsScriptsEarly } from './scripts.js';

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
  // Script configuration by category - these are PLACEHOLDER examples
  // and must be replaced with actual script configuration
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

  console.log('ConsentGuard: Configuration updated', config);
};

/**
 * Initialize the consent manager
 */
export async function init() {
  console.log('ConsentGuard: Initializing...');
  
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
      await initializeConsentManager();
    });
  } else {
    await initializeConsentManager();
  }
}

/**
 * Initialize Google Analytics with proper consent defaults before other initialization
 */
function initializeGoogleAnalyticsDefaults() {
  // Look for Google Analytics scripts in configuration with improved detection
  const allScripts = [
    ...(config.scripts?.analytics || []),
    ...(config.scripts?.advertising || []),
    ...(config.scripts?.functional || []),
    ...(config.scripts?.social || [])
  ];
  
  const hasGoogleAnalytics = allScripts.some(script => 
    (script.id && script.id.includes('google-analytics')) ||
    (script.src && (script.src.includes('gtag') || script.src.includes('googletagmanager')))
  );
  
  if (hasGoogleAnalytics) {
    console.log('ConsentGuard: Setting up Google Analytics consent defaults');
    
    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function if not exists
    if (!window.gtag) {
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
    }
    
    // Set consent defaults before any other GA initialization
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    
    console.log('ConsentGuard: Google Analytics consent defaults set');
  }
}

async function initializeConsentManager() {
  try {
    console.log('ConsentGuard: Starting initialization...');
    console.log('ConsentGuard: Current configuration before remote fetch:', config);
    
    // Initialize Google Analytics consent defaults early with current config
    initializeGoogleAnalyticsDefaults();
    
    // Load Google Analytics scripts immediately with current configuration
    // This ensures Google Tag Assistant can detect them
    loadGoogleAnalyticsScriptsEarly();
    
    // Then fetch remote config (this may override some settings but GA is already loaded)
    console.log('ConsentGuard: Fetching remote configuration...');
    await fetchConfig();
    
    console.log('ConsentGuard: Final configuration after remote fetch:', config);
    
    const savedPreferences = getSavedPreferences();
    
    if (!savedPreferences) {
      console.log('ConsentGuard: No saved preferences found, showing banner...');
      createBanner();
    } else {
      console.log('ConsentGuard: Found saved preferences, applying them...', savedPreferences);
      // Reapply saved preferences
      manageCookies(
        savedPreferences.choice, 
        savedPreferences.preferences
      );
      addSettingsButton();
    }
    
    console.log('ConsentGuard: Initialization complete');
  } catch (error) {
    console.error('ConsentGuard: Failed to initialize', error);
    // Still create the banner with default config
    createBanner();
  }
}
