/**
 * Unified Analytics Event Dispatcher for Logic Intelligence Technologies
 * Dispatches standard tracking events across the business platform.
 */

export type PlatformEvent =
  | 'page_view'
  | 'cta_click'
  | 'contact_start'
  | 'contact_submit'
  | 'demo_start'
  | 'demo_submit'
  | 'discovery_start'
  | 'discovery_submit'
  | 'consultation_booked'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'newsletter_signup'
  | 'search'
  | 'blog_read'
  | 'service_view'
  | 'package_view'
  | 'resource_view'
  | 'resource_download'
  | 'case_study_view'
  | 'proposal_view'
  | 'proposal_approved'
  | 'support_ticket_created';

export interface EventProperties {
  path?: string;
  source?: string;
  service?: string;
  resourceId?: string;
  resourceTitle?: string;
  category?: string;
  proposalId?: string;
  ticketId?: string;
  [key: string]: any;
}

export function trackEvent(eventName: PlatformEvent, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  try {
    // Custom event dispatch for client components
    const customEvent = new CustomEvent('lit_analytics', {
      detail: { event: eventName, properties, timestamp: new Date().toISOString() },
    });
    window.dispatchEvent(customEvent);

    // Google Tag / Google Analytics integration if available
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, properties);
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}:`, properties);
    }
  } catch (err) {
    // Analytics failures should never crash application
  }
}
