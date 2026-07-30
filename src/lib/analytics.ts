type AnalyticsParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js",
      target: string | Date,
      params?: AnalyticsParams
    ) => void;
  }
}

export const trackEvent = (name: string, params: AnalyticsParams = {}) => {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", name, params);
};
