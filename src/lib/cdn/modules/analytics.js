
/**
 * Analytics handling for ConsentGuard
 */

import { API_ENDPOINT, testMode } from './data.js';

/**
 * Record analytics data
 * @param {string} action - The user action (view, accept, reject, partial)
 */
export async function recordAnalytics(action) {
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
        action: action
      })
    });
  } catch (error) {
    console.error('ConsentGuard: Error recording analytics', error);
  }
}
