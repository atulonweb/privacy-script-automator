
/**
 * ConsentGuard - Cookie Consent Management System
 * This script dynamically creates and manages a cookie consent banner
 * based on configuration retrieved using the script ID.
 */

(function() {
  // Extract script ID from the current script tag's URL
  const scriptElement = document.currentScript;
  const scriptSrc = scriptElement.src;
  const url = new URL(scriptSrc);
  const scriptId = url.searchParams.get('id');
  
  // Check if we're in test mode
  const testMode = url.searchParams.get('testMode') === 'true';
  
  // Config object to store banner settings
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
    translations: {}
  };
  
  // Default translations
  const defaultTranslations = {
    en: {
      mainText: 'This website uses cookies to ensure you get the best experience on our website.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      customize: 'Customize',
      cookiePreferences: 'Cookie Preferences',
      preferencesDescription: 'Customize your cookie preferences below. Some cookies are essential for the website to function and cannot be disabled.',
      savePreferences: 'Save Preferences',
      poweredBy: 'Powered by',
      required: 'Required',
      privacyPolicy: 'For more information, please read our',
      privacyPolicyLink: 'Privacy Policy',
      cookieSettings: 'Cookie Settings',
      additionalInfo: 'Additional Information'
    },
    fr: {
      mainText: 'Ce site utilise des cookies pour vous garantir la meilleure expérience sur notre site.',
      acceptAll: 'Tout accepter',
      rejectAll: 'Tout refuser',
      customize: 'Personnaliser',
      cookiePreferences: 'Préférences de cookies',
      preferencesDescription: 'Personnalisez vos préférences de cookies ci-dessous. Certains cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.',
      savePreferences: 'Enregistrer les préférences',
      poweredBy: 'Propulsé par',
      required: 'Obligatoire',
      privacyPolicy: 'Pour plus d\'informations, veuillez lire notre',
      privacyPolicyLink: 'Politique de confidentialité',
      cookieSettings: 'Paramètres des cookies',
      additionalInfo: 'Informations supplémentaires'
    },
    es: {
      mainText: 'Este sitio web utiliza cookies para garantizar que obtenga la mejor experiencia en nuestro sitio web.',
      acceptAll: 'Aceptar todo',
      rejectAll: 'Rechazar todo',
      customize: 'Personalizar',
      cookiePreferences: 'Preferencias de cookies',
      preferencesDescription: 'Personalice sus preferencias de cookies a continuación. Algunas cookies son esenciales para que el sitio web funcione y no se pueden desactivar.',
      savePreferences: 'Guardar preferencias',
      poweredBy: 'Desarrollado por',
      required: 'Requerido',
      privacyPolicy: 'Para más información, por favor lea nuestra',
      privacyPolicyLink: 'Política de Privacidad',
      cookieSettings: 'Configuración de cookies',
      additionalInfo: 'Información adicional'
    }
  };
  
  // Cookie categories with default states
  const cookieCategories = [
    {
      id: "necessary",
      name: "Strictly Necessary Cookies",
      description: "These cookies are essential for the website to function and cannot be switched off.",
      required: true,
      checked: true
    },
    {
      id: "analytics",
      name: "Performance / Analytics Cookies",
      description: "These cookies help us understand how visitors interact with the website.",
      required: false,
      checked: false
    },
    {
      id: "functional",
      name: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization.",
      required: false,
      checked: false
    },
    {
      id: "advertising",
      name: "Targeting / Advertising Cookies",
      description: "These cookies are used to display relevant advertisements and track visitor preferences.",
      required: false,
      checked: false
    },
    {
      id: "social",
      name: "Social Media Cookies",
      description: "These cookies enable sharing content via social media platforms and may track your online activity.",
      required: false,
      checked: false
    }
  ];
  
  // API endpoint using the Supabase Edge Function
  const API_ENDPOINT = 'https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-config';
  
  /**
   * Get translation for a specific key
   * @param {string} key - Translation key
   */
  function getTranslation(key) {
    const lang = config.language || 'en';
    
    // Try to get from custom translations first
    if (config.translations && config.translations[lang] && config.translations[lang][key]) {
      return config.translations[lang][key];
    }
    
    // Fall back to default translations
    if (defaultTranslations[lang] && defaultTranslations[lang][key]) {
      return defaultTranslations[lang][key];
    }
    
    // Ultimate fallback to English
    return defaultTranslations.en[key] || key;
  }
  
  /**
   * Fetch configuration from the API
   */
  async function fetchConfig() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_ENDPOINT}?scriptId=${scriptId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch configuration: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update config with fetched data
      if (data) {
        config = {
          ...config,
          ...data
        };
      }
      
      return config;
    } catch (error) {
      console.error('ConsentGuard: Error fetching configuration', error);
      return config; // Return default config on error
    }
  }
  
  /**
   * Record analytics data
   * @param {string} action - The user action (view, accept, reject, partial)
   */
  async function recordAnalytics(action) {
    // Skip analytics recording if in test mode
    if (testMode) {
      console.log('ConsentGuard: Test mode - analytics not recorded for action:', action);
      return;
    }
    
    try {
      await fetch(`${API_ENDPOINT}/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptId: scriptId,
          action: action
        })
      });
    } catch (error) {
      console.error('ConsentGuard: Error recording analytics', error);
    }
  }
  
  /**
   * Notify webhook about consent changes if configured
   * @param {string} choice - User's consent choice
   * @param {object} preferences - Consent preferences
   */
  async function notifyConsentWebhook(choice, preferences) {
    if (!config.webhookUrl) return;
    
    try {
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scriptId: scriptId,
          choice: choice,
          preferences: preferences,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('ConsentGuard: Error notifying webhook', error);
    }
  }
  
  /**
   * Get saved consent preferences from cookies
   */
  function getSavedPreferences() {
    const consentCookie = getCookie('consentguard_consent');
    const preferencesCookie = getCookie('consentguard_preferences');
    
    if (!consentCookie) return null;
    
    if (consentCookie === 'accept') {
      return { 
        choice: 'accept', 
        preferences: cookieCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
      };
    } else if (consentCookie === 'reject') {
      return { 
        choice: 'reject', 
        preferences: cookieCategories.reduce((acc, cat) => (
          { ...acc, [cat.id]: cat.required }
        ), {})
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
  
  /**
   * Get cookie by name
   */
  function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }
  
  /**
   * Load third-party scripts based on consent preferences
   * @param {object} preferences - User's consent preferences
   */
  function loadScriptsByConsent(preferences) {
    // This is where you would add code to load specific scripts
    // based on the user's consent preferences
    
    // Example: Load Google Analytics if analytics cookies are accepted
    if (preferences.analytics) {
      loadGoogleAnalytics();
    }
    
    // Example: Load Facebook Pixel if advertising cookies are accepted
    if (preferences.advertising) {
      loadFacebookPixel();
    }
    
    // Example: Load functional scripts
    if (preferences.functional) {
      loadFunctionalScripts();
    }
    
    // Example: Load social media scripts
    if (preferences.social) {
      loadSocialMediaScripts();
    }
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
  
  /**
   * Manage cookies based on consent choice
   * @param {string} choice - User's consent choice (accept, reject, partial)
   * @param {object} preferences - Optional preferences for partial consent
   */
  function manageCookies(choice, preferences = null) {
    // Clear any existing consent cookies first
    document.cookie = "consentguard_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "consentguard_preferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Set a consent cookie to remember user's choice
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // Cookie valid for 6 months
    
    // Build cookie flags
    let cookieFlags = `; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    if (config.secureFlags && window.location.protocol === 'https:') {
      cookieFlags += '; Secure';
    }
    
    document.cookie = `consentguard_consent=${choice}${cookieFlags}`;
    
    // If we have specific preferences, store them too
    if (preferences) {
      const preferencesJson = JSON.stringify(preferences);
      document.cookie = `consentguard_preferences=${encodeURIComponent(preferencesJson)}${cookieFlags}`;
    }
    
    // Prepare preferences object for script loading
    let finalPreferences;
    if (choice === 'accept') {
      // All cookies accepted
      finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: true}), {});
    } else if (choice === 'reject') {
      // Only necessary cookies allowed
      finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: cat.required}), {});
    } else if (choice === 'partial' && preferences) {
      // Use provided preferences
      finalPreferences = preferences;
    } else {
      // Fallback to only necessary cookies
      finalPreferences = cookieCategories.reduce((acc, cat) => ({...acc, [cat.id]: cat.required}), {});
    }
    
    // Store preferences in a global variable for other scripts to access
    window.ConsentGuardPreferences = finalPreferences;
    
    // Load scripts based on preferences
    loadScriptsByConsent(finalPreferences);
    
    // Notify webhook if configured
    notifyConsentWebhook(choice, finalPreferences);
  }
  
  /**
   * Create and display the consent banner
   */
  function createBanner() {
    // Remove any existing banner first
    const existingBanner = document.getElementById('consentguard-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    // Create container element
    const banner = document.createElement('div');
    banner.id = 'consentguard-banner';
    
    // Set position styles
    let positionStyles = '';
    if (config.bannerPosition === 'top') {
      positionStyles = 'top: 0; left: 0; right: 0;';
    } else {
      positionStyles = 'bottom: 0; left: 0; right: 0;';
    }
    
    // Apply styles to banner
    banner.style.cssText = `
      position: fixed;
      ${positionStyles}
      background-color: ${config.bannerColor};
      color: ${config.textColor};
      padding: 15px 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 99999;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
    `;
    
    // Add ARIA attributes for accessibility
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'consentguard-title');
    banner.setAttribute('aria-describedby', 'consentguard-desc');
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = 'flex: 1; margin-right: 20px;';
    
    // Create main text
    const text = document.createElement('p');
    text.id = 'consentguard-desc';
    text.style.cssText = 'margin: 0 0 10px 0;';
    text.textContent = getTranslation('mainText');
    
    // Hidden title for screen readers
    const srTitle = document.createElement('h2');
    srTitle.id = 'consentguard-title';
    srTitle.textContent = 'Cookie Consent';
    srTitle.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
    contentWrapper.appendChild(srTitle);
    
    // Create button wrapper
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap;';
    
    // Create accept button
    const acceptButton = document.createElement('button');
    acceptButton.textContent = getTranslation('acceptAll');
    acceptButton.setAttribute('aria-label', getTranslation('acceptAll'));
    acceptButton.style.cssText = `
      background-color: ${config.buttonColor};
      color: ${config.buttonTextColor};
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: opacity 0.2s;
    `;
    
    // Create reject button
    const rejectButton = document.createElement('button');
    rejectButton.textContent = getTranslation('rejectAll');
    rejectButton.setAttribute('aria-label', getTranslation('rejectAll'));
    rejectButton.style.cssText = `
      background-color: transparent;
      color: ${config.textColor};
      border: 1px solid ${config.textColor};
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    `;
    
    // Create customize button
    const customizeButton = document.createElement('button');
    customizeButton.textContent = getTranslation('customize');
    customizeButton.setAttribute('aria-label', getTranslation('customize'));
    customizeButton.style.cssText = `
      background-color: transparent;
      color: ${config.textColor};
      border: 1px solid ${config.textColor};
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    `;
    
    // Add powered by text if enabled
    if (config.showPoweredBy) {
      const poweredBy = document.createElement('div');
      poweredBy.style.cssText = 'font-size: 11px; margin-top: 8px; opacity: 0.7;';
      poweredBy.innerHTML = `${getTranslation('poweredBy')} <a href="https://consentguard.com" target="_blank" style="color: inherit; text-decoration: underline;">ConsentGuard</a>`;
      contentWrapper.appendChild(poweredBy);
    }
    
    // Add event listeners to buttons
    acceptButton.addEventListener('click', function() {
      manageCookies('accept');
      recordAnalytics('accept');
      hideBanner();
      addSettingsButton(); // Add the settings button after accepting
    });
    
    rejectButton.addEventListener('click', function() {
      manageCookies('reject');
      recordAnalytics('reject');
      hideBanner();
      addSettingsButton(); // Add the settings button after rejecting
    });
    
    customizeButton.addEventListener('click', function() {
      showCustomizePanel();
      recordAnalytics('customize');
    });
    
    // Ensure keyboard navigation works
    acceptButton.tabIndex = 0;
    rejectButton.tabIndex = 0;
    customizeButton.tabIndex = 0;
    
    // Append elements to DOM
    buttonWrapper.appendChild(acceptButton);
    buttonWrapper.appendChild(rejectButton);
    buttonWrapper.appendChild(customizeButton);
    contentWrapper.appendChild(text);
    contentWrapper.appendChild(buttonWrapper);
    banner.appendChild(contentWrapper);
    
    // Add banner to page
    document.body.appendChild(banner);
    
    // Record view analytics
    recordAnalytics('view');
    
    // Set up auto-hide if enabled
    if (config.autoHide && config.autoHideTime > 0) {
      setTimeout(function() {
        hideBanner();
        addSettingsButton(); // Add settings button when auto-hiding
      }, config.autoHideTime * 1000);
    }
  }
  
  /**
   * Hide the banner with animation
   */
  function hideBanner() {
    const banner = document.getElementById('consentguard-banner');
    if (banner) {
      banner.style.transform = config.bannerPosition === 'top' ? 
        'translateY(-100%)' : 'translateY(100%)';
      
      setTimeout(function() {
        banner.remove();
      }, 300);
    }
  }
  
  /**
   * Show a proper customize options panel
   */
  function showCustomizePanel() {
    // Hide the main banner first
    const mainBanner = document.getElementById('consentguard-banner');
    if (mainBanner) {
      mainBanner.style.display = 'none';
    }
    
    // Check if the panel already exists
    let panel = document.getElementById('consentguard-customize-panel');
    if (panel) {
      panel.style.display = 'block';
      return;
    }
    
    // Create the customization panel
    panel = document.createElement('div');
    panel.id = 'consentguard-customize-panel';
    
    // Add ARIA attributes for accessibility
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'consentguard-panel-title');
    panel.setAttribute('aria-describedby', 'consentguard-panel-desc');
    
    // Set position styles similar to the banner
    let positionStyles = '';
    if (config.bannerPosition === 'top') {
      positionStyles = 'top: 0; left: 0; right: 0;';
    } else {
      positionStyles = 'bottom: 0; left: 0; right: 0;';
    }
    
    // Apply styles to panel (use the same color scheme as banner)
    panel.style.cssText = `
      position: fixed;
      ${positionStyles}
      background-color: ${config.bannerColor};
      color: ${config.textColor};
      padding: 20px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 99999;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
      max-height: 80vh;
      overflow-y: auto;
    `;
    
    // Panel header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;';
    
    const title = document.createElement('h3');
    title.id = 'consentguard-panel-title';
    title.textContent = getTranslation('cookiePreferences');
    title.style.cssText = 'margin: 0; font-size: 18px;';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: ${config.textColor};
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      margin: 0;
    `;
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Description
    const description = document.createElement('p');
    description.id = 'consentguard-panel-desc';
    description.textContent = getTranslation('preferencesDescription');
    description.style.cssText = 'margin-bottom: 20px;';
    
    // Create settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';
    
    // Get saved preferences
    const savedPrefs = getSavedPreferences();
    
    // Add cookie categories
    cookieCategories.forEach(category => {
      // Initialize checked state based on saved preferences if available
      if (savedPrefs && savedPrefs.preferences) {
        if (savedPrefs.preferences[category.id] !== undefined) {
          category.checked = savedPrefs.preferences[category.id];
        }
      }
      
      const categoryEl = document.createElement('div');
      categoryEl.style.cssText = 'padding: 15px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px; margin-bottom: 10px;';
      
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
      
      const categoryName = document.createElement('strong');
      categoryName.textContent = category.name;
      categoryName.style.cssText = 'font-size: 16px;';
      
      const toggle = document.createElement('div');
      
      // If the category is required, show "Required" text instead of a toggle
      if (category.required) {
        toggle.textContent = getTranslation('required');
        toggle.style.cssText = 'font-size: 12px; opacity: 0.7; background-color: rgba(255, 255, 255, 0.2); padding: 3px 8px; border-radius: 4px;';
      } else {
        // Create a switch-like toggle
        const switchLabel = document.createElement('label');
        switchLabel.className = 'consentguard-switch';
        switchLabel.style.cssText = `
          position: relative;
          display: inline-block;
          width: 50px;
          height: 26px;
        `;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = category.checked;
        input.id = `consentguard-${category.id}`;
        input.setAttribute('aria-label', `${category.name} consent toggle`);
        input.style.cssText = 'opacity: 0; width: 0; height: 0;';
        
        const slider = document.createElement('span');
        slider.style.cssText = `
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255,255,255,0.3);
          transition: .3s;
          border-radius: 26px;
        `;
        
        // Create the slider ball
        const sliderBall = document.createElement('span');
        sliderBall.style.cssText = `
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        `;
        
        // Move the ball when checked
        if (input.checked) {
          sliderBall.style.transform = 'translateX(24px)';
          slider.style.backgroundColor = config.buttonColor;
        }
        
        // Toggle event
        input.addEventListener('change', function() {
          if (this.checked) {
            sliderBall.style.transform = 'translateX(24px)';
            slider.style.backgroundColor = config.buttonColor;
          } else {
            sliderBall.style.transform = 'translateX(0)';
            slider.style.backgroundColor = 'rgba(255,255,255,0.3)';
          }
        });
        
        // Add keyboard support
        input.addEventListener('keydown', function(event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.checked = !this.checked;
            
            if (this.checked) {
              sliderBall.style.transform = 'translateX(24px)';
              slider.style.backgroundColor = config.buttonColor;
            } else {
              sliderBall.style.transform = 'translateX(0)';
              slider.style.backgroundColor = 'rgba(255,255,255,0.3)';
            }
          }
        });
        
        slider.appendChild(sliderBall);
        switchLabel.appendChild(input);
        switchLabel.appendChild(slider);
        toggle.appendChild(switchLabel);
      }
      
      headerRow.appendChild(categoryName);
      headerRow.appendChild(toggle);
      
      const description = document.createElement('p');
      description.textContent = category.description;
      description.style.cssText = 'margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;';
      
      categoryEl.appendChild(headerRow);
      categoryEl.appendChild(description);
      settingsContainer.appendChild(categoryEl);
    });
    
    // Privacy policy link
    const policyLink = document.createElement('div');
    policyLink.style.cssText = 'margin-top: 15px; font-size: 13px;';
    policyLink.innerHTML = `${getTranslation('privacyPolicy')} <a href="/privacy-policy" style="color: inherit; text-decoration: underline;">${getTranslation('privacyPolicyLink')}</a>`;
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; justify-content: space-between; margin-top: 20px;';
    
    // Accept all button
    const acceptAllBtn = document.createElement('button');
    acceptAllBtn.textContent = getTranslation('acceptAll');
    acceptAllBtn.setAttribute('aria-label', getTranslation('acceptAll'));
    acceptAllBtn.style.cssText = `
      background-color: ${config.buttonColor};
      color: ${config.buttonTextColor};
      border: none;
      padding: 10px 18px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      min-width: 100px;
    `;
    
    // Reject all button
    const rejectAllBtn = document.createElement('button');
    rejectAllBtn.textContent = getTranslation('rejectAll');
    rejectAllBtn.setAttribute('aria-label', getTranslation('rejectAll'));
    rejectAllBtn.style.cssText = `
      background-color: transparent;
      color: ${config.textColor};
      border: 1px solid ${config.textColor};
      padding: 10px 18px;
      border-radius: 4px;
      cursor: pointer;
      min-width: 100px;
    `;
    
    // Save preferences button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = getTranslation('savePreferences');
    saveBtn.setAttribute('aria-label', getTranslation('savePreferences'));
    saveBtn.style.cssText = `
      background-color: ${config.buttonColor};
      color: ${config.buttonTextColor};
      border: none;
      padding: 10px 18px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      min-width: 140px;
    `;
    
    // Add event listeners for buttons
    closeButton.addEventListener('click', function() {
      panel.style.display = 'none';
      const mainBanner = document.getElementById('consentguard-banner');
      if (mainBanner) {
        mainBanner.style.display = 'flex';
      } else {
        createBanner();
      }
    });
    
    acceptAllBtn.addEventListener('click', function() {
      // Set all toggles to checked for visual feedback
      cookieCategories.forEach(category => {
        const toggle = document.getElementById(`consentguard-${category.id}`);
        if (toggle) toggle.checked = true;
      });
      
      setTimeout(() => {
        manageCookies('accept');
        recordAnalytics('accept');
        panel.remove();
        addSettingsButton(); // Add the settings button after accepting
      }, 300);
    });
    
    rejectAllBtn.addEventListener('click', function() {
      // Set all non-required toggles to unchecked for visual feedback
      cookieCategories.forEach(category => {
        if (!category.required) {
          const toggle = document.getElementById(`consentguard-${category.id}`);
          if (toggle) toggle.checked = false;
        }
      });
      
      setTimeout(() => {
        manageCookies('reject');
        recordAnalytics('reject');
        panel.remove();
        addSettingsButton(); // Add the settings button after rejecting
      }, 300);
    });
    
    saveBtn.addEventListener('click', function() {
      // Get user preferences for each category
      const preferences = {};
      cookieCategories.forEach(category => {
        if (category.required) {
          preferences[category.id] = true; // Always true for required
        } else {
          const toggle = document.getElementById(`consentguard-${category.id}`);
          preferences[category.id] = toggle ? toggle.checked : false;
        }
      });
      
      // Store preferences in a cookie and manage cookies
      manageCookies('partial', preferences);
      
      recordAnalytics('partial');
      panel.remove();
      addSettingsButton(); // Add the settings button after saving preferences
    });
    
    // Ensure keyboard navigation works
    acceptAllBtn.tabIndex = 0;
    rejectAllBtn.tabIndex = 0;
    saveBtn.tabIndex = 0;
    closeButton.tabIndex = 0;
    
    // Append buttons to container
    buttonsContainer.appendChild(rejectAllBtn);
    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(acceptAllBtn);
    
    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(description);
    panel.appendChild(settingsContainer);
    panel.appendChild(policyLink);
    panel.appendChild(buttonsContainer);
    
    // Add to page
    document.body.appendChild(panel);
  }
  
  /**
   * Add a small button to re-open cookie settings after dismissal
   */
  function addSettingsButton() {
    // Remove any existing settings button first
    const existingButton = document.getElementById('consentguard-settings-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Create the button
    const settingsButton = document.createElement('button');
    settingsButton.id = 'consentguard-settings-button';
    settingsButton.textContent = getTranslation('cookieSettings');
    settingsButton.setAttribute('aria-label', getTranslation('cookieSettings'));
    settingsButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: ${config.bannerColor};
      color: ${config.textColor};
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      cursor: pointer;
      z-index: 99998;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      opacity: 0.7;
      transition: opacity 0.3s;
    `;
    
    // Add hover effect
    settingsButton.addEventListener('mouseover', function() {
      this.style.opacity = '1';
    });
    
    settingsButton.addEventListener('mouseout', function() {
      this.style.opacity = '0.7';
    });
    
    // Open customize panel on click
    settingsButton.addEventListener('click', function() {
      showCustomizePanel();
    });
    
    // Ensure keyboard navigation works
    settingsButton.tabIndex = 0;
    
    // Add to page
    document.body.appendChild(settingsButton);
  }
  
  /**
   * Initialize the consent manager
   */
  async function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async function() {
        try {
          await fetchConfig();
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
      });
    } else {
      try {
        await fetchConfig();
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
  }
  
  // Start initialization
  init();
})();

