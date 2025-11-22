function initializeLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    if (languageSelect) {
        languageSelect.value = savedLang;
        applyLanguage(savedLang);
    }

    if (languageSelect) {
        languageSelect.addEventListener('change', function(e) {
            const lang = e.target.value;
            localStorage.setItem('preferredLanguage', lang);
            applyLanguage(lang);
        });
    }
}

function applyLanguage(lang) {
    document.documentElement.lang = lang;
    
    // Update text direction and alignment
    if (lang === 'ar') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
    } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
    }
    
    // Update all elements with data-i18n attribute - USING innerHTML FOR HTML TAGS
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (window.currentTranslations && window.currentTranslations[lang] && window.currentTranslations[lang][key]) {
            // Use innerHTML to render HTML tags properly
            element.innerHTML = window.currentTranslations[lang][key];
        }
    });
    
    // Update all elements with data-i18n-alt attribute (keep as textContent for safety)
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (window.currentTranslations && window.currentTranslations[lang] && window.currentTranslations[lang][key]) {
            element.alt = window.currentTranslations[lang][key];
        }
    });
    
    // Update select options with data-i18n attributes
    document.querySelectorAll('select option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (window.currentTranslations && window.currentTranslations[lang] && window.currentTranslations[lang][key]) {
            option.textContent = window.currentTranslations[lang][key];
        }
    });
	// Update input placeholders with data-i18n-placeholder
document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
    const key = input.getAttribute('data-i18n-placeholder');
    if (window.currentTranslations && window.currentTranslations[lang] && window.currentTranslations[lang][key]) {
        input.placeholder = window.currentTranslations[lang][key];
    }
});
}

// Expose updateTranslations globally for dynamic content
window.updateTranslations = function() {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    applyLanguage(lang);
};

// Theme switching functionality with persistence
function initializeThemeSwitcher() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('preferredTheme') || 'light';
    applyTheme(savedTheme);
    
    if (themeToggle) {
        // Set initial toggle state
        themeToggle.checked = savedTheme === 'dark';
        
        themeToggle.addEventListener('change', function(e) {
            const theme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('preferredTheme', theme);
            applyTheme(theme);
        });
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSwitcher();
    initializeThemeSwitcher();
});