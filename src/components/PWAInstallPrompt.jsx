import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if we should show the prompt today
    const lastPromptDate = localStorage.getItem('pwaPromptLastShown');
    const today = new Date().toDateString();
    
    if (!lastPromptDate || lastPromptDate !== today) {
      // Only show if not already in standalone mode
      if (!isStandalone) {
        // Set a small delay to avoid immediate popup
        setTimeout(() => {
          setShowPrompt(true);
          localStorage.setItem('pwaPromptLastShown', today);
        }, 3000);
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt
    setDeferredPrompt(null);
    
    // Hide the install UI
    setShowPrompt(false);
    
    // Log the outcome
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
  };

  const closePrompt = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={closePrompt}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Drivigo Logo" className="h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Install Drivigo App</h2>
          <p className="text-gray-600 mt-2">
            Install our app for a better experience with offline access and faster loading!
          </p>
        </div>

        {isIOS ? (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">How to install on iOS:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Tap the Share button <span className="inline-block w-6 h-6 bg-gray-200 rounded-md text-center">⬆️</span> at the bottom of your screen</li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
            <div className="mt-4 text-center">
              <button
                onClick={closePrompt}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
              >
                Install App
              </button>
            ) : (
              <>
                <h3 className="font-medium text-gray-800">How to install:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Open Chrome menu (three dots in the top right)</li>
                  <li>Tap "Install Drivigo" or "Add to Home screen"</li>
                  <li>Follow the on-screen instructions</li>
                </ol>
                <div className="mt-4 text-center">
                  <button
                    onClick={closePrompt}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Got it!
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
