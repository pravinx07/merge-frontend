import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'react-hot-toast';

interface PWAContextType {
  isInstallable: boolean;
  isInstallDismissed: boolean;
  installApp: () => Promise<boolean>;
  dismissInstall: () => void;
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  closePrompt: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered successfully:', r);
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from showing the default install banner
      e.preventDefault();
      // Stash the event so we can trigger it custom
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('PWA: App is eligible for installation.');
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log('PWA: App installed successfully.');
      toast.success('Merge installed successfully! Check your home screen.', {
        icon: '🚀',
        duration: 5000,
        style: {
          background: '#0a0a0b',
          color: '#fff',
          border: '1px solid rgba(0, 229, 255, 0.2)',
        },
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If the browser already launched as a standalone PWA, it is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('PWA: Install prompt deferred event is not available.');
      return false;
    }
    
    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's choice
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User install choice outcome: ${outcome}`);
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  const [isInstallDismissed, setIsInstallDismissed] = useState(() => {
    return sessionStorage.getItem('pwa-install-dismissed') === 'true';
  });

  const dismissInstall = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setIsInstallDismissed(true);
  };

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstallDismissed,
        installApp,
        dismissInstall,
        needRefresh,
        offlineReady,
        updateServiceWorker,
        closePrompt,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
