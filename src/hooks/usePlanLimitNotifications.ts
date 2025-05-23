import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type NotificationKey = 'plan_limit_exceeded' | 'feature_restricted';

/**
 * Hook to manage plan limit notifications
 * Ensures notifications are only shown once per browsing session
 */
const usePlanLimitNotifications = () => {
  // Use state to keep track of shown notifications in the current component instance
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  // Initialize from session storage on component mount
  useEffect(() => {
    try {
      const storedNotifications = sessionStorage.getItem('shownNotifications');
      if (storedNotifications) {
        setShownNotifications(new Set(JSON.parse(storedNotifications)));
      }
    } catch (error) {
      console.error('Error loading notification state from session storage:', error);
    }
  }, []);

  // Save to session storage whenever shownNotifications changes
  useEffect(() => {
    if (shownNotifications.size > 0) {
      try {
        sessionStorage.setItem('shownNotifications', JSON.stringify([...shownNotifications]));
      } catch (error) {
        console.error('Error saving notification state to session storage:', error);
      }
    }
  }, [shownNotifications]);

  // Check if notification was already shown this session
  const hasShownNotification = (key: NotificationKey, details?: string) => {
    const notificationId = details ? `${key}_${details}` : key;
    return shownNotifications.has(notificationId);
  };

  // Mark notification as shown
  const markNotificationShown = (key: NotificationKey, details?: string) => {
    const notificationId = details ? `${key}_${details}` : key;
    setShownNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  };

  // Show one-time notification
  const showOneTimeNotification = (
    key: NotificationKey, 
    title: string, 
    description: string, 
    type: 'error' | 'warning' = 'warning',
    details?: string,
    forceShow: boolean = false
  ) => {
    if (forceShow || !hasShownNotification(key, details)) {
      if (type === 'error') {
        toast.error(title, { description });
      } else {
        toast.warning(title, { description });
      }
      markNotificationShown(key, details);
    }
  };

  // Reset notifications (useful for testing or when plan changes)
  const resetNotifications = () => {
    setShownNotifications(new Set());
    try {
      sessionStorage.removeItem('shownNotifications');
    } catch (error) {
      console.error('Error clearing notification state from session storage:', error);
    }
  };

  return {
    showOneTimeNotification,
    hasShownNotification,
    resetNotifications
  };
};

export default usePlanLimitNotifications;
