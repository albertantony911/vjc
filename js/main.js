document.addEventListener('alpine:init', () => {
  Alpine.data('collapsibleCard', ({ targetLines = 3, autoCollapseTime = 20000 } = {}) => ({
    expanded: false,
    isTruncated: false,
    collapseTimeout: null,
    contentHeight: '0px',
    toggleText: '...read more',

    init() {
      this.$nextTick(() => {
        this.setInitialHeight();
        this.checkTruncation();
        this.setCollapsedState();
        this.setupResizeListener();
      });
    },

    setInitialHeight() {
      const el = this.$refs.content;
      if (!el) return;

      const style = window.getComputedStyle(el);
      let lineHeight = parseFloat(style.lineHeight);

      if (isNaN(lineHeight)) {
        const fontSize = parseFloat(style.fontSize);
        lineHeight = fontSize * 1.5;
      }

      this.contentHeight = `${lineHeight * targetLines}px`;
      el.style.maxHeight = this.contentHeight;
    },

    checkTruncation() {
      const el = this.$refs.content;
      if (!el) return;

      const currentMax = el.style.maxHeight;
      el.style.maxHeight = 'none';
      const fullHeight = el.scrollHeight;
      el.style.maxHeight = currentMax;

      this.isTruncated = fullHeight > parseFloat(this.contentHeight) + 1;
    },

    setCollapsedState() {
      const el = this.$refs.content;
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('inert', '');
    },

    setupResizeListener() {
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.setInitialHeight();
          this.checkTruncation();
          if (!this.expanded) this.setCollapsedState();
        }, 200);
      });
    },

    toggleExpand() {
      const el = this.$refs.content;
      if (!el) return;

      this.expanded = !this.expanded;
      this.toggleText = this.expanded ? '...collapse' : '...read more';
      clearTimeout(this.collapseTimeout);

      if (this.expanded) {
        el.removeAttribute('aria-hidden');
        el.removeAttribute('inert');
        el.style.maxHeight = `${el.scrollHeight}px`;

        if (autoCollapseTime > 0) {
          this.collapseTimeout = setTimeout(() => this.collapse(), autoCollapseTime);
        }
      } else {
        this.collapse();
      }
    },

    collapse() {
      const el = this.$refs.content;
      if (!el) return;

      this.expanded = false;
      this.toggleText = '...read more';
      el.style.maxHeight = this.contentHeight;
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('inert', '');
    }
  }));
});



// Your existing vanilla JS code
document.addEventListener("DOMContentLoaded", function () {
    const menuButtonContainer = document.getElementById("menuButtonContainer");
    const nav = document.querySelector("nav");
    const menuItems = document.querySelectorAll(".menudrop li");
    const mainMenu = document.getElementById("mainMenu");

    // Solutions Menu Elements
    const servicesMenu = document.getElementById("servicesMenu");
    const subMenu = document.getElementById("subMenu");
    const backButton = document.getElementById("backButton");

    // About Us Menu Elements
    const aboutMenu = document.getElementById("aboutMenu");
    const aboutSubMenu = document.getElementById("aboutSubMenu");
    const aboutBackButton = document.getElementById("aboutBackButton");

    // Resources Menu Elements
    const resourcesMenu = document.getElementById("resourcesMenu");
    const resourcesSubMenu = document.getElementById("resourcesSubMenu");
    const resourcesBackButton = document.getElementById("resourcesBackButton");

    // Array of all submenus for easy resetting
    const allSubMenus = [subMenu, aboutSubMenu, resourcesSubMenu];

    // Set initial state
    allSubMenus.forEach(menu => {
        menu.classList.add("hidden");
    });

    const toggleMenu = () => {
        nav.classList.toggle("open");
        menuButtonContainer.classList.toggle("menu-open");
        menuItems.forEach(item => item.classList.toggle("toggled"));
        
        if (nav.classList.contains("open")) {
            // Reset to main menu whenever mobile nav is opened
            mainMenu.style.display = "flex";
            mainMenu.classList.remove("hidden");
            
            allSubMenus.forEach(menu => {
                menu.style.display = "none";
                menu.classList.add("hidden");
                menu.classList.remove("fade-in", "li-fade-in", "active");
            });
        }
    };

    // Generic function to show a specific submenu
    const showSubMenu = (targetMenu) => {
        mainMenu.classList.add("hidden");
        mainMenu.style.display = "none"; // Remove from document flow

        targetMenu.style.display = "flex"; // Add to document flow
        targetMenu.classList.remove("hidden");
        targetMenu.classList.remove("fade-in");
        void targetMenu.offsetWidth; // Trigger reflow
        targetMenu.classList.add("active", "fade-in");
    };

    // Generic function to go back to the main menu
    const goBack = (currentMenu) => {
        currentMenu.classList.remove("fade-in", "active");
        currentMenu.classList.add("hidden");
        currentMenu.style.display = "none";

        mainMenu.style.display = "flex";
        mainMenu.classList.remove("hidden");
        mainMenu.classList.remove("fade-in");
        void mainMenu.offsetWidth; // Trigger reflow
        mainMenu.classList.add("fade-in");
    };

    // Main Toggle Listener
    menuButtonContainer.addEventListener("click", toggleMenu);

    // Event Listeners for Solutions
    servicesMenu.addEventListener("click", (e) => { e.preventDefault(); showSubMenu(subMenu); });
    backButton.addEventListener("click", (e) => { e.preventDefault(); goBack(subMenu); });

    // Event Listeners for About Us
    const aboutMenuToggle = document.getElementById("aboutMenuToggle");
    if (aboutMenuToggle) {
        aboutMenuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSubMenu(aboutSubMenu);
        });
    } else {
        aboutMenu.addEventListener("click", (e) => {
            e.preventDefault();
            showSubMenu(aboutSubMenu);
        });
    }
    aboutBackButton.addEventListener("click", (e) => { e.preventDefault(); goBack(aboutSubMenu); });

    // Event Listeners for Resources
    const resourcesMenuToggle = document.getElementById("resourcesMenuToggle");
    if (resourcesMenuToggle) {
        resourcesMenuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            showSubMenu(resourcesSubMenu);
        });
    } else {
        resourcesMenu.addEventListener("click", (e) => {
            e.preventDefault();
            showSubMenu(resourcesSubMenu);
        });
    }
    resourcesBackButton.addEventListener("click", (e) => { e.preventDefault(); goBack(resourcesSubMenu); });
});




