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







  document.addEventListener('DOMContentLoaded', () => {
        // Get DOM elements
        const cookieBanner = document.getElementById('cookieBanner');
        const acceptButton = document.getElementById('acceptCookies');
        const rejectButton = document.getElementById('rejectCookies');
        const cookieSettingsLink = document.getElementById('cookieSettings');

        // Debug: Confirm elements are found
        console.log('cookieBanner:', cookieBanner);
        console.log('acceptButton:', acceptButton);
        console.log('rejectButton:', rejectButton);
        console.log('cookieSettingsLink:', cookieSettingsLink);

        // Function to show the banner
        function showBanner() {
            cookieBanner.style.display = 'flex';
            document.body.classList.add('no-scroll');
            console.log('Banner shown');
        }

        // Function to hide the banner
        function hideBanner() {
            cookieBanner.style.display = 'none';
            document.body.classList.remove('no-scroll');
            console.log('Banner hidden');
        }

        // Check initial state
        console.log('Initial cookieConsent value:', localStorage.getItem('cookieConsent'));
        if (!localStorage.getItem('cookieConsent')) {
            showBanner();
            console.log('Banner should be visible - no consent choice made yet');
        } else {
            console.log('Banner hidden - consent choice already made');
        }

        // Accept button handler
        acceptButton.addEventListener('click', () => {
            console.log('Accept button clicked');
            localStorage.setItem('cookieConsent', 'granted');
            hideBanner();
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({'event': 'cookie_consent_granted', 'analytics_storage': 'granted'});
            console.log('Consent granted');
        });

        // Reject button handler
        rejectButton.addEventListener('click', () => {
            console.log('Reject button clicked');
            localStorage.setItem('cookieConsent', 'denied');
            hideBanner();
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({'event': 'cookie_consent_denied', 'analytics_storage': 'denied'});
            console.log('Consent denied');
        });

        // Cookie Settings link handler
        cookieSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showBanner();
            console.log('Reopening banner');
        });
    });