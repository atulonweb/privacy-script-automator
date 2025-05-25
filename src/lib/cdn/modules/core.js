
/**
 * Core functionality for ConsentGuard
 */

import { createBanner } from './ui/banner.js';
import { manageCookies } from './cookies.js';
import { addSettingsButton } from './ui/settings-button.js';
import { getSavedPreferences, fetchConfig } from './data.js';
import { recordAnalytics } from './analytics.js';
import { loadGoogleAnalyticsScriptsEarly } from './scripts.js';

// Global configuration object - START CLEAN with no placeholder scripts
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
  // Start with empty script arrays - NO PLACEHOLDER SCRIPTS
  // Only scripts provided via data-config will be used
  scripts: {
    analytics: [],
    advertising: [],
    functional: [],
    social: []
  }
};

// Export the config so other modules can access it
export const setConfig = (newConfig) => {
  console.log('ConsentGuard: setConfig called with:', newConfig);
  
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
    console.log('ConsentGuard: Scripts configuration updated:', config.scripts);
  }

  console.log('ConsentGuard: Final configuration after setConfig:', config);
};

/**
 * Initialize the consent manager
 */
export async function init() {
  console.log('ConsentGuard: Initializing...');
  console.log('ConsentGuard: Current configuration at init:', config);
  
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
  console.log('ConsentGuard: Checking for Google Analytics scripts in configuration...');
  
  // Look for Google Analytics scripts in configuration with improved detection
  const allScripts = [
    ...(config.scripts?.analytics || []),
    ...(config.scripts?.advertising || []),
    ...(config.scripts?.functional || []),
    ...(config.scripts?.social || [])
  ];
  
  console.log('ConsentGuard: All scripts to check for GA:', allScripts);
  
  const hasGoogleAnalytics = allScripts.some(script => {
    const hasGA = (
      (script.id && (
        script.id.includes('google-analytics') ||
        script.id.includes('ga') ||
        script.id.includes('gtag')
      )) ||
      (script.src && (
        script.src.includes('gtag') || 
        script.src.includes('googletagmanager') ||
        script.src.includes('G-') ||
        script.src.includes('analytics')
      ))
    );
    
    if (hasGA) {
      console.log('ConsentGuard: Found Google Analytics script:', script);
    }
    
    return hasGA;
  });
  
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
  } else {
    console.log('ConsentGuard: No Google Analytics scripts found in current configuration');
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
    console.log('ConsentGuard: Loading Google Analytics scripts early...');
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
