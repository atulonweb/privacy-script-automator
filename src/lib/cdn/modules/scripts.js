
/**
 * Third-party script management for ConsentGuard
 */

import { config } from './core.js';

/**
 * Load third-party scripts based on consent preferences
 * @param {object} preferences - User's consent preferences
 */
export function loadScriptsByConsent(preferences) {
  console.log('ConsentGuard: Loading scripts based on consent preferences:', preferences);
  
  // Get script configuration from global config
  const scripts = config.scripts || {
    analytics: [],
    advertising: [],
    functional: [],
    social: []
  };

  // Apply consent to each category of scripts
  if (preferences.analytics) {
    console.log('ConsentGuard: Loading analytics scripts');
    loadScriptsForCategory('analytics', scripts.analytics);
  }
  
  if (preferences.advertising) {
    console.log('ConsentGuard: Loading advertising scripts');
    loadScriptsForCategory('advertising', scripts.advertising);
  }
  
  if (preferences.functional) {
    console.log('ConsentGuard: Loading functional scripts');
    loadScriptsForCategory('functional', scripts.functional);
  }
  
  if (preferences.social) {
    console.log('ConsentGuard: Loading social scripts');
    loadScriptsForCategory('social', scripts.social);
  }
  
  // Dispatch a custom event that other scripts can listen for
  const consentEvent = new CustomEvent('consentguardPreferencesUpdated', {
    detail: { preferences }
  });
  document.dispatchEvent(consentEvent);
}

/**
 * Load scripts for a specific consent category
 * @param {string} category - The consent category
 * @param {Array} scripts - Array of script objects for this category
 */
function loadScriptsForCategory(category, scripts = []) {
  if (!Array.isArray(scripts) || scripts.length === 0) {
    console.log(`ConsentGuard: No scripts to load for category: ${category}`);
    return;
  }
  
  console.log(`ConsentGuard: Processing ${scripts.length} scripts for category: ${category}`);
  
  scripts.forEach(scriptConfig => {
    console.log(`ConsentGuard: Processing script:`, scriptConfig);
    
    // Check if script has placeholder IDs that need to be replaced
    if (scriptConfig.src && (
        scriptConfig.src.includes('REPLACE_WITH_YOUR_') || 
        scriptConfig.src.includes('_MEASUREMENT_ID') ||
        scriptConfig.src.includes('PIXEL_ID')
    )) {
      console.warn(`ConsentGuard: Script ${scriptConfig.id} has placeholder values that need to be replaced.`);
      return; // Skip loading scripts with placeholder values
    }
    
    // Special handling for Google Analytics scripts
    if (scriptConfig.id && scriptConfig.id.includes('google-analytics')) {
      loadGoogleAnalyticsScript(scriptConfig);
    } else if (scriptConfig.id && scriptConfig.src) {
      loadScript(scriptConfig.id, scriptConfig.src, scriptConfig.async !== false, scriptConfig.attributes);
      
      // If there's also inline content, execute it after the external script loads
      if (scriptConfig.content) {
        setTimeout(() => {
          injectInlineScript(scriptConfig.id + '-inline', scriptConfig.content);
        }, 100);
      }
    } else if (scriptConfig.id && scriptConfig.content) {
      injectInlineScript(scriptConfig.id, scriptConfig.content);
    }
  });
}

/**
 * Special handling for Google Analytics scripts to ensure proper detection
 * @param {object} scriptConfig - Script configuration object
 */
function loadGoogleAnalyticsScript(scriptConfig) {
  console.log('ConsentGuard: Loading Google Analytics with special handling');
  
  // First, ensure dataLayer exists
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  
  // Define gtag function if not exists
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }
  
  // Load the external script first
  if (scriptConfig.src) {
    loadScript(scriptConfig.id, scriptConfig.src, scriptConfig.async !== false, scriptConfig.attributes);
  }
  
  // Execute inline content after a short delay to ensure external script loads first
  if (scriptConfig.content) {
    setTimeout(() => {
      console.log('ConsentGuard: Executing GA inline script');
      try {
        // Execute the inline script content
        const scriptElement = document.createElement('script');
        scriptElement.innerHTML = scriptConfig.content;
        document.head.appendChild(scriptElement);
        
        console.log('ConsentGuard: Google Analytics initialized successfully');
      } catch (error) {
        console.error('ConsentGuard: Error executing GA inline script:', error);
      }
    }, 200);
  }
}

/**
 * Load an external script
 * @param {string} id - Unique identifier for the script
 * @param {string} src - Source URL for the script
 * @param {boolean} async - Whether to load the script asynchronously
 * @param {object} attributes - Additional attributes to add to the script tag
 */
function loadScript(id, src, async = true, attributes = {}) {
  // Check if the script is already loaded
  if (document.getElementById(id)) {
    console.log(`ConsentGuard: Script ${id} already loaded, skipping`);
    return;
  }
  
  console.log(`ConsentGuard: Loading external script ${id} from ${src}`);
  
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = async;
  
  // Add any additional attributes
  if (attributes && typeof attributes === 'object') {
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
  }
  
  // Add load event listener for debugging
  script.onload = () => {
    console.log(`ConsentGuard: External script ${id} loaded successfully`);
  };
  
  script.onerror = (error) => {
    console.error(`ConsentGuard: Failed to load external script ${id}:`, error);
  };
  
  document.head.appendChild(script);
}

/**
 * Inject inline script
 * @param {string} id - Unique identifier for the script
 * @param {string} content - Script content
 */
function injectInlineScript(id, content) {
  // Check if the script is already loaded
  if (document.getElementById(id)) {
    console.log(`ConsentGuard: Inline script ${id} already loaded, skipping`);
    return;
  }
  
  console.log(`ConsentGuard: Loading inline script ${id}`);
  
  try {
    const script = document.createElement('script');
    script.id = id;
    script.innerHTML = content;
    document.head.appendChild(script);
    console.log(`ConsentGuard: Inline script ${id} executed successfully`);
  } catch (error) {
    console.error(`ConsentGuard: Error executing inline script ${id}:`, error);
  }
}
