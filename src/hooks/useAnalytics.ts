import { useCallback } from 'react';

export type EventCategory = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'module_interaction'
  | 'content_generation'
  | 'user_preference'
  | 'error';

export type AnalyticsEvent = {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
};

/**
 * Custom hook for tracking user interactions and events
 * 
 * @returns Object with tracking functions
 */
export const useAnalytics = () => {
  /**
   * Track a user event
   * 
   * @param event The analytics event to track
   */
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // In a real implementation, this would send data to your analytics service
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
    
    // Here you would typically call your analytics service
    // Example: analyticsService.trackEvent(event);
  }, []);

  /**
   * Track a page view
   * 
   * @param pageName The name of the page being viewed
   * @param metadata Additional data about the page view
   */
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    trackEvent({
      category: 'page_view',
      action: 'view',
      label: pageName,
      metadata
    });
  }, [trackEvent]);

  /**
   * Track a button click
   * 
   * @param buttonName The name or identifier of the button
   * @param metadata Additional data about the button click
   */
  const trackButtonClick = useCallback((buttonName: string, metadata?: Record<string, any>) => {
    trackEvent({
      category: 'button_click',
      action: 'click',
      label: buttonName,
      metadata
    });
  }, [trackEvent]);

  /**
   * Track a form submission
   * 
   * @param formName The name or identifier of the form
   * @param metadata Additional data about the form submission
   */
  const trackFormSubmit = useCallback((formName: string, metadata?: Record<string, any>) => {
    trackEvent({
      category: 'form_submit',
      action: 'submit',
      label: formName,
      metadata
    });
  }, [trackEvent]);

  /**
   * Track module interaction
   * 
   * @param moduleName The name of the module being interacted with
   * @param action The specific action taken (e.g., 'open', 'close', 'configure')
   * @param metadata Additional data about the interaction
   */
  const trackModuleInteraction = useCallback((
    moduleName: string, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'module_interaction',
      action,
      label: moduleName,
      metadata
    });
  }, [trackEvent]);

  /**
   * Track content generation
   * 
   * @param contentType The type of content being generated
   * @param metadata Additional data about the content generation
   */
  const trackContentGeneration = useCallback((
    contentType: string,
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'content_generation',
      action: 'generate',
      label: contentType,
      metadata
    });
  }, [trackEvent]);

  /**
   * Track an error that occurred
   * 
   * @param errorMessage The error message
   * @param errorCode Optional error code
   * @param metadata Additional data about the error
   */
  const trackError = useCallback((
    errorMessage: string,
    errorCode?: string,
    metadata?: Record<string, any>
  ) => {
    trackEvent({
      category: 'error',
      action: errorCode || 'error',
      label: errorMessage,
      metadata
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
    trackModuleInteraction,
    trackContentGeneration,
    trackError
  };
};

export default useAnalytics;