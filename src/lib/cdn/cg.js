
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
  
  // API endpoint (replace with your actual API endpoint)
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
   */
  function manageCookies(choice) {
    // Set a consent cookie to remember user's choice
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // Cookie valid for 6 months
    
    document.cookie = `consentguard_consent=${choice}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    if (choice === 'reject') {
      // If rejected, you might want to disable certain cookies or tracking
      // This is where you would implement cookie blocking logic
    }
  }
  
  /**
   * Create and display the consent banner
   */
  function createBanner() {
    // Check if user has already provided consent
    if (document.cookie.includes('consentguard_consent=')) {
      return; // Don't show banner if consent already given
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
    });
    
    rejectButton.addEventListener('click', function() {
      manageCookies('reject');
      recordAnalytics('reject');
      hideBanner();
    });
    
    customizeButton.addEventListener('click', function() {
      showCustomizePanel();
      recordAnalytics('partial');
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
   * Show customize options panel (simplified version)
   */
  function showCustomizePanel() {
    // This is a simplified version
    // In a real implementation, you would show a modal with checkboxes
    // for different cookie categories
    alert('This would show a panel with customization options for different cookie categories.');
    manageCookies('partial');
    hideBanner();
  }
  
  /**
   * Initialize the consent manager
   */
  async function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', async function() {
        await fetchConfig();
        createBanner();
      });
    } else {
      await fetchConfig();
      createBanner();
    }
  }
  
  // Start initialization
  init();
})();
