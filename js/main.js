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
        nav.classList.toggle("open"); // Toggle the .open class
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
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptButton = document.getElementById('acceptCookies');
    const rejectButton = document.getElementById('rejectCookies');
    const cookieSettingsLinks = document.querySelectorAll('.cookie-settings');

    if (!cookieBanner || !acceptButton || !rejectButton) {
        // Retry up to 10 times (1s max)
        if (attempt < 10) {
            return setTimeout(() => initCookieBanner(attempt + 1), 100);
        } else {
            // Fallback: remove no-scroll in case it's stuck
            document.body.classList.remove('no-scroll');
            return;
        }
    }

    function showBanner() {
        cookieBanner.style.display = 'flex';
        document.body.classList.add('no-scroll');
    }

    function hideBanner() {
        cookieBanner.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }

    if (!localStorage.getItem('cookieConsent')) {
        showBanner();
    }

    acceptButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'granted');
        hideBanner();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'cookie_consent_granted', analytics_storage: 'granted' });
    });

    rejectButton.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'denied');
        hideBanner();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'cookie_consent_denied', analytics_storage: 'denied' });
    });

    cookieSettingsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showBanner();
        });
    });
}

window.addEventListener('load', () => {
    document.body.classList.remove('no-scroll'); // Safety reset
    initCookieBanner();
});