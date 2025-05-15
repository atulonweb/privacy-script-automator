
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
  // Script configuration by category - these are PLACEHOLDER examples
  // and must be replaced with actual script configuration
  scripts: {
    analytics: [
      { 
        id: 'google-analytics', 
        src: "https://www.googletagmanager.com/gtag/js?id=REPLACE_WITH_YOUR_GA_ID",
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

/**
 * Look for custom script configuration in the script tag
 * This function checks for a data-config attribute on the script tag
 * that can be used to override the default configuration
 */
function getScriptConfiguration() {
  try {
    // Find the script tag that loaded this script
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.src && script.src.includes('cg.js')) {
        // Check if it has a data-config attribute
        if (script.getAttribute('data-config')) {
          const configData = JSON.parse(script.getAttribute('data-config'));
          console.log('ConsentGuard: Found script configuration', configData);
          return configData;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('ConsentGuard: Error parsing script configuration', error);
    return null;
  }
}

async function initializeConsentManager() {
  try {
    // First check for inline script configuration
    const scriptConfig = getScriptConfiguration();
    
    // Then fetch remote config
    await fetchConfig();
    
    // Apply any script configuration found in script tag
    if (scriptConfig) {
      if (scriptConfig.scripts) {
        config.scripts = {
          ...config.scripts,
          ...scriptConfig.scripts
        };
      }
      
      // Allow other config options to be set via script tag
      if (scriptConfig.language) {
        config.language = scriptConfig.language;
      }
    }
    
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
