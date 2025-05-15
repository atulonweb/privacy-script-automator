
/**
 * ConsentGuard - Cookie Consent Management System
 * Main entry point that initializes the consent manager
 */

import { init } from './modules/core.js';

// Self-invoking function to start the consent manager
(function() {
  init();
})();
