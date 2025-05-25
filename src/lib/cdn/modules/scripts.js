/**
 * Third-party script management for ConsentGuard
 */

import { config } from './core.js';

/**
 * Load Google Analytics scripts early (before consent interaction)
 * This ensures Google Tag Assistant can detect them
 */
export function loadGoogleAnalyticsScriptsEarly() {
  console.log('ConsentGuard: 🔍 Loading Google Analytics scripts early for detection');
  console.log('ConsentGuard: Current scripts configuration:', config.scripts);
  
  const scripts = config.scripts || {
    analytics: [],
    advertising: [],
    functional: [],
    social: []
  };

  // Check all categories for Google Analytics scripts with enhanced detection
  const allCategories = ['analytics', 'advertising', 'functional', 'social'];
  let foundGAScripts = 0;
  let totalScriptsChecked = 0;
  
  allCategories.forEach(category => {
    const categoryScripts = scripts[category] || [];
    totalScriptsChecked += categoryScripts.length;
    console.log(`ConsentGuard: 📂 Checking ${categoryScripts.length} scripts in ${category} category`);
    
    categoryScripts.forEach((scriptConfig, index) => {
      console.log(`ConsentGuard: 🔎 Script ${index + 1}/${categoryScripts.length} in ${category}:`, scriptConfig);
      
      // Enhanced detection specifically for your GA4 configuration
      const isGoogleAnalytics = (
        // Check for specific IDs you use
        (scriptConfig.id && (
          scriptConfig.id === 'google-analytics-4' ||  // Your exact ID
          scriptConfig.id.includes('google-analytics') ||
          scriptConfig.id.includes('ga') ||
          scriptConfig.id.includes('gtag')
        )) ||
        // Check for GA4 patterns in src URL
        (scriptConfig.src && (
          scriptConfig.src.includes('G-N075SBHV0F') || // Your specific measurement ID
          scriptConfig.src.includes('gtag') || 
          scriptConfig.src.includes('googletagmanager') ||
          scriptConfig.src.includes('analytics') ||
          scriptConfig.src.includes('G-') // Any GA4 measurement ID pattern
        ))
      );
      
      if (isGoogleAnalytics) {
        console.log(`ConsentGuard: ✅ FOUND Google Analytics script in ${category}:`, scriptConfig);
        foundGAScripts++;
        loadGoogleAnalyticsScript(scriptConfig);
      } else {
        console.log(`ConsentGuard: ❌ Not a GA script in ${category}:`, scriptConfig);
      }
    });
  });
  
  console.log(`ConsentGuard: 📊 Summary: Checked ${totalScriptsChecked} total scripts, found ${foundGAScripts} GA scripts`);
  
  if (foundGAScripts === 0) {
    console.log('ConsentGuard: ⚠️ WARNING: NO Google Analytics scripts found in configuration');
    console.log('ConsentGuard: 🔍 Debug - All scripts by category:');
    allCategories.forEach(category => {
      const categoryScripts = scripts[category] || [];
      console.log(`ConsentGuard: ${category}: ${categoryScripts.length} scripts`);
      if (categoryScripts.length > 0) {
        categoryScripts.forEach((script, i) => {
          console.log(`ConsentGuard:   ${i + 1}. ID: "${script.id}", SRC: "${script.src}"`);
        });
      }
    });
    
    // Check if the configuration itself is empty
    const totalConfigScripts = Object.values(scripts).reduce((sum, arr) => sum + arr.length, 0);
    if (totalConfigScripts === 0) {
      console.log('ConsentGuard: ❌ CRITICAL: Configuration has no scripts at all - check data-config parsing');
    }
  } else {
    console.log(`ConsentGuard: ✅ SUCCESS: Loaded ${foundGAScripts} Google Analytics scripts early`);
  }
}

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
    loadScriptsForCategory('analytics', scripts.analytics, preferences);
  }
  
  if (preferences.advertising) {
    console.log('ConsentGuard: Loading advertising scripts');
    loadScriptsForCategory('advertising', scripts.advertising, preferences);
  }
  
  if (preferences.functional) {
    console.log('ConsentGuard: Loading functional scripts');
    loadScriptsForCategory('functional', scripts.functional, preferences);
  }
  
  if (preferences.social) {
    console.log('ConsentGuard: Loading social scripts');
    loadScriptsForCategory('social', scripts.social, preferences);
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
 * @param {object} preferences - User's consent preferences
 */
function loadScriptsForCategory(category, scripts = [], preferences = {}) {
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
    
    // Enhanced Google Analytics detection for script loading
    const isGoogleAnalytics = (
      (scriptConfig.id && (
        scriptConfig.id.includes('google-analytics') ||
        scriptConfig.id.includes('ga') ||
        scriptConfig.id.includes('gtag')
      )) ||
      (scriptConfig.src && (
        scriptConfig.src.includes('gtag') || 
        scriptConfig.src.includes('googletagmanager') ||
        scriptConfig.src.includes('G-')
      ))
    );
    
    if (isGoogleAnalytics) {
      // GA scripts are already loaded early, just update consent
      updateGoogleAnalyticsConsent(preferences);
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
 * Update Google Analytics consent based on user preferences
 * @param {object} preferences - User's consent preferences
 */
function updateGoogleAnalyticsConsent(preferences) {
  // Only update if gtag is available
  if (typeof window.gtag === 'function') {
    console.log('ConsentGuard: Updating Google Analytics consent', preferences);
    
    window.gtag('consent', 'update', {
      ad_storage: preferences.advertising ? 'granted' : 'denied',
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      ad_user_data: preferences.advertising ? 'granted' : 'denied',
      ad_personalization: preferences.advertising ? 'granted' : 'denied'
    });
    
    console.log('ConsentGuard: Google Analytics consent updated');
  } else {
    console.log('ConsentGuard: gtag not available, skipping consent update');
  }
}

/**
 * Special handling for Google Analytics scripts to ensure proper detection
 * @param {object} scriptConfig - Script configuration object
 */
function loadGoogleAnalyticsScript(scriptConfig) {
  console.log('ConsentGuard: 🚀 Loading Google Analytics with special handling:', scriptConfig);
  
  // First, ensure dataLayer exists
  if (!window.dataLayer) {
    window.dataLayer = [];
    console.log('ConsentGuard: ✅ Created dataLayer array');
  }
  
  // Define gtag function if not exists
  if (!window.gtag) {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    console.log('ConsentGuard: ✅ Created gtag function');
  }
  
  // Load the external script first if it exists
  if (scriptConfig.src) {
    console.log('ConsentGuard: 📦 Loading GA external script:', scriptConfig.src);
    loadScript(scriptConfig.id, scriptConfig.src, scriptConfig.async !== false, scriptConfig.attributes);
  }
  
  // Execute inline content immediately if it exists
  if (scriptConfig.content) {
    console.log('ConsentGuard: 📝 Executing GA inline script immediately');
    try {
      // Execute the inline script content immediately
      const scriptElement = document.createElement('script');
      scriptElement.innerHTML = scriptConfig.content;
      scriptElement.id = scriptConfig.id + '-inline';
      document.head.appendChild(scriptElement);
      
      console.log('ConsentGuard: ✅ Google Analytics inline script executed successfully');
    } catch (error) {
      console.error('ConsentGuard: ❌ Error executing GA inline script:', error);
    }
  }
  
  console.log('ConsentGuard: ✅ Google Analytics script processing complete');
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
