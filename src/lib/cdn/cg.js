
/**
 * ConsentGuard - Cookie Consent Management System
 * Main entry point that initializes the consent manager
 */

// CRITICAL: Extract and apply configuration FIRST, before any imports
// This ensures all modules get the correct configuration from the start
let scriptConfig = null;

function extractAndApplyConfigImmediately() {
  console.log('ConsentGuard: Extracting configuration immediately...');
  
  const scriptElement = document.currentScript || 
    document.querySelector('script[src*="cg.js"]');
    
  if (scriptElement) {
    // Look for data-config attribute first
    const configAttr = scriptElement.getAttribute('data-config');
    if (configAttr) {
      try {
        scriptConfig = JSON.parse(configAttr);
        console.log('ConsentGuard: Found and parsed data-config:', scriptConfig);
        return scriptConfig;
      } catch (error) {
        console.error('ConsentGuard: Failed to parse data-config', error);
      }
    }
    
    // Look for individual data attributes as fallback
    const configObject = {};
    
    const userId = scriptElement.getAttribute('data-user-id');
    if (userId) {
      configObject.userId = userId;
    }
    
    const sessionId = scriptElement.getAttribute('data-session-id');
    if (sessionId) {
      configObject.sessionId = sessionId;
    }
    
    if (Object.keys(configObject).length > 0) {
      scriptConfig = configObject;
      console.log('ConsentGuard: Found data attributes config:', scriptConfig);
      return scriptConfig;
    }
  }
  
  console.log('ConsentGuard: No script configuration found');
  return null;
}

// Extract configuration IMMEDIATELY before any imports
scriptConfig = extractAndApplyConfigImmediately();

// Now import modules (they will receive the pre-extracted config)
import { init, setConfig } from './modules/core.js';

// Apply the extracted configuration immediately after import
if (scriptConfig) {
  console.log('ConsentGuard: Applying extracted configuration before initialization...');
  setConfig(scriptConfig);
}

// Export the init function for module importers
export { init };

// Initialize the consent manager
init();
