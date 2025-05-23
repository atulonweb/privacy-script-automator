
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type NotificationKey = 'plan_limit_exceeded' | 'feature_restricted';

const usePlanLimitNotifications = () => {
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  // Check if notification was already shown this session
  const hasShownNotification = (key: NotificationKey, details?: string) => {
    const notificationId = details ? `${key}_${details}` : key;
    return shownNotifications.has(notificationId);
  };

  // Mark notification as shown
  const markNotificationShown = (key: NotificationKey, details?: string) => {
    const notificationId = details ? `${key}_${details}` : key;
    setShownNotifications(prev => new Set(prev).add(notificationId));
  };

  // Show one-time notification
  const showOneTimeNotification = (
    key: NotificationKey, 
    title: string, 
    description: string, 
    type: 'error' | 'warning' = 'warning',
    details?: string
  ) => {
    if (!hasShownNotification(key, details)) {
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
  };

  return {
    showOneTimeNotification,
    hasShownNotification,
    resetNotifications
  };
};

export default usePlanLimitNotifications;
