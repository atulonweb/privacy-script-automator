
/**
 * ConsentGuard - Cookie Consent Management System
 * Main entry point that initializes the consent manager
 */

import { init, setConfig } from './modules/core.js';

// Extract configuration from script tag
function extractConfigFromScriptTag() {
  const scriptElement = document.currentScript || 
    document.querySelector('script[src*="cg.js"]');
    
  if (scriptElement) {
    // Look for data-config attribute
    const configAttr = scriptElement.getAttribute('data-config');
    if (configAttr) {
      try {
        const configObject = JSON.parse(configAttr);
        console.log('ConsentGuard: Found script tag configuration:', configObject);
        return configObject;
      } catch (error) {
        console.error('ConsentGuard: Failed to parse configuration', error);
      }
    }
    
    // Look for individual data attributes
    const configObject = {};
    
    // User ID for tracking purposes
    const userId = scriptElement.getAttribute('data-user-id');
    if (userId) {
      configObject.userId = userId;
    }
    
    // Session ID for tracking purposes
    const sessionId = scriptElement.getAttribute('data-session-id');
    if (sessionId) {
      configObject.sessionId = sessionId;
    }
    
    return Object.keys(configObject).length > 0 ? configObject : null;
  }
  
  return null;
}

// Apply configuration from script tag IMMEDIATELY before initialization
const scriptConfig = extractConfigFromScriptTag();
if (scriptConfig) {
  console.log('ConsentGuard: Applying script tag configuration before initialization...');
  setConfig(scriptConfig);
}

// Export the init function to be used by module importers
export { init };

// Initialize the consent manager when imported directly via script tag
init();
