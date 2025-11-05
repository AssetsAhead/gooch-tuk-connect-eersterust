import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/components/AnalyticsTracker';
import { useSecureAuth } from '@/hooks/useSecureAuth';

// Enhanced analytics hook for comprehensive usage tracking
export const useAnalyticsTracking = () => {
  const analytics = useAnalytics();
  const location = useLocation();
  const { user, getPrimaryRole } = useSecureAuth();

  // Track page views automatically
  React.useEffect(() => {
    analytics.trackPageView();
    
    // Track role-specific page access patterns
    const userRole = getPrimaryRole();
    if (userRole) {
      analytics.trackFeatureUsage('role_portal_access', {
        role: userRole,
        portal: location.pathname,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname, analytics, getPrimaryRole, user?.id]);

  // Enhanced tracking methods for UX research
  const trackPortalTransition = React.useCallback((fromPortal: string, toPortal: string) => {
    analytics.trackFeatureUsage('portal_transition', {
      from_portal: fromPortal,
      to_portal: toPortal,
      user_role: getPrimaryRole(),
      transition_time: new Date().toISOString()
    });
  }, [analytics, getPrimaryRole]);

  const trackFormInteraction = React.useCallback((formName: string, fieldName: string, action: 'focus' | 'blur' | 'input') => {
    analytics.trackEvent('form_submit', {
      form_name: formName,
      field_name: fieldName,
      action,
      user_role: getPrimaryRole(),
      page: location.pathname
    });
  }, [analytics, getPrimaryRole, location.pathname]);

  const trackSearchQuery = React.useCallback((query: string, results: number, context?: string) => {
    analytics.trackFeatureUsage('search', {
      query: query.toLowerCase(), // For autocomplete patterns
      results_count: results,
      context,
      user_role: getPrimaryRole()
    });
  }, [analytics, getPrimaryRole]);

  const trackUserPreference = React.useCallback((preferenceType: string, preferenceValue: any) => {
    analytics.trackFeatureUsage('user_preference', {
      preference_type: preferenceType,
      preference_value: preferenceValue,
      user_role: getPrimaryRole(),
      page: location.pathname
    });
  }, [analytics, getPrimaryRole, location.pathname]);

  const trackTaskCompletion = React.useCallback((taskName: string, completionTime: number, success: boolean) => {
    analytics.trackFeatureUsage('task_completion', {
      task_name: taskName,
      completion_time_ms: completionTime,
      success,
      user_role: getPrimaryRole(),
      page: location.pathname
    });
  }, [analytics, getPrimaryRole, location.pathname]);

  const trackErrorEncounter = React.useCallback((errorType: string, errorMessage: string, context?: Record<string, any>) => {
    analytics.trackEvent('feature_used', {
      error_type: errorType,
      error_message: errorMessage,
      user_role: getPrimaryRole(),
      page: location.pathname,
      ...context
    });
  }, [analytics, getPrimaryRole, location.pathname]);

  return {
    trackPortalTransition,
    trackFormInteraction,
    trackSearchQuery,
    trackUserPreference,
    trackTaskCompletion,
    trackErrorEncounter,
    ...analytics
  };
};