
/**
 * Third-party script management for ConsentGuard
 */

import { config } from './core.js';

/**
 * Load third-party scripts based on consent preferences
 * @param {object} preferences - User's consent preferences
 */
export function loadScriptsByConsent(preferences) {
  // Get script configuration from global config
  const scripts = config.scripts || {
    analytics: [
      { id: 'google-analytics', src: "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" }
    ],
    advertising: [
      { id: 'facebook-pixel', src: "https://connect.facebook.net/en_US/fbevents.js" }
    ],
    functional: [],
    social: []
  };

  // Apply consent to each category of scripts
  if (preferences.analytics) {
    loadScriptsForCategory('analytics', scripts.analytics);
  }
  
  if (preferences.advertising) {
    loadScriptsForCategory('advertising', scripts.advertising);
  }
  
  if (preferences.functional) {
    loadScriptsForCategory('functional', scripts.functional);
  }
  
  if (preferences.social) {
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
  if (!Array.isArray(scripts) || scripts.length === 0) return;
  
  scripts.forEach(scriptConfig => {
    if (scriptConfig.id && scriptConfig.src) {
      loadScript(scriptConfig.id, scriptConfig.src, scriptConfig.async !== false, scriptConfig.attributes);
    } else if (scriptConfig.id && scriptConfig.content) {
      injectInlineScript(scriptConfig.id, scriptConfig.content);
    }
  });
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
  if (document.getElementById(id)) return;
  
  console.log(`ConsentGuard: Loading script ${id}`);
  
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
  
  document.head.appendChild(script);
}

/**
 * Inject inline script
 * @param {string} id - Unique identifier for the script
 * @param {string} content - Script content
 */
function injectInlineScript(id, content) {
  // Check if the script is already loaded
  if (document.getElementById(id)) return;
  
  console.log(`ConsentGuard: Loading inline script ${id}`);
  
  const script = document.createElement('script');
  script.id = id;
  script.innerHTML = content;
  document.head.appendChild(script);
}

/**
 * Example function to load Google Analytics
 * Replace with your actual implementation
 */
function loadGoogleAnalytics() {
  // Check if GA is already loaded
  if (window.ga || window.gtag) return;
  
  console.log('ConsentGuard: Loading Google Analytics');
  
  // Example implementation - replace with your actual GA code
  const script = document.createElement('script');
  script.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
  script.async = true;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
}

/**
 * Example function to load Facebook Pixel
 * Replace with your actual implementation
 */
function loadFacebookPixel() {
  // Check if FB Pixel is already loaded
  if (window.fbq) return;
  
  console.log('ConsentGuard: Loading Facebook Pixel');
  
  // Example implementation - replace with your actual FB Pixel code
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'PIXEL_ID');
  fbq('track', 'PageView');
}

/**
 * Example function to load functional scripts
 * Replace with your actual implementation
 */
function loadFunctionalScripts() {
  console.log('ConsentGuard: Loading functional scripts');
  // Implement your actual functional scripts loading logic here
}

/**
 * Example function to load social media scripts
 * Replace with your actual implementation
 */
function loadSocialMediaScripts() {
  console.log('ConsentGuard: Loading social media scripts');
  // Implement your actual social media scripts loading logic here
}
