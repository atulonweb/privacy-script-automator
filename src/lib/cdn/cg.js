
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
    autoHideTime: 30
  };
  
  // API endpoint using the Supabase Edge Function
  const API_ENDPOINT = 'https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-config';
  
  /**
   * Fetch configuration from the API
   */
  async function fetchConfig() {
    try {
      const response = await fetch(`${API_ENDPOINT}?scriptId=${scriptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch configuration');
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
    
    document.cookie = `consentguard_consent=${choice}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // If we have specific preferences, store them too
    if (preferences) {
      const preferencesJson = JSON.stringify(preferences);
      document.cookie = `consentguard_preferences=${encodeURIComponent(preferencesJson)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }
    
    if (choice === 'reject') {
      // If rejected, you might want to disable certain cookies or tracking
      // This is where you would implement cookie blocking logic
    }
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
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = 'flex: 1; margin-right: 20px;';
    
    // Create main text
    const text = document.createElement('p');
    text.style.cssText = 'margin: 0 0 10px 0;';
    text.textContent = 'This website uses cookies to ensure you get the best experience on our website.';
    
    // Create button wrapper
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap;';
    
    // Create accept button
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept All';
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
    rejectButton.textContent = 'Reject All';
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
    customizeButton.textContent = 'Customize';
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
      poweredBy.innerHTML = 'Powered by <a href="https://consentguard.com" target="_blank" style="color: inherit; text-decoration: underline;">ConsentGuard</a>';
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
    title.textContent = 'Cookie Preferences';
    title.style.cssText = 'margin: 0; font-size: 18px;';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
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
    description.textContent = 'Customize your cookie preferences below. Some cookies are essential for the website to function and cannot be disabled.';
    description.style.cssText = 'margin-bottom: 20px;';
    
    // Cookie categories
    const categories = [
      {
        id: 'necessary',
        name: 'Necessary Cookies',
        description: 'These cookies are essential for the website to function and cannot be disabled.',
        required: true
      },
      {
        id: 'functional',
        name: 'Functional Cookies',
        description: 'These cookies enable website functionality and personalized features.',
        required: false
      },
      {
        id: 'analytics',
        name: 'Analytics Cookies',
        description: 'These cookies help us understand how visitors interact with our website.',
        required: false
      },
      {
        id: 'marketing',
        name: 'Marketing Cookies',
        description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
        required: false
      }
    ];
    
    // Create settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';
    
    // Add cookie categories
    categories.forEach(category => {
      const categoryEl = document.createElement('div');
      categoryEl.style.cssText = 'padding: 10px; background-color: rgba(255, 255, 255, 0.1); border-radius: 4px;';
      
      const headerRow = document.createElement('div');
      headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
      
      const categoryName = document.createElement('strong');
      categoryName.textContent = category.name;
      
      const toggle = document.createElement('div');
      
      // If the category is required, show "Required" text instead of a toggle
      if (category.required) {
        toggle.textContent = 'Required';
        toggle.style.cssText = 'font-size: 12px; opacity: 0.7;';
      } else {
        // Create a switch-like toggle
        const switchLabel = document.createElement('label');
        switchLabel.className = 'consentguard-switch';
        switchLabel.style.cssText = `
          position: relative;
          display: inline-block;
          width: 40px;
          height: 24px;
        `;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = true; // Default to checked
        input.id = `consentguard-${category.id}`;
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
          border-radius: 24px;
        `;
        
        // Create the slider ball
        const sliderBall = document.createElement('span');
        sliderBall.style.cssText = `
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        `;
        
        // Move the ball when checked
        if (input.checked) {
          sliderBall.style.transform = 'translateX(16px)';
          slider.style.backgroundColor = config.buttonColor;
        }
        
        // Toggle event
        input.addEventListener('change', function() {
          if (this.checked) {
            sliderBall.style.transform = 'translateX(16px)';
            slider.style.backgroundColor = config.buttonColor;
          } else {
            sliderBall.style.transform = 'translateX(0)';
            slider.style.backgroundColor = 'rgba(255,255,255,0.3)';
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
      description.style.cssText = 'margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;';
      
      categoryEl.appendChild(headerRow);
      categoryEl.appendChild(description);
      settingsContainer.appendChild(categoryEl);
    });
    
    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; justify-content: space-between; margin-top: 20px;';
    
    // Accept all button
    const acceptAllBtn = document.createElement('button');
    acceptAllBtn.textContent = 'Accept All';
    acceptAllBtn.style.cssText = `
      background-color: ${config.buttonColor};
      color: ${config.buttonTextColor};
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    `;
    
    // Reject all button
    const rejectAllBtn = document.createElement('button');
    rejectAllBtn.textContent = 'Reject All';
    rejectAllBtn.style.cssText = `
      background-color: transparent;
      color: ${config.textColor};
      border: 1px solid ${config.textColor};
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    `;
    
    // Save preferences button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Preferences';
    saveBtn.style.cssText = `
      background-color: ${config.buttonColor};
      color: ${config.buttonTextColor};
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
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
      manageCookies('accept');
      recordAnalytics('accept');
      panel.remove();
      addSettingsButton(); // Add the settings button after accepting
    });
    
    rejectAllBtn.addEventListener('click', function() {
      manageCookies('reject');
      recordAnalytics('reject');
      panel.remove();
      addSettingsButton(); // Add the settings button after rejecting
    });
    
    saveBtn.addEventListener('click', function() {
      // Get user preferences
      const functional = document.getElementById('consentguard-functional')?.checked || false;
      const analytics = document.getElementById('consentguard-analytics')?.checked || false;
      const marketing = document.getElementById('consentguard-marketing')?.checked || false;
      
      // Create a preference object
      const preferences = {
        necessary: true, // Always required
        functional,
        analytics,
        marketing
      };
      
      // Store preferences in a cookie and manage cookies
      manageCookies('partial', preferences);
      
      recordAnalytics('partial');
      panel.remove();
      addSettingsButton(); // Add the settings button after saving preferences
    });
    
    // Append buttons to container
    buttonsContainer.appendChild(rejectAllBtn);
    buttonsContainer.appendChild(saveBtn);
    buttonsContainer.appendChild(acceptAllBtn);
    
    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(description);
    panel.appendChild(settingsContainer);
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
    settingsButton.textContent = 'Cookie Settings';
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
        await fetchConfig();
        const hasConsent = document.cookie.includes('consentguard_consent=');
        
        if (!hasConsent) {
          createBanner();
        } else {
          addSettingsButton();
        }
      });
    } else {
      await fetchConfig();
      const hasConsent = document.cookie.includes('consentguard_consent=');
      
      if (!hasConsent) {
        createBanner();
      } else {
        addSettingsButton();
      }
    }
  }
  
  // Start initialization
  init();
})();
