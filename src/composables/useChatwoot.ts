interface ChatwootSettings {
  websiteToken: string;
  baseUrl?: string;
  locale?: string;
  position?: 'left' | 'right';
  darkMode?: boolean;
  type?: 'standard' | 'expanded_bubble';
  placement?: 'unbound' | 'standard';
}

declare global {
  interface Window {
    chatwootSettings: ChatwootSettings;
    $chatwoot: any;
    chatwootSDK: string;
  }
}

export function useChatwoot() {
  const initChatwoot = (settings: ChatwootSettings) => {
    if (typeof window === 'undefined') return;

    // Configure Chatwoot Settings
    window.chatwootSettings = {
      position: 'right',
      locale: 'en', 
      type: 'standard',
      placement: 'unbound',
      ...settings,
    };

    // Create Chatwoot Script
    (function(d,t) {
      var BASE_URL = settings.baseUrl || "https://app.chatwoot.com";
      var g=d.createElement(t) as HTMLScriptElement;
      var s=d.getElementsByTagName(t)[0];
      g.src = `${BASE_URL}/packs/js/sdk.js`;
      g.defer = true;
      g.async = true;
      s?.parentNode?.insertBefore(g,s);
      g.onload=function(){
        (window.chatwootSDK as any).run({
          websiteToken: settings.websiteToken,
          baseUrl: BASE_URL,
          elementId: 'chatwoot-embed'
        })
      }
    })(document,"script");
  };

  const setUser = (identifier: string, attributes: Record<string, any>) => {
    if (window.$chatwoot) {
      window.$chatwoot.setUser(identifier, attributes);
    }
  };

  const setCustomAttributes = (attributes: Record<string, any>) => {
    if (window.$chatwoot) {
      window.$chatwoot.setCustomAttributes(attributes);
    }
  };

  const reset = () => {
    if (window.$chatwoot) {
      window.$chatwoot.reset();
    }
  };

  return {
    initChatwoot,
    setUser,
    setCustomAttributes,
    reset,
  };
}
