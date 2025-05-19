
/**
 * Analytics handling for ConsentGuard
 */

import { API_ENDPOINT, testMode, scriptId } from './data.js';

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
    // Get the domain information
    const domain = window.location.hostname;
    const currentUrl = window.location.href;
    
    // Get approximate geo information without IP lookup
    const language = navigator.language || 'en-US';
    let region = 'other';
    
    if (language.includes('en-US') || language.includes('en-CA')) {
      region = 'us';
    } else if (language.match(/^(de|fr|es|it|nl|pt|sv|da|fi|el|cs|et|lv|lt|pl|sk|sl|bg|ro|hr)-?/)) {
      region = 'eu'; 
    }

    // Send analytics data
    await fetch(`${API_ENDPOINT}/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scriptId: scriptId,
        action: action,
        domain: domain,
        url: currentUrl,
        timestamp: new Date().toISOString(),
        region: region,
        // Add unique visitor tracking
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        userAgent: navigator.userAgent,
        language: language
      })
    });
    
    // Also record a domain activity entry to store detailed data
    recordDomainActivity(action);
  } catch (error) {
    console.error('ConsentGuard: Error recording analytics', error);
  }
}

/**
 * Get or create a unique session ID for this browser session
 * This allows identifying unique visitors across multiple consent events
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('cg_session_id');
  
  if (!sessionId) {
    // Generate a simple session ID
    sessionId = 'cg_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('cg_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Get or create a unique visitor ID that persists across sessions
 * This allows tracking unique visitors more accurately
 */
function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('cg_visitor_id');
  
  if (!visitorId) {
    // Generate a simple visitor ID
    visitorId = 'cgv_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cg_visitor_id', visitorId);
  }
  
  return visitorId;
}

/**
 * Record detailed domain activity for better analytics
 * @param {string} eventType - The type of event (ping, view, accept, reject, partial)
 */
async function recordDomainActivity(eventType) {
  if (testMode) return;
  
  try {
    const domain = window.location.hostname;
    const currentUrl = window.location.href;
    
    // Get browser language for rough geo determination
    const language = navigator.language || 'en-US';
    let region = 'other';
    
    if (language.includes('en-US') || language.includes('en-CA')) {
      region = 'us';
    } else if (language.match(/^(de|fr|es|it|nl|pt|sv|da|fi|el|cs|et|lv|lt|pl|sk|sl|bg|ro|hr)-?/)) {
      region = 'eu'; 
    }
    
    await fetch(`${API_ENDPOINT}/domain-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scriptId: scriptId,
        eventType: eventType,
        domain: domain,
        url: currentUrl,
        visitorId: getOrCreateVisitorId(),
        sessionId: getOrCreateSessionId(),
        userAgent: navigator.userAgent,
        region: region,
        language: language
      })
    });
  } catch (error) {
    // Silent fail for activity recording - don't disrupt user experience
    console.error('ConsentGuard: Error recording domain activity', error);
  }
}

/**
 * Record a domain ping to track when the script was last seen active
 */
export async function recordDomainPing() {
  if (testMode) return;
  
  try {
    await recordDomainActivity('ping');
  } catch (error) {
    // Silent fail for pings - don't disrupt user experience
    console.error('ConsentGuard: Error recording domain ping', error);
  }
}

// Automatically record a ping when the script loads
setTimeout(recordDomainPing, 1000);
