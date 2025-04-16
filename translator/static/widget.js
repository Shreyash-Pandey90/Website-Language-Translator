const isReactApp = () => {
    return !!document.getElementById('root');
  };


class TranslationWidget {
    constructor(options = {}) {
      this.targetLanguage = options.language || 'hi';
      this.apiEndpoint = this.resolveApiEndpoint(options.apiEndpoint || '/api/translate/');
      this.buttonText = options.buttonText || 'Translate to Hindi';
      this.buttonPosition = options.buttonPosition || 'bottom-right';
      this.buttonStyles = options.buttonStyles || {
        position: 'fixed',
        padding: '10px 15px',
        background: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        zIndex: '9999'
      };
      this.excludeSelectors = options.excludeSelectors || '[data-no-translate]';
      this.disableGoogleAPI = options.disableGoogleAPI || false;
      
      this.isTranslated = false;
      this.originalContents = new Map();
    }
  
    isReactApp() {
      return !!document.getElementById('root');
    }
  
    resolveApiEndpoint(endpoint) {
      if (endpoint.startsWith('http')) {
        return endpoint;
      }
      
      if (this.isReactApp() && (window.location.origin.includes('localhost') || 
                                window.location.origin.includes('127.0.0.1'))) {
        return `http://127.0.0.1:8000${endpoint}`;
      }
      
      return endpoint;
    }
  
    init() {
      if (this.disableGoogleAPI) {
        this.disableGoogleIdentityToolkit();
      }
      this.createButton();
      this.applyStyles();
    }
  
    disableGoogleIdentityToolkit() {
      if (window.firebase) {
        window.firebase.initializeApp = () => {};
      }
    }
  
    createButton() {
      this.button = document.createElement('button');
      this.button.className = 'translation-widget-button';
      this.button.innerText = this.buttonText;
      Object.assign(this.button.style, this.buttonStyles);
      
      if (this.buttonPosition === 'bottom-right') {
        this.button.style.bottom = '20px';
        this.button.style.right = '20px';
      } else if (this.buttonPosition === 'top-right') {
        this.button.style.top = '20px';
        this.button.style.right = '20px';
      }
      
      this.button.addEventListener('click', () => this.toggleTranslation());
      document.body.appendChild(this.button);
    }
  
    applyStyles() {
      const style = document.createElement('style');
      style.textContent = `
        .translation-widget-loading {
          opacity: 0.7;
          position: relative;
        }
        .translation-widget-loading::after {
          content: '...';
          position: absolute;
        }
        .translation-widget-button {
          transition: all 0.3s ease;
        }
        .translation-widget-button:hover {
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(style);
    }
  
    async toggleTranslation() {
      this.button.disabled = true;
      try {
        if (this.isTranslated) {
          this.restoreOriginal();
        } else {
          await this.translatePage();
        }
        this.isTranslated = !this.isTranslated;
        this.button.innerText = this.isTranslated 
          ? 'Show Original' 
          : this.buttonText;
      } finally {
        this.button.disabled = false;
      }
    }
  
    async translatePage() {
      // Wait for React hydration if needed
      if (this.isReactApp()) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
  
      const baseSelector = this.isReactApp() ? '#root ' : '';
      const elements = document.querySelectorAll(`
        ${baseSelector}h1, ${baseSelector}h2, ${baseSelector}h3, 
        ${baseSelector}h4, ${baseSelector}h5, ${baseSelector}h6,
        ${baseSelector}p, ${baseSelector}span, ${baseSelector}li,
        ${baseSelector}a:not([href^="http"]), 
        ${baseSelector}button, ${baseSelector}label
        :not(${this.excludeSelectors})
      `.trim());
      
      const translationPromises = [];
      
      for (const el of elements) {
        // Skip elements that shouldn't be translated
        if (!el.innerText || !el.innerText.trim() || 
            el.closest(this.excludeSelectors) || 
            el.querySelector('input, textarea, select, iframe, canvas, svg, img')) {
          continue;
        }
        
        this.originalContents.set(el, el.innerText);
        el.classList.add('translation-widget-loading');
        
        translationPromises.push(
          this.translateElement(el).finally(() => {
            el.classList.remove('translation-widget-loading');
          })
        );
      }
      
      await Promise.allSettled(translationPromises);
    }
  
    async translateElement(el) {
      try {

        const originalText = el.innerText;
      
        // Check local storage cache first
        const localCacheKey = `translation_${originalText}_${this.targetLanguage}`;
        const cachedTranslation = localStorage.getItem(localCacheKey);
        
        if (cachedTranslation) {
          el.innerText = cachedTranslation;
          return;
        }

        const response = await fetch(this.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: el.innerText,
            lang: this.targetLanguage 
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.translated) {
          el.innerText = data.translated;

          if (!data.cached) {
            localStorage.setItem(localCacheKey, data.translated);
          }
        }
      } catch (error) {
        console.error(`Failed to translate element:`, {
          element: el,
          text: el.innerText,
          error: error.message
        });
        el.innerText = this.originalContents.get(el);
      }
    }
  
    restoreOriginal() {
      this.originalContents.forEach((text, el) => {
        el.innerText = text;
      });
      this.originalContents.clear();
    }
  }
  
  if (!window.TranslationWidgetInitialized) {
    const config = window.translationWidgetConfig || {};
    window.translationWidget = new TranslationWidget(config);
    
    if (document.getElementById('root')) {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.translationWidget.init(), 500);
      });
    } else {
      window.translationWidget.init();
    }
    
    window.TranslationWidgetInitialized = true;
  }