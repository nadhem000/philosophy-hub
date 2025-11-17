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
                // Refresh the page to ensure the latest service worker controls it
                window.location.reload();
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
            
            // Also update the button text based on availability
            this.updateInstallButtonText(true);
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
        // Try to find existing button first
        this.installButton = document.getElementById('pwa-install-btn');
        
        // If button doesn't exist, create it
        if (!this.installButton) {
            this.installButton = document.createElement('button');
            this.installButton.id = 'pwa-install-btn';
            this.installButton.className = 'PhiH-pwa-install-btn';
            this.installButton.innerHTML = `
                <span class="PhiH-pwa-install-icon">📱</span>
                <span class="PhiH-pwa-install-text" data-i18n="PhiH.pwa.install">Install App</span>
            `;
            
            // Add to header controls
            const headerControls = document.querySelector('.PhiH-general-header-controls');
            if (headerControls) {
                headerControls.appendChild(this.installButton);
            } else {
                console.warn('Header controls not found, adding install button to body');
                document.body.appendChild(this.installButton);
                
                // Add some basic positioning
                this.installButton.style.position = 'fixed';
                this.installButton.style.bottom = '20px';
                this.installButton.style.right = '20px';
                this.installButton.style.zIndex = '1000';
            }
        }

        // Add click event
        this.installButton.addEventListener('click', () => {
            this.installPWA();
        });

        // Initially hide the button
        this.installButton.style.display = 'none';

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

    // Update install button text based on availability
    updateInstallButtonText(canInstall) {
        if (this.installButton) {
            const textElement = this.installButton.querySelector('.PhiH-pwa-install-text');
            if (textElement) {
                const lang = localStorage.getItem('preferredLanguage') || 'en';
                const translations = {
                    en: canInstall ? "Install App" : "Already Installed",
                    fr: canInstall ? "Installer l'App" : "Déjà Installé",
                    ar: canInstall ? "تثبيت التطبيق" : "مثبت بالفعل"
                };
                textElement.textContent = translations[lang] || translations.en;
            }
        }
    }

    // Install PWA
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            this.showCannotInstallMessage();
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
            
            if (outcome === 'accepted') {
                this.showInstallSuccessMessage();
                this.hideInstallButton();
            } else {
                this.showInstallDeclinedMessage();
            }
        } catch (error) {
            console.error('Error during PWA installation:', error);
            this.showInstallErrorMessage();
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

        // Check if the app is already installed
        if (this.isAppInstalled()) {
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

    // Check if app is already installed
    isAppInstalled() {
        return localStorage.getItem('pwa-installed') === 'true' || 
               window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    // Show update notification
    showUpdateNotification() {
        console.log('New version available! Refresh to update.');
        
        // Create refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'pwa-refresh-btn';
        refreshBtn.className = 'PhiH-pwa-refresh-btn';
        refreshBtn.innerHTML = `
            <span class="PhiH-pwa-refresh-icon">🔄</span>
            <span class="PhiH-pwa-refresh-text" data-i18n="PhiH.pwa.updateAvailable">Update Available</span>
        `;
        refreshBtn.addEventListener('click', () => {
            window.location.reload();
        });

        // Add to header controls or body
        const headerControls = document.querySelector('.PhiH-general-header-controls');
        if (headerControls) {
            // Remove existing refresh button if any
            const existingBtn = document.getElementById('pwa-refresh-btn');
            if (existingBtn) {
                existingBtn.remove();
            }
            headerControls.appendChild(refreshBtn);
        }

        // Update translations
        this.updateTranslations();
    }

    // Show install success message
    showInstallSuccessMessage() {
        localStorage.setItem('pwa-installed', 'true');
        
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
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 10000;
            box-shadow: var(--box-shadow);
            font-weight: 600;
        `;

        document.body.appendChild(successMsg);

        // Remove after 3 seconds
        setTimeout(() => {
            if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
            }
        }, 3000);

        this.updateTranslations();
    }

    // Show cannot install message
    showCannotInstallMessage() {
        this.showTemporaryMessage('PhiH.pwa.cannotInstall', 'var(--primary-color)');
    }

    // Show install declined message
    showInstallDeclinedMessage() {
        this.showTemporaryMessage('PhiH.pwa.installDeclined', 'var(--accent-color)');
    }

    // Show install error message
    showInstallErrorMessage() {
        this.showTemporaryMessage('PhiH.pwa.installError', '#ff4757');
    }

    // Helper for temporary messages
    showTemporaryMessage(translationKey, backgroundColor) {
        const msg = document.createElement('div');
        msg.className = 'PhiH-pwa-temp-msg';
        msg.innerHTML = `<span data-i18n="${translationKey}">Installation not available</span>`;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 12px 20px;
            border-radius: var(--border-radius);
            z-index: 10000;
            box-shadow: var(--box-shadow);
            font-weight: 600;
        `;

        document.body.appendChild(msg);

        setTimeout(() => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        }, 3000);

        this.updateTranslations();
    }

    // Add PWA translations
    addPwaTranslations() {
        if (!window.currentTranslations) {
            window.currentTranslations = {};
        }

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
            },
            cannotInstall: {
                en: "Installation not available",
                fr: "Installation non disponible",
                ar: "التثبيت غير متاح"
            },
            installDeclined: {
                en: "Installation cancelled",
                fr: "Installation annulée",
                ar: "تم إلغاء التثبيت"
            },
            installError: {
                en: "Installation failed",
                fr: "Échec de l'installation",
                ar: "فشل التثبيت"
            }
        };

        // Ensure all language objects exist
        ['en', 'fr', 'ar'].forEach(lang => {
            if (!window.currentTranslations[lang]) {
                window.currentTranslations[lang] = {};
            }
        });

        // Merge PWA translations
        Object.keys(pwaTranslations).forEach(key => {
            const translation = pwaTranslations[key];
            Object.keys(translation).forEach(lang => {
                window.currentTranslations[lang][`PhiH.pwa.${key}`] = translation[lang];
            });
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
    // Wait a bit for other scripts to initialize
    setTimeout(() => {
        window.pwaHandler = new PWAHandler();
    }, 1000);
});

// Add PWA button styles
const pwaStyles = `
/* PWA Install Button Styles */
.PhiH-pwa-install-btn {
    background: linear-gradient(135deg, var(--accent-color) 0%, #8a7cff 100%);
    color: white;
    border: none;
    padding: 10px 16px;
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
}

.PhiH-pwa-install-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(162, 155, 254, 0.4);
}

.PhiH-pwa-install-icon {
    font-size: 1.1rem;
}

.PhiH-pwa-refresh-btn {
    background: linear-gradient(135deg, var(--secondary-color) 0%, #f9c74f 100%);
    color: white;
    border: none;
    padding: 10px 16px;
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
}

.PhiH-pwa-refresh-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(253, 203, 110, 0.4);
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
    background: linear-gradient(135deg, #7c6ef7 0%, #6c5ce7 100%);
}

[data-theme="dark"] .PhiH-pwa-refresh-btn {
    background: linear-gradient(135deg, #ffd700 0%, #fdcb6e 100%);
}

/* Responsive adjustments for PWA buttons */
@media (max-width: 768px) {
    .PhiH-pwa-install-btn,
    .PhiH-pwa-refresh-btn {
        padding: 8px 12px;
        font-size: 0.8rem;
    }
    
    .PhiH-pwa-install-icon,
    .PhiH-pwa-refresh-icon {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .PhiH-pwa-install-btn,
    .PhiH-pwa-refresh-btn {
        order: 3;
        margin-top: 0.5rem;
        width: auto;
    }
}

/* Floating button style for when header controls not found */
.PhiH-pwa-install-btn.floating {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    animation: bounce 2s infinite;
}

@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
    }
    40% {
        transform: translateY(-10px);
    }
    60% {
        transform: translateY(-5px);
    }
}
`;

// Inject PWA styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = pwaStyles;
document.head.appendChild(styleSheet);