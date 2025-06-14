
/**
 * ConsentGuard - Cookie Consent Management System
 * Standalone version that works without ES6 modules
 */

(function() {
  'use strict';

  // Global configuration object
  let config = {
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
    scripts: {
      analytics: [],
      advertising: [],
      functional: [],
      social: []
    }
  };

  // Extract configuration from script element
  function extractConfig() {
    console.log('ConsentGuard: Extracting configuration...');

    const scriptElement = document.currentScript || document.querySelector('script[src*="cg.js"]');

    if (!scriptElement) {
      console.warn('ConsentGuard: Could not find script element');
      return null;
    }

    const configAttr = scriptElement.getAttribute('data-config');
    if (configAttr) {
      try {
        const parsed = JSON.parse(configAttr);
        console.log('ConsentGuard: Found and parsed data-config:', parsed);
        return parsed;
      } catch (e) {
        console.error('ConsentGuard: Failed to parse data-config:', e);
      }
    }

    console.warn('ConsentGuard: No configuration found on script element');
    return null;
  }

  // Apply configuration
  function setConfig(newConfig) {
    if (newConfig) {
      config = Object.assign(config, newConfig);
      
      if (newConfig.scripts) {
        config.scripts = {
          analytics: newConfig.scripts.analytics || [],
          advertising: newConfig.scripts.advertising || [],
          functional: newConfig.scripts.functional || [],
          social: newConfig.scripts.social || []
        };
      }
      
      console.log('ConsentGuard: Configuration applied:', config);
    }
  }

  // Cookie management
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const secure = config.secureFlags && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure}`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // Get saved preferences
  function getSavedPreferences() {
    const consentCookie = getCookie('consentguard_consent');
    const preferencesCookie = getCookie('consentguard_preferences');
    
    if (!consentCookie) return null;
    
    if (consentCookie === 'accept') {
      return { 
        choice: 'accept', 
        preferences: { analytics: true, advertising: true, functional: true, social: true }
      };
    } else if (consentCookie === 'reject') {
      return { 
        choice: 'reject', 
        preferences: { analytics: false, advertising: false, functional: true, social: false }
      };
    } else if (consentCookie === 'partial' && preferencesCookie) {
      try {
        const savedPreferences = JSON.parse(decodeURIComponent(preferencesCookie));
        return { 
          choice: 'partial', 
          preferences: savedPreferences 
        };
      } catch (e) {
        console.error('Error parsing preferences cookie', e);
        return null;
      }
    }
    
    return null;
  }

  // Create banner
  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'consentguard-banner';
    banner.style.cssText = `
      position: fixed;
      ${config.bannerPosition}: 0;
      left: 0;
      right: 0;
      background: ${config.bannerColor};
      color: ${config.textColor};
      padding: 20px;
      z-index: 999999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    banner.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 15px;">
        <div style="flex: 1; min-width: 300px;">
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </p>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="cg-accept" style="background: ${config.buttonColor}; color: ${config.buttonTextColor}; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Accept All</button>
          <button id="cg-reject" style="background: transparent; color: ${config.textColor}; border: 1px solid ${config.textColor}; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Reject All</button>
          <button id="cg-customize" style="background: transparent; color: ${config.textColor}; border: 1px solid ${config.textColor}; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;">Customize</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('cg-accept').addEventListener('click', () => handleConsent('accept'));
    document.getElementById('cg-reject').addEventListener('click', () => handleConsent('reject'));
    document.getElementById('cg-customize').addEventListener('click', showCustomizePanel);
  }

  // Handle consent
  function handleConsent(choice, preferences = null) {
    let finalPreferences;
    
    if (choice === 'accept') {
      finalPreferences = { analytics: true, advertising: true, functional: true, social: true };
    } else if (choice === 'reject') {
      finalPreferences = { analytics: false, advertising: false, functional: true, social: false };
    } else {
      finalPreferences = preferences || { analytics: false, advertising: false, functional: true, social: false };
    }

    // Save cookies
    setCookie('consentguard_consent', choice, 365);
    if (choice === 'partial') {
      setCookie('consentguard_preferences', encodeURIComponent(JSON.stringify(finalPreferences)), 365);
    }

    // Remove banner
    const banner = document.getElementById('consentguard-banner');
    if (banner) banner.remove();

    // Remove customize panel if open
    const panel = document.getElementById('consentguard-customize');
    if (panel) panel.remove();

    // Load scripts based on consent
    loadScriptsByConsent(finalPreferences);

    console.log('ConsentGuard: Consent saved:', choice, finalPreferences);
  }

  // Show customize panel
  function showCustomizePanel() {
    const panel = document.createElement('div');
    panel.id = 'consentguard-customize';
    panel.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    panel.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <h3 style="margin: 0 0 20px 0; color: #333;">Cookie Preferences</h3>
        
        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; margin-bottom: 10px; color: #333;">
            <input type="checkbox" id="cg-functional" checked disabled style="margin-right: 10px;">
            <span><strong>Functional Cookies (Required)</strong><br><small>Essential for the website to function properly.</small></span>
          </label>
          
          <label style="display: flex; align-items: center; margin-bottom: 10px; color: #333;">
            <input type="checkbox" id="cg-analytics" style="margin-right: 10px;">
            <span><strong>Analytics Cookies</strong><br><small>Help us understand how visitors interact with our website.</small></span>
          </label>
          
          <label style="display: flex; align-items: center; margin-bottom: 10px; color: #333;">
            <input type="checkbox" id="cg-advertising" style="margin-right: 10px;">
            <span><strong>Advertising Cookies</strong><br><small>Used to deliver personalized advertisements.</small></span>
          </label>
          
          <label style="display: flex; align-items: center; margin-bottom: 10px; color: #333;">
            <input type="checkbox" id="cg-social" style="margin-right: 10px;">
            <span><strong>Social Media Cookies</strong><br><small>Enable social media features and personalized content.</small></span>
          </label>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="cg-save-preferences" style="background: ${config.bannerColor}; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">Save Preferences</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listener
    document.getElementById('cg-save-preferences').addEventListener('click', () => {
      const preferences = {
        functional: true, // Always true
        analytics: document.getElementById('cg-analytics').checked,
        advertising: document.getElementById('cg-advertising').checked,
        social: document.getElementById('cg-social').checked
      };
      handleConsent('partial', preferences);
    });

    // Close on background click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        panel.remove();
      }
    });
  }

  // Load scripts based on consent
  function loadScriptsByConsent(preferences) {
    console.log('ConsentGuard: Loading scripts based on preferences:', preferences);
    
    // Update Google Analytics consent if available
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: preferences.advertising ? 'granted' : 'denied',
        analytics_storage: preferences.analytics ? 'granted' : 'denied',
        ad_user_data: preferences.advertising ? 'granted' : 'denied',
        ad_personalization: preferences.advertising ? 'granted' : 'denied'
      });
    }

    // Load scripts for each category
    if (preferences.analytics) {
      loadScriptsForCategory('analytics');
    }
    if (preferences.advertising) {
      loadScriptsForCategory('advertising');
    }
    if (preferences.functional) {
      loadScriptsForCategory('functional');
    }
    if (preferences.social) {
      loadScriptsForCategory('social');
    }
  }

  // Load scripts for category
  function loadScriptsForCategory(category) {
    const scripts = config.scripts[category] || [];
    scripts.forEach(scriptConfig => {
      if (scriptConfig.src) {
        loadScript(scriptConfig.id, scriptConfig.src);
      }
      if (scriptConfig.content) {
        executeInlineScript(scriptConfig.id, scriptConfig.content);
      }
    });
  }

  // Load external script
  function loadScript(id, src) {
    if (document.getElementById(id)) return;
    
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  }

  // Execute inline script
  function executeInlineScript(id, content) {
    if (document.getElementById(id)) return;
    
    const script = document.createElement('script');
    script.id = id;
    script.innerHTML = content;
    document.head.appendChild(script);
  }

  // Initialize
  function init() {
    console.log('ConsentGuard: Initializing...');
    
    // Extract and apply configuration
    const scriptConfig = extractConfig();
    if (scriptConfig) {
      setConfig(scriptConfig);
    }

    // Initialize Google Analytics consent defaults
    const hasGoogleAnalytics = config.scripts.analytics.some(script => 
      script.src && script.src.includes('gtag')
    );
    
    if (hasGoogleAnalytics) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }

    // Check for saved preferences
    const savedPreferences = getSavedPreferences();
    
    if (!savedPreferences) {
      createBanner();
    } else {
      loadScriptsByConsent(savedPreferences.preferences);
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual control
  window.ConsentGuard = {
    init: init,
    showBanner: createBanner,
    showCustomize: showCustomizePanel
  };

})();
