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

  const itemTransitionDelay = 10; // Adjust the transition delay time here (in milliseconds)
  const menuTransitionDuration = 0.2; // Adjust the menu transition duration here (in seconds)

  // Initialize menu items
  mainMenuItems.forEach(item => {
    item.style.transitionDuration = `${menuTransitionDuration}s`;
    item.style.opacity = 0;
    item.style.transform = "translateY(-20px)";
  });

  serviceMenuItems.forEach(item => {
    item.style.transitionDuration = `${menuTransitionDuration}s`;
    item.style.opacity = 0;
    item.style.transform = "translateY(-20px)";
  });

  // Function to toggle menu visibility
  const toggleMenu = () => {
    menuButtonContainer.classList.toggle("menu-open");
    nav.classList.toggle("translate-y-[-100%]");

    if (menuButtonContainer.classList.contains("menu-open")) {
      // Show main menu with animation
      mainMenuItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = 1;
          item.style.transform = "translateY(0)";
        }, index * itemTransitionDelay);
      });
    } else {
      // Hide main menu with animation
      mainMenuItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = 0;
          item.style.transform = "translateY(-20px)";
        }, index * itemTransitionDelay);
      });
    }

    // Toggle 'toggled' class on main menu items
    mainMenuItems.forEach(item => item.classList.toggle("toggled"));
  };

  // Function to show service menu with animation
  const showServiceMenu = () => {
    // Hide main menu items
    mainMenuItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = 0;
        item.style.transform = "translateY(-20px)";
      }, index * itemTransitionDelay);
    });

    // Show service menu title first
    setTimeout(() => {
      serviceMenuItems[0].style.opacity = 1;
      serviceMenuItems[0].style.transform = "translateY(0)";
    }, mainMenuItems.length * itemTransitionDelay);

    // Show remaining service menu items with delay
    setTimeout(() => {
      serviceMenuItems.forEach((item, index) => {
        if (index > 0) {
          setTimeout(() => {
            item.style.opacity = 1;
            item.style.transform = "translateY(0)";
          }, index * itemTransitionDelay);
        }
      });
    }, (mainMenuItems.length + 1) * itemTransitionDelay);

    // Ensure the service menu is visible
    mainMenu.classList.add("hidden");
    serviceMenu.classList.remove("hidden");
  };

  // Function to show main menu with animation
  const showMainMenu = () => {
    // Hide service menu items
    serviceMenuItems.forEach((item, index) => {
      setTimeout(() => {
        item.style.opacity = 0;
        item.style.transform = "translateY(-20px)";
      }, index * itemTransitionDelay);
    });

    // Show main menu items with delay
    setTimeout(() => {
      mainMenuItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.opacity = 1;
          item.style.transform = "translateY(0)";
        }, index * itemTransitionDelay);
      });
    }, serviceMenuItems.length * itemTransitionDelay);

    // Ensure the main menu is visible
    serviceMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
  };

  // Event listeners
  menuButtonContainer.addEventListener("click", toggleMenu);
  serviceButton.addEventListener("click", showServiceMenu);
  backButton.addEventListener("click", showMainMenu);

  // Ensure main menu is default when page loads
  showMainMenu(); // Initial call to set main menu as default

  // Ensure main menu is default when menu is closed
  menuButtonContainer.addEventListener("click", () => {
    if (!menuButtonContainer.classList.contains("menu-open")) {
      showMainMenu();
    }
  });
});




   

