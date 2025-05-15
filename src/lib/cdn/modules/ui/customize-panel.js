
/**
 * Customize panel UI for ConsentGuard
 */

import { config } from '../core.js';
import { getTranslation } from '../translations.js';
import { cookieCategories } from '../categories.js';
import { manageCookies } from '../cookies.js';
import { recordAnalytics } from '../analytics.js';
import { createBanner, hideBanner } from './banner.js';
import { addSettingsButton } from './settings-button.js';
import { getSavedPreferences } from '../data.js';

/**
 * Show a proper customize options panel
 */
export function showCustomizePanel() {
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
