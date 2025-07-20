/**
 * Analytics handling for ConsentGuard
 * Records analytics data to the database via edge function
 */

import { testMode, scriptId } from './data.js';

/**
 * Record analytics data to the database
 * @param {string} action - The user action (view, accept, reject, partial)
 */
export async function recordAnalytics(action) {
  console.log('ConsentGuard: Recording analytics action:', action);
  
  if (testMode) {
    console.log('ConsentGuard: Test mode - analytics logged locally only');
    return;
  }
  
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
    
    console.log('ConsentGuard: Sending analytics data:', analyticsData);
    
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
    
    // Send analytics data to the edge function
    try {
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-analytics/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ConsentGuard: Analytics API error:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('ConsentGuard: Analytics recorded successfully:', result);
      }
    } catch (apiError) {
      console.error('ConsentGuard: Error sending analytics data:', apiError);
    }
    
    // Also record domain activity
    try {
      await recordDomainActivity(action, analyticsData);
    } catch (activityError) {
      console.error('ConsentGuard: Error recording domain activity:', activityError);
    }
    
  } catch (error) {
    console.error('ConsentGuard: Error in recordAnalytics:', error);
  }
}

/**
 * Record domain activity to track detailed user interactions
 */
async function recordDomainActivity(eventType, analyticsData) {
  const activityData = {
    scriptId: analyticsData.scriptId,
    eventType: eventType,
    domain: analyticsData.domain,
    url: analyticsData.url,
    visitorId: analyticsData.visitorId,
    sessionId: analyticsData.sessionId,
    userAgent: analyticsData.userAgent,
    region: 'other', // Default region - could be enhanced with IP geolocation
    language: analyticsData.language
  };
  
  try {
    const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-analytics/domain-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ConsentGuard: Domain activity API error:', response.status, errorText);
    } else {
      const result = await response.json();
      console.log('ConsentGuard: Domain activity recorded successfully:', result);
    }
  } catch (error) {
    console.error('ConsentGuard: Error sending domain activity:', error);
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
 * Record a domain ping to track website activity
 */
export async function recordDomainPing() {
  console.log('ConsentGuard: Recording domain ping for script:', scriptId);
  
  if (testMode) {
    console.log('ConsentGuard: Test mode - ping logged locally only');
    return;
  }
  
  try {
    const pingData = {
      scriptId: scriptId,
      domain: window.location.hostname,
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      userAgent: navigator.userAgent,
      region: 'other',
      language: navigator.language || 'en-US'
    };
    
    console.log('ConsentGuard: Sending ping data:', pingData);
    
    // Store locally for debugging
    try {
      sessionStorage.setItem('cg_last_ping', JSON.stringify(pingData));
    } catch (storageError) {
      console.log('ConsentGuard: Could not store ping data:', storageError);
    }
    
    // Send ping to edge function
    try {
      const response = await fetch('https://rzmfwwkumniuwenammaj.supabase.co/functions/v1/consent-analytics/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pingData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ConsentGuard: Ping API error:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('ConsentGuard: Ping recorded successfully:', result);
      }
    } catch (apiError) {
      console.error('ConsentGuard: Error sending ping:', apiError);
    }
    
  } catch (error) {
    console.log('ConsentGuard: Error in recordDomainPing:', error);
  }
}

// Set up automatic ping every 30 seconds to track activity
setTimeout(() => {
  recordDomainPing();
  setInterval(recordDomainPing, 30000);
}, 1000);

console.log('ConsentGuard: Analytics module loaded - API calls enabled');
