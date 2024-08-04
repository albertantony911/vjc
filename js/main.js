



// Hamburger menu Animation

document.addEventListener("DOMContentLoaded", function () {
  const menuButtonContainer = document.getElementById("menuButtonContainer");
  const nav = document.querySelector("nav");
  const mainMenuItems = document.querySelectorAll("#mainMenu li");
  const serviceMenuItems = document.querySelectorAll("#serviceMenu li");

  const mainMenu = document.getElementById("mainMenu");
  const serviceMenu = document.getElementById("serviceMenu");
  const serviceButton = document.getElementById("serviceButton");
  const backButton = document.getElementById("backButton");

  const itemTransitionDelay = 10;
  const menuTransitionDuration = 0.2;

  const initializeMenuItems = (items) => {
    items.forEach(item => {
      item.style.transitionDuration = `${menuTransitionDuration}s`;
      item.style.opacity = 0;
      item.style.transform = "translateY(-20px)";
    });
  };

  initializeMenuItems(mainMenuItems);
  initializeMenuItems(serviceMenuItems);

  const toggleMenuItems = (items, show) => {
    items.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = show ? 1 : 0;
        item.style.transform = show ? "translateY(0)" : "translateY(-20px)";
      }, index * itemTransitionDelay);
    });
  };

  const toggleMenu = () => {
    menuButtonContainer.classList.toggle("menu-open");
    nav.classList.toggle("translate-y-[-100%]");
    toggleMenuItems(mainMenuItems, menuButtonContainer.classList.contains("menu-open"));
  };

  const showServiceMenu = () => {
    toggleMenuItems(mainMenuItems, false);
    setTimeout(() => {
      toggleMenuItems(serviceMenuItems, true);
    }, mainMenuItems.length * itemTransitionDelay);
    mainMenu.classList.add("hidden");
    serviceMenu.classList.remove("hidden");
  };

  const showMainMenu = () => {
    toggleMenuItems(serviceMenuItems, false);
    setTimeout(() => {
      toggleMenuItems(mainMenuItems, true);
    }, serviceMenuItems.length * itemTransitionDelay);
    serviceMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
  };

  menuButtonContainer.addEventListener("click", toggleMenu);
  serviceButton.addEventListener("click", showServiceMenu);
  backButton.addEventListener("click", showMainMenu);

  showMainMenu();
  menuButtonContainer.addEventListener("click", () => {
    if (!menuButtonContainer.classList.contains("menu-open")) {
      showMainMenu();
    }
  });
});



window.addEventListener('load', () => {
  AOS.init();
  AOS.refresh();
});

   

