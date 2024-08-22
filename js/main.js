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
        const isMenuOpen = nav.classList.toggle("translate-y-[-100%]");
        menuButtonContainer.classList.toggle("menu-open");
        menuItems.forEach(item => item.classList.toggle("toggled"));
        if (isMenuOpen) {
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


window.addEventListener('load', () => {
  AOS.init();
  AOS.refresh();
});

// You can also pass an optional settings object
// below listed default settings

AOS.init({
  // Global settings:
  disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
  startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
  initClassName: 'aos-init', // class applied after initialization
  animatedClassName: 'aos-animate', // class applied on animation
  useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
  disableMutationObserver: false, // disables automatic mutations' detections (advanced)
  debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
  throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)
  

  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 400, // values from 0 to 3000, with step 50ms
  easing: 'ease', // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});;

   

