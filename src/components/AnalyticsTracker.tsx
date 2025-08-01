import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: 'page_view' | 'button_click' | 'form_submit' | 'feature_used' | 'emergency_alert';
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  page_url: string;
  user_agent: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async init() {
    try {
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id;
      
      // Track initial page view
      this.trackPageView();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  async trackEvent(eventType: AnalyticsEvent['event_type'], eventData: Record<string, any> = {}) {
    if (!this.isInitialized) return;

    try {
      const event: Omit<AnalyticsEvent, 'id' | 'created_at'> = {
        event_type: eventType,
        event_data: eventData,
        user_id: this.userId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      // Store in Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert([event]);

      if (error) throw error;

      // Also store locally for offline capability
      this.storeOfflineEvent(event);
      
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Fallback to offline storage
      this.storeOfflineEvent({
        event_type: eventType,
        event_data: eventData,
        user_id: this.userId,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      });
    }
  }

  private storeOfflineEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>) {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      offlineEvents.push(event);
      localStorage.setItem('offline_analytics', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('Offline storage error:', error);
    }
  }

  async syncOfflineEvents() {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      if (offlineEvents.length === 0) return;

      const { error } = await supabase
        .from('analytics_events')
        .insert(offlineEvents);

      if (!error) {
        localStorage.removeItem('offline_analytics');
        console.log(`Synced ${offlineEvents.length} offline analytics events`);
      }
    } catch (error) {
      console.error('Analytics sync error:', error);
    }
  }

  trackPageView() {
    this.trackEvent('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      referrer: document.referrer
    });
  }

  trackButtonClick(buttonName: string, context?: Record<string, any>) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      ...context
    });
  }

  trackFormSubmit(formName: string, formData?: Record<string, any>) {
    this.trackEvent('form_submit', {
      form_name: formName,
      form_data: formData
    });
  }

  trackFeatureUsage(featureName: string, featureData?: Record<string, any>) {
    this.trackEvent('feature_used', {
      feature_name: featureName,
      feature_data: featureData
    });
  }

  trackEmergencyAlert(alertType: string, alertData?: Record<string, any>) {
    this.trackEvent('emergency_alert', {
      alert_type: alertType,
      alert_data: alertData
    });
  }

  // Performance tracking
  trackPerformance() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.trackEvent('page_view', {
          load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_ready: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          network_type: (navigator as any).connection?.effectiveType,
          connection_downlink: (navigator as any).connection?.downlink
        });
      }
    }
  }

  // User engagement tracking
  trackEngagement() {
    let startTime = Date.now();
    let isActive = true;

    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Date.now() - startTime;
        this.trackEvent('page_view', { time_on_page: timeSpent });
      }
    };

    // Track user activity
    ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        if (!isActive) {
          isActive = true;
          startTime = Date.now();
        }
      });
    });

    // Track when user becomes inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isActive = false;
        trackTimeOnPage();
      } else {
        isActive = true;
        startTime = Date.now();
      }
    });

    // Track before page unload
    window.addEventListener('beforeunload', trackTimeOnPage);
  }
}

// Global analytics instance
const analytics = new AnalyticsTracker();

// React component for analytics setup
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Sync offline events on app load
    analytics.syncOfflineEvents();

    // Track performance metrics
    analytics.trackPerformance();

    // Set up engagement tracking
    analytics.trackEngagement();

    // Set up periodic sync for offline events
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        analytics.syncOfflineEvents();
      }
    }, 30000); // Sync every 30 seconds when online

    return () => clearInterval(syncInterval);
  }, []);

  return <>{children}</>;
};

// Hook for using analytics in components
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackFormSubmit: analytics.trackFormSubmit.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackEmergencyAlert: analytics.trackEmergencyAlert.bind(analytics)
  };
};

export default analytics;