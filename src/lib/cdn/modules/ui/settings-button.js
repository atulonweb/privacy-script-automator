
/**
 * Settings button UI for ConsentGuard
 */

import { config } from '../core.js';
import { getTranslation } from '../translations.js';
import { showCustomizePanel } from './customize-panel.js';

/**
 * Add a small button to re-open cookie settings after dismissal
 */
export function addSettingsButton() {
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
