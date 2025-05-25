/**
 * ConsentGuard - Cookie Consent Management System
 * Main entry point that initializes the consent manager
 */

// STEP 1: Extract configuration IMMEDIATELY
let scriptConfig = null;

function extractAndApplyConfigImmediately() {
  console.log('ConsentGuard: Extracting configuration immediately...');

  const scriptElement = document.currentScript || document.querySelector('script[src*="cg.js"]');

  if (!scriptElement) {
    console.warn('ConsentGuard: Could not find script element');
    return null;
  }

  const configAttr = scriptElement.getAttribute('data-config');
  if (configAttr) {
    try {
      const parsed = JSON.parse(configAttr);
      scriptConfig = parsed;
      window.ConsentGuardConfig = parsed;
      console.log('ConsentGuard: Found and parsed data-config:', parsed);
      return parsed;
    } catch (e) {
      console.error('ConsentGuard: Failed to parse data-config:', e);
    }
  }

  // Fallback to individual attributes (rare case)
  const fallback = {};
  const userId = scriptElement.getAttribute('data-user-id');
  const sessionId = scriptElement.getAttribute('data-session-id');
  if (userId) fallback.userId = userId;
  if (sessionId) fallback.sessionId = sessionId;

  if (Object.keys(fallback).length > 0) {
    scriptConfig = fallback;
    window.ConsentGuardConfig = fallback;
    console.log('ConsentGuard: Using fallback config:', fallback);
    return fallback;
  }

  console.warn('ConsentGuard: No configuration found on script element');
  return null;
}

// Step 2: Extract config before imports
scriptConfig = extractAndApplyConfigImmediately();

// Step 3: Import and initialize AFTER config is available
import { init, setConfig } from './modules/core.js';

// Step 4: Apply config before calling init
if (scriptConfig) {
  console.log('ConsentGuard: Applying configuration before initialization');
  setConfig(scriptConfig);
} else {
  console.warn('ConsentGuard: No valid configuration found to apply');
}

// Step 5: Initialize ConsentGuard
init();

// Export for manual control (if needed)
export { init };
