/**
 * Analytics handling for ConsentGuard
 * NOTE: All API calls removed to prevent 401 errors
 * This version only does local logging and data preparation
 */

import { testMode, scriptId } from './data.js';

/**
 * Record analytics data locally (no API calls)
 * @param {string} action - The user action (view, accept, reject, partial)
 */
export async function recordAnalytics(action) {
  console.log('ConsentGuard: Recording analytics action locally:', action);
  
  // Always skip API calls to prevent 401 errors
  if (testMode) {
    console.log('ConsentGuard: Test mode - analytics logged locally only');
  }
  
  // Prepare analytics data locally for debugging and future use
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
    
    console.log('ConsentGuard: Analytics data prepared locally:', analyticsData);
    
    // Store in sessionStorage for debugging purposes
    try {
      const existingData = JSON.parse(sessionStorage.getItem('cg_analytics_log') || '[]');
      existingData.push(analyticsData);
      // Keep only last 10 entries to prevent storage overflow
      const recentData = existingData.slice(-10);
      sessionStorage.setItem('cg_analytics_log', JSON.stringify(recentData));
    } catch (storageError) {
      console.log('ConsentGuard: Could not store analytics data in sessionStorage:', storageError);
    }
    
    // NO API CALLS - prevents 401 errors completely
    console.log('ConsentGuard: Analytics recorded locally only (no API calls made)');
    
  } catch (error) {
    console.error('ConsentGuard: Error preparing analytics data locally:', error);
  }
}

/**
 * Get or create a unique session ID for this browser session
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem('cg_session_id');
  
  if (!sessionId) {
    sessionId = 'cg_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('cg_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Get or create a unique visitor ID that persists across sessions
 */
function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem('cg_visitor_id');
  
  if (!visitorId) {
    visitorId = 'cgv_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cg_visitor_id', visitorId);
  }
  
  return visitorId;
}

/**
 * Record a domain ping locally (no API calls)
 */
export async function recordDomainPing() {
  console.log('ConsentGuard: Recording domain ping locally for script:', scriptId);
  
  // NO API CALLS - just local logging to prevent 401 errors
  try {
    const pingData = {
      scriptId: scriptId,
      domain: window.location.hostname,
      timestamp: new Date().toISOString(),
      type: 'ping'
    };
    
    console.log('ConsentGuard: Domain ping data prepared locally:', pingData);
    
    // Store locally for debugging
    try {
      sessionStorage.setItem('cg_last_ping', JSON.stringify(pingData));
    } catch (storageError) {
      console.log('ConsentGuard: Could not store ping data:', storageError);
    }
    
  } catch (error) {
    console.log('ConsentGuard: Error preparing domain ping data:', error);
  }
}

// Remove automatic ping to prevent any potential API calls on script load
// setTimeout(recordDomainPing, 1000); // REMOVED - no automatic pings
console.log('ConsentGuard: Analytics module loaded - all API calls disabled to prevent 401 errors');
