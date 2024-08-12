// Hamburger menu Animation

document.addEventListener("DOMContentLoaded", () => {
  const getEl = (id) => document.getElementById(id);
  const getEls = (selector) => document.querySelectorAll(selector);

  const menuButtonContainer = getEl("menuButtonContainer");
  const nav = document.querySelector("nav");
  const mainMenuItems = getEls("#mainMenu li");
  const serviceMenuItems = getEls("#serviceMenu li");

  const mainMenu = getEl("mainMenu");
  const serviceMenu = getEl("serviceMenu");
  const serviceButton = getEl("serviceButton");
  const backButton = getEl("backButton");

  const toggleMenuItems = (items, show) => {
    items.forEach(item => item.classList.toggle("toggled", show));
  };

  const toggleMenu = () => {
    menuButtonContainer.classList.toggle("menu-open");
    nav.classList.toggle("translate-y-[-100%]");
    toggleMenuItems(mainMenuItems, menuButtonContainer.classList.contains("menu-open"));
  };

  const switchMenu = (hideItems, showItems, hideMenu, showMenu) => {
    toggleMenuItems(hideItems, false);
    toggleMenuItems(showItems, true);
    hideMenu.classList.add("hidden");
    showMenu.classList.remove("hidden");
  };

  menuButtonContainer.addEventListener("click", () => {
    toggleMenu();
    if (!menuButtonContainer.classList.contains("menu-open")) {
      switchMenu(serviceMenuItems, mainMenuItems, serviceMenu, mainMenu);
    }
  });

  serviceButton.addEventListener("click", () => switchMenu(mainMenuItems, serviceMenuItems, mainMenu, serviceMenu));
  backButton.addEventListener("click", () => switchMenu(serviceMenuItems, mainMenuItems, serviceMenu, mainMenu));

  switchMenu(serviceMenuItems, mainMenuItems, serviceMenu, mainMenu);
});





window.addEventListener('load', () => {
  AOS.init();
  AOS.refresh();
});

   