document.querySelectorAll('.delayed-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const href = this.href;
        const target = this.target;
        setTimeout(() => {
            if (target === '_blank') {
                window.open(href, '_blank');
            } else {
                window.location.href = href;
            }
        }, 150); // Matches your duration-300
    });
});

function initCookieBanner(attempt = 0) {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    const settingsLinks = document.querySelectorAll('.cookie-settings');

    if (!banner || !acceptBtn || !rejectBtn) {
        if (attempt < 10) {
            return setTimeout(() => initCookieBanner(attempt + 1), 100);
        }
        console.error('Cookie banner elements not found after 10 attempts');
        return;
    }

    const showBanner = () => {
        banner.classList.remove('hidden');
    };

    const hideBanner = () => {
        banner.classList.add('hidden');
    };

    if (!localStorage.getItem('cookieConsent')) {
        showBanner();
    } else {
        hideBanner();
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'granted');
        hideBanner();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'cookie_consent_granted',
            analytics_storage: 'granted'
        });
    });

    rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'denied');
        hideBanner();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'cookie_consent_denied',
            analytics_storage: 'denied'
        });
    });

    settingsLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showBanner();
        });
    });
}

function initApolloEngine() {
    if (!document.querySelector('script[src*="apollo-engine.js"]')) {
        const mainScript = document.querySelector('script[src*="js/main.js"]');
        const srcAttr = mainScript ? mainScript.getAttribute('src') : '';
        const prefix = srcAttr.startsWith('../') ? '../' : './';
        
        var script = document.createElement('script');
        script.src = prefix + 'js/apollo-engine.js';
        script.defer = true;
        document.head.appendChild(script);
    }
}

function initNewsletterForm() {
    const form = document.getElementById('footer-newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerText : 'Subscribe';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Subscribing...';
        }

        function restoreBtn() {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        }

        function submitNewsletter() {
            if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
                window.ApolloMeetings.initWidget({
                    appId: "6a0afa099eda8700201974ad",
                    schedulingLink: "5vl-uvk-2l5"
                });
                window.ApolloMeetings.submit({
                    formId: 'footer-newsletter-form',
                    onSuccess: function() {
                        restoreBtn();
                        form.reset();
                    },
                    onError: function(err) {
                        console.error('[Apollo] Newsletter subscription error:', err);
                        restoreBtn();
                    }
                });
            } else {
                console.error('[Apollo] ApolloMeetings not loaded');
                restoreBtn();
            }
        }

        if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
            submitNewsletter();
        } else {
            let script = document.querySelector('script[src*="meetings-widget.js"]');
            if (!script) {
                script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://assets.apollo.io/js/meetings/meetings-widget.js';
                script.defer = true;
                script.onload = function() {
                    if (window.ApolloMeetings && window.ApolloMeetings.initWidget) {
                        window.ApolloMeetings.initWidget({
                            appId: "6a0afa099eda8700201974ad",
                            schedulingLink: "5vl-uvk-2l5"
                        });
                        submitNewsletter();
                    }
                };
                script.onerror = function() {
                    console.error('[Apollo] Failed to load meetings widget script');
                    restoreBtn();
                };
                document.head.appendChild(script);
            } else {
                let attempts = 0;
                const interval = setInterval(function() {
                    attempts++;
                    if (window.ApolloMeetings && typeof window.ApolloMeetings.submit === 'function') {
                        clearInterval(interval);
                        submitNewsletter();
                    } else if (attempts >= 25) {
                        clearInterval(interval);
                        restoreBtn();
                    }
                }, 200);
            }
        }
    });
}

window.addEventListener('load', function() {
    initCookieBanner();
    initApolloEngine();
    initNewsletterForm();
});