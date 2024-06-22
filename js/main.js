// Hamburger menu Animation

document.addEventListener("DOMContentLoaded", function () {
  const menuButtonContainer = document.getElementById("menuButtonContainer");
  const nav = document.querySelector("nav");
  const menuItems = document.querySelectorAll(".menudrop li");

  menuButtonContainer.addEventListener("click", function() {
    // Toggle the 'menu-open' class to trigger the animations
    menuButtonContainer.classList.toggle("menu-open");

    // Toggle the 'translate-y-[-100%]' class to open/close the navigation menu
    nav.classList.toggle("translate-y-[-100%]");

    // Toggle the 'toggled' class on the list items
    menuItems.forEach(item => item.classList.toggle("toggled"));
  });
   });