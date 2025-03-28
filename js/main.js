document.addEventListener('alpine:init', () => {
  Alpine.data('collapsibleCard', (initialHeight = '4.4em', autoCollapseTime = 20000) => ({
    expanded: false,
    collapseTimeout: null,
    contentHeight: initialHeight,
    isTruncated: false,
    toggleText: '...read more',

    init() {
      // Wait until the browser is idle to avoid LCP or CLS impact
      requestIdleCallback(() => {
        this.$nextTick(() => {
          const contentEl = this.$refs.content;
          if (!contentEl) return;

          // Temporarily allow full expansion to measure height
          contentEl.style.maxHeight = 'none';
          const fullHeight = contentEl.scrollHeight;

          // Restore collapsed height
          contentEl.style.maxHeight = this.contentHeight;

          // Calculate truncation
          const computedStyle = window.getComputedStyle(contentEl);
          const fontSize = parseFloat(computedStyle.fontSize);
          const collapsedHeightPx = parseFloat(this.contentHeight) * fontSize;

          this.isTruncated = fullHeight > collapsedHeightPx;

          // Set accessibility attributes when collapsed
          contentEl.setAttribute('aria-hidden', 'true');
          contentEl.setAttribute('inert', '');
        });
      });
    },

    toggleExpand() {
      const contentEl = this.$refs.content;

      this.expanded = !this.expanded;
      this.toggleText = this.expanded ? '...collapse' : '...read more';

      clearTimeout(this.collapseTimeout);

      if (this.expanded) {
        // Make content accessible
        contentEl.removeAttribute('aria-hidden');
        contentEl.removeAttribute('inert');

        // Expand smoothly
        contentEl.style.maxHeight = 'none';
        const fullHeight = contentEl.scrollHeight;
        contentEl.style.maxHeight = this.contentHeight;

        this.$nextTick(() => {
          contentEl.style.maxHeight = `${fullHeight}px`;

          if (autoCollapseTime > 0) {
            this.collapseTimeout = setTimeout(() => {
              this.expanded = false;
              this.toggleText = '...read more';
              contentEl.style.maxHeight = this.contentHeight;

              // Reapply hidden state
              contentEl.setAttribute('aria-hidden', 'true');
              contentEl.setAttribute('inert', '');
            }, autoCollapseTime);
          }
        });
      } else {
        contentEl.style.maxHeight = this.contentHeight;
        contentEl.setAttribute('aria-hidden', 'true');
        contentEl.setAttribute('inert', '');
      }
    }
  }));
});

// Your existing vanilla JS code
document.addEventListener("DOMContentLoaded", function () {
    const menuButtonContainer = document.getElementById("menuButtonContainer");
    const nav = document.querySelector("nav");
    const menuItems = document.querySelectorAll(".menudrop li");
    const servicesMenu = document.getElementById("servicesMenu");
    const subMenu = document.getElementById("subMenu");
    const mainMenu = document.getElementById("mainMenu");
    const backButton = document.getElementById("backButton");

    // Set initial state
    subMenu.classList.add("hidden");

    const toggleMenu = () => {
        nav.classList.toggle("open");
        menuButtonContainer.classList.toggle("menu-open");
        menuItems.forEach(item => item.classList.toggle("toggled"));
        if (nav.classList.contains("open")) {
            mainMenu.classList.remove("hidden");
            subMenu.classList.add("hidden");
            subMenu.classList.remove("fade-in", "li-fade-in");
        }
    };

    const showSubMenu = () => {
        mainMenu.classList.add("hidden");
        subMenu.classList.remove("hidden");
        subMenu.classList.remove("fade-in");
        void subMenu.offsetWidth; // Trigger reflow
        subMenu.classList.add("active", "fade-in");
    };

    const goBack = () => {
        subMenu.classList.remove("fade-in");
        subMenu.classList.add("hidden");
        mainMenu.classList.remove("hidden");
        mainMenu.classList.remove("fade-in");
        void mainMenu.offsetWidth; // Trigger reflow
        mainMenu.classList.add("fade-in");
    };

    menuButtonContainer.addEventListener("click", toggleMenu);
    servicesMenu.addEventListener("click", showSubMenu);
    backButton.addEventListener("click", goBack);
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

window.addEventListener('load', initCookieBanner);