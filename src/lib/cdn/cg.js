
/**
 * ConsentGuard - Cookie Consent Management System
 * Main entry point that initializes the consent manager
 */

import { init } from './modules/core.js';

// Export the init function to be used by module importers
export { init };

// Initialize the consent manager when imported directly via script tag
init();
