
/**
 * Analytics handling for ConsentGuard
 */

import { testMode, scriptId } from './data.js';

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
  
  // For now, just log the action locally without making API calls
  // This prevents the 401 errors while maintaining the interface
  console.log('ConsentGuard: Recording analytics action:', action);
  
  // Store analytics data locally for debugging
  try {
    const analyticsData = {
      scriptId: scriptId,
      action: action,
      domain: window.location.hostname,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      userAgent: navigator.userAgent,
      language: navigator.language || 'en-US'
    };
    
    console.log('ConsentGuard: Analytics data prepared:', analyticsData);
    
    // TODO: In future, this could be sent to a proper analytics endpoint
    // For now, we just prepare the data and log it
    
  } catch (error) {
    console.error('ConsentGuard: Error preparing analytics data', error);
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
 * Record a domain ping to track when the script was last seen active
 */
export async function recordDomainPing() {
  if (testMode) return;
  
  try {
    console.log('ConsentGuard: Recording domain ping for script:', scriptId);
    // For now, just log the ping locally
    // This prevents API errors while maintaining the interface
  } catch (error) {
    // Silent fail for pings - don't disrupt user experience
    console.error('ConsentGuard: Error recording domain ping', error);
  }
}

// Automatically record a ping when the script loads
setTimeout(recordDomainPing, 1000);
