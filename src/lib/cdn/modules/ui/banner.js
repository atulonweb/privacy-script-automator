
/**
 * Banner UI for ConsentGuard
 */

import { config } from '../core.js';
import { getTranslation } from '../translations.js';
import { manageCookies } from '../cookies.js';
import { recordAnalytics } from '../analytics.js';
import { addSettingsButton } from './settings-button.js';
import { showCustomizePanel } from './customize-panel.js';

/**
 * Create and display the consent banner
 */
export function createBanner() {
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
export function hideBanner() {
  const banner = document.getElementById('consentguard-banner');
  if (banner) {
    banner.style.transform = config.bannerPosition === 'top' ? 
      'translateY(-100%)' : 'translateY(100%)';
    
    setTimeout(function() {
      banner.remove();
    }, 300);
  }
}
