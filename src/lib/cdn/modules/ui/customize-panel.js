
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
  
  // Create the customization panel with modern overlay design
  panel = document.createElement('div');
  panel.id = 'consentguard-customize-panel';
  
  // Add ARIA attributes for accessibility
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'consentguard-panel-title');
  panel.setAttribute('aria-describedby', 'consentguard-panel-desc');
  panel.setAttribute('aria-modal', 'true');
  
  // Create backdrop overlay
  const backdrop = document.createElement('div');
  backdrop.id = 'consentguard-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 99998;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease;
  `;
  
  // Apply modern modal styles to panel
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: ${config.bannerColor};
    color: ${config.textColor};
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
    z-index: 99999;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: calc(100% - 40px);
    max-height: 85vh;
    border-radius: 16px;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  
  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to { 
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add backdrop to page first
  document.body.appendChild(backdrop);
  
  // Panel header with modern styling
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 32px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  `;
  
  const titleWrapper = document.createElement('div');
  
  const title = document.createElement('h3');
  title.id = 'consentguard-panel-title';
  title.textContent = getTranslation('cookiePreferences');
  title.style.cssText = `
    margin: 0 0 4px 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  `;
  
  const subtitle = document.createElement('p');
  subtitle.style.cssText = `
    margin: 0;
    font-size: 14px;
    opacity: 0.7;
    font-weight: 400;
  `;
  subtitle.textContent = 'Manage your cookie preferences';
  
  titleWrapper.appendChild(title);
  titleWrapper.appendChild(subtitle);
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.style.cssText = `
    background: rgba(0, 0, 0, 0.05);
    border: none;
    color: ${config.textColor};
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    margin: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  `;
  
  closeButton.addEventListener('mouseenter', function() {
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    this.style.transform = 'scale(1.05)';
  });
  
  closeButton.addEventListener('mouseleave', function() {
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    this.style.transform = 'scale(1)';
  });
  
  header.appendChild(titleWrapper);
  header.appendChild(closeButton);
  
  // Scrollable content area
  const contentArea = document.createElement('div');
  contentArea.style.cssText = `
    padding: 32px;
    max-height: calc(85vh - 180px);
    overflow-y: auto;
  `;
  
  // Description
  const description = document.createElement('p');
  description.id = 'consentguard-panel-desc';
  description.textContent = getTranslation('preferencesDescription');
  description.style.cssText = `
    margin: 0 0 28px 0;
    line-height: 1.6;
    font-size: 15px;
    opacity: 0.9;
  `;
  
  // Create settings container
  const settingsContainer = document.createElement('div');
  settingsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';
  
  contentArea.appendChild(description);
  
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
    categoryEl.style.cssText = `
      padding: 20px;
      background-color: rgba(0, 0, 0, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease;
    `;
    
    categoryEl.addEventListener('mouseenter', function() {
      this.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
      this.style.borderColor = 'rgba(0, 0, 0, 0.1)';
    });
    
    categoryEl.addEventListener('mouseleave', function() {
      this.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
      this.style.borderColor = 'rgba(0, 0, 0, 0.06)';
    });
    
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
    
    const categoryName = document.createElement('strong');
    categoryName.textContent = category.name;
    categoryName.style.cssText = `
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.01em;
    `;
    
    const toggle = document.createElement('div');
    
    // If the category is required, show "Required" badge instead of a toggle
    if (category.required) {
      toggle.textContent = getTranslation('required');
      toggle.style.cssText = `
        font-size: 12px;
        font-weight: 600;
        background-color: rgba(0, 0, 0, 0.08);
        color: inherit;
        padding: 6px 12px;
        border-radius: 6px;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      `;
    } else {
      // Create a modern switch-like toggle
      const switchLabel = document.createElement('label');
      switchLabel.className = 'consentguard-switch';
      switchLabel.style.cssText = `
        position: relative;
        display: inline-block;
        width: 52px;
        height: 28px;
        cursor: pointer;
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
        background-color: rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 28px;
      `;
      
      // Create the slider ball
      const sliderBall = document.createElement('span');
      sliderBall.style.cssText = `
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
    
    const categoryDesc = document.createElement('p');
    categoryDesc.textContent = category.description;
    categoryDesc.style.cssText = `
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.7;
      line-height: 1.5;
    `;
    
    categoryEl.appendChild(headerRow);
    categoryEl.appendChild(categoryDesc);
    settingsContainer.appendChild(categoryEl);
  });
  
  // Privacy policy link
  const policyLink = document.createElement('div');
  policyLink.style.cssText = `
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    font-size: 13px;
    opacity: 0.8;
  `;
  policyLink.innerHTML = `${getTranslation('privacyPolicy')} <a href="/privacy-policy" style="color: inherit; text-decoration: underline; font-weight: 500;">${getTranslation('privacyPolicyLink')}</a>`;
  
  contentArea.appendChild(settingsContainer);
  contentArea.appendChild(policyLink);
  
  // Footer with buttons
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 20px 32px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    background-color: rgba(0, 0, 0, 0.02);
  `;
  
  // Buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.cssText = `
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  `;
  
  // Reject all button
  const rejectAllBtn = document.createElement('button');
  rejectAllBtn.textContent = getTranslation('rejectAll');
  rejectAllBtn.setAttribute('aria-label', getTranslation('rejectAll'));
  rejectAllBtn.style.cssText = `
    background-color: transparent;
    color: ${config.textColor};
    border: 1px solid rgba(0, 0, 0, 0.15);
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    flex: 1;
    min-width: 120px;
    transition: all 0.2s ease;
  `;
  
  rejectAllBtn.addEventListener('mouseenter', function() {
    this.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    this.style.borderColor = 'rgba(0, 0, 0, 0.2)';
  });
  
  rejectAllBtn.addEventListener('mouseleave', function() {
    this.style.backgroundColor = 'transparent';
    this.style.borderColor = 'rgba(0, 0, 0, 0.15)';
  });
  
  // Save preferences button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = getTranslation('savePreferences');
  saveBtn.setAttribute('aria-label', getTranslation('savePreferences'));
  saveBtn.style.cssText = `
    background-color: ${config.buttonColor};
    color: ${config.buttonTextColor};
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 15px;
    flex: 2;
    min-width: 160px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  `;
  
  saveBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-1px)';
    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
  });
  
  saveBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
  });
  
  // Add event listeners for buttons
  closeButton.addEventListener('click', function() {
    panel.remove();
    backdrop.remove();
    const mainBanner = document.getElementById('consentguard-banner');
    if (mainBanner) {
      mainBanner.style.display = 'flex';
    } else {
      createBanner();
    }
  });
  
  backdrop.addEventListener('click', function() {
    panel.remove();
    backdrop.remove();
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
      backdrop.remove();
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
      backdrop.remove();
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
    backdrop.remove();
    addSettingsButton(); // Add the settings button after saving preferences
  });
  
  // Ensure keyboard navigation works
  rejectAllBtn.tabIndex = 0;
  saveBtn.tabIndex = 0;
  closeButton.tabIndex = 0;
  
  // Append buttons to container
  buttonsContainer.appendChild(rejectAllBtn);
  buttonsContainer.appendChild(saveBtn);
  
  footer.appendChild(buttonsContainer);
  
  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(contentArea);
  panel.appendChild(footer);
  
  // Add to page
  document.body.appendChild(panel);
  
  // Focus management for accessibility
  closeButton.focus();
}
