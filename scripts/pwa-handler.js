// PWA Installation and Service Worker Handler for Philosophy Hub
class PWAHandler {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.createInstallButton();
        this.detectStandaloneMode();
    }

    // Register Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('ServiceWorker update found!');
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed: ', error);
                    });
            });

            // Listen for claiming of service worker
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('ServiceWorker controller changed');
            });
        }
    }

    // Handle install prompt
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.deferredPrompt = null;
            this.showInstallSuccessMessage();
        });
    }

    // Create install button
    createInstallButton() {
        // Create button element
        this.installButton = document.createElement('button');
        this.installButton.id = 'pwa-install-btn';
        this.installButton.className = 'PhiH-pwa-install-btn';
        this.installButton.innerHTML = `
            <span class="PhiH-pwa-install-icon">📱</span>
            <span data-i18n="PhiH.pwa.install">Install App</span>
        `;
        
        // Add click event
        this.installButton.addEventListener('click', () => {
            this.installPWA();
        });

        // Initially hide the button
        this.installButton.style.display = 'none';

        // Add to header controls
        const headerControls = document.querySelector('.PhiH-general-header-controls');
        if (headerControls) {
            headerControls.appendChild(this.installButton);
        }

        // Add translations for the install button
        this.addPwaTranslations();
    }

    // Show install button
    showInstallButton() {
        if (this.installButton && !this.isStandalone) {
            this.installButton.style.display = 'flex';
            console.log('Showing install button');
        }
    }

    // Hide install button
    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    // Install PWA
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User response to the install prompt: ${outcome}`);
            
            // We've used the prompt, and can't use it again, throw it away
            this.deferredPrompt = null;
            
            // Hide the install button regardless of outcome
            this.hideInstallButton();

            if (outcome === 'accepted') {
                this.showInstallSuccessMessage();
            }
        } catch (error) {
            console.error('Error during PWA installation:', error);
        }
    }

    // Detect if app is running in standalone mode
    detectStandaloneMode() {
        // Check if display-mode is standalone
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isStandalone = true;
            this.hideInstallButton();
            console.log('App is running in standalone mode');
        }

        // Also check for other indicators of standalone mode
        if (window.navigator.standalone === true) {
            this.isStandalone = true;
            this.hideInstallButton();
        }

        // Listen for display mode changes
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            this.isStandalone = e.matches;
            if (this.isStandalone) {
                this.hideInstallButton();
            }
        });
    }

    // Show update notification
    showUpdateNotification() {
        // You can implement a custom update notification here
        console.log('New version available! Refresh to update.');
        
        // Example: Show a refresh button
        if (this.showRefreshPrompt()) {
            const refreshBtn = document.createElement('button');
            refreshBtn.id = 'pwa-refresh-btn';
            refreshBtn.className = 'PhiH-pwa-refresh-btn';
            refreshBtn.innerHTML = `
                <span class="PhiH-pwa-refresh-icon">🔄</span>
                <span data-i18n="PhiH.pwa.updateAvailable">Update Available</span>
            `;
            refreshBtn.addEventListener('click', () => {
                window.location.reload();
            });

            const headerControls = document.querySelector('.PhiH-general-header-controls');
            if (headerControls) {
                headerControls.appendChild(refreshBtn);
            }

            // Update translations for refresh button
            this.updateTranslations();
        }
    }

    // Show install success message
    showInstallSuccessMessage() {
        // You can implement a custom success message here
        console.log('App installed successfully!');
        
        // Example: Show a temporary success message
        const successMsg = document.createElement('div');
        successMsg.className = 'PhiH-pwa-success-msg';
        successMsg.innerHTML = `
            <span data-i18n="PhiH.pwa.installSuccess">App installed successfully!</span>
        `;
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(successMsg);

        // Remove after 3 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 3000);

        // Update translations for success message
        this.updateTranslations();
    }

    // Check if we should show refresh prompt
    showRefreshPrompt() {
        return true; // Customize this logic as needed
    }

    // Add PWA translations
    addPwaTranslations() {
        if (!window.currentTranslations) return;

        // Add PWA translations to all language sets
        const pwaTranslations = {
            install: {
                en: "Install App",
                fr: "Installer l'App",
                ar: "تثبيت التطبيق"
            },
            updateAvailable: {
                en: "Update Available",
                fr: "Mise à jour disponible",
                ar: "تحديث متاح"
            },
            installSuccess: {
                en: "App installed successfully!",
                fr: "Application installée avec succès !",
                ar: "تم تثبيت التطبيق بنجاح!"
            }
        };

        // Merge PWA translations with existing translations
        Object.keys(window.currentTranslations).forEach(lang => {
            if (window.currentTranslations[lang]) {
                window.currentTranslations[lang]["PhiH.pwa.install"] = pwaTranslations.install[lang] || pwaTranslations.install.en;
                window.currentTranslations[lang]["PhiH.pwa.updateAvailable"] = pwaTranslations.updateAvailable[lang] || pwaTranslations.updateAvailable.en;
                window.currentTranslations[lang]["PhiH.pwa.installSuccess"] = pwaTranslations.installSuccess[lang] || pwaTranslations.installSuccess.en;
            }
        });
    }

    // Update translations for dynamically created elements
    updateTranslations() {
        if (window.applyLanguage) {
            const currentLang = localStorage.getItem('preferredLanguage') || 'en';
            setTimeout(() => {
                window.applyLanguage(currentLang);
            }, 100);
        }
    }
}

// Initialize PWA Handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pwaHandler = new PWAHandler();
});

// Add PWA button styles to main.css
const pwaStyles = `
/* PWA Install Button Styles */
.PhiH-pwa-install-btn {
    background: linear-gradient(135deg, var(--accent-color) 0%, #8a7cff 100%);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: var(--box-shadow);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    background-color: rgba(162, 155, 254, 0.9) !important;
}

.PhiH-pwa-install-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(162, 155, 254, 0.4);
    background-color: rgba(162, 155, 254, 1) !important;
}

.PhiH-pwa-install-icon {
    font-size: 1.1rem;
}

.PhiH-pwa-refresh-btn {
    background: linear-gradient(135deg, var(--secondary-color) 0%, #f9c74f 100%);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: var(--box-shadow);
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    background-color: rgba(253, 203, 110, 0.9) !important;
}

.PhiH-pwa-refresh-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(253, 203, 110, 0.4);
    background-color: rgba(253, 203, 110, 1) !important;
}

.PhiH-pwa-refresh-icon {
    font-size: 1.1rem;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Dark mode adjustments for PWA buttons */
[data-theme="dark"] .PhiH-pwa-install-btn {
    background-color: rgba(162, 155, 254, 0.8) !important;
}

[data-theme="dark"] .PhiH-pwa-install-btn:hover {
    background-color: rgba(162, 155, 254, 1) !important;
}

[data-theme="dark"] .PhiH-pwa-refresh-btn {
    background-color: rgba(255, 215, 0, 0.8) !important;
}

[data-theme="dark"] .PhiH-pwa-refresh-btn:hover {
    background-color: rgba(255, 215, 0, 1) !important;
}

/* Responsive adjustments for PWA buttons */
@media (max-width: 768px) {
    .PhiH-pwa-install-btn,
    .PhiH-pwa-refresh-btn {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
    
    .PhiH-pwa-install-icon,
    .PhiH-pwa-refresh-icon {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .PhiH-general-header-controls {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .PhiH-pwa-install-btn,
    .PhiH-pwa-refresh-btn {
        order: 3;
        margin-top: 0.5rem;
        width: 100%;
        justify-content: center;
    }
}
`;

// Inject PWA styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);