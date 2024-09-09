// Statistics counter Animation

function animatedCounter(target, duration = 3000, start = 0, elementId) {
    let startTime;
    let current = start;
    const counterElement = document.getElementById(elementId);

    if (!counterElement) return;

    function updateCounter(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const increment = (target - start) * (progress / duration);
        current = start + increment;

        if (progress < duration) {
            counterElement.innerHTML = `${Math.round(current)}<span class="text-dark-purple font-normal animate-pulse">+</span>`;
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.innerHTML = `${target}<span class="text-dark-purple font-normal animate-pulse">+</span>`;
        }
    }

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            requestAnimationFrame(updateCounter);
            observer.unobserve(counterElement);
        }
    });

    observer.observe(counterElement);
}

// Example usage
animatedCounter(36, 3000, 0, "counter1");
animatedCounter(36, 3000, 0, "counter2");
animatedCounter(36, 3000, 0, "counter3");
animatedCounter(36, 3000, 0, "counter4");





document.addEventListener("DOMContentLoaded", (event) => {
  // Register GSAP plugins
  gsap.registerPlugin(
    Flip, 
    ScrollTrigger, 
    Observer, 
    ScrollToPlugin, 
    Draggable, 
    MotionPathPlugin, 
    EaselPlugin, 
    PixiPlugin, 
    TextPlugin, 
    RoughEase, 
    ExpoScaleEase, 
    SlowMo, 
    CustomEase
  );
  
  // Animate .periodBox elements
  gsap.utils.toArray('.periodBox').forEach((box) => {
    gsap.fromTo(box, 
      { 
        filter: "grayscale(100%)",
        opacity: 0.1,
      },
      { 
        filter: "grayscale(0%)",
        opacity: 1,
        duration: 2,
        scrollTrigger: {
          trigger: box,        // Trigger the animation when this .periodBox enters the viewport
          start: "top 80%",    // Adjust start based on your needs
          end: "top 30%",      // Adjust end based on your needs
          toggleActions: "play none none none",
        }
      }
    );
  });

  // Animate .line elements
  gsap.utils.toArray('.line-v').forEach((line) => {
    gsap.from(line, 
      {
        height: "0%", // Start with zero height
        duration: 1,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: line,       // Trigger the animation when this .line-v enters the viewport
          start: "top 80%",    // Adjust start based on your needs
          end: "top 30%",      // Adjust end based on your needs
          toggleActions: "play none none none",
        }
      }
    );
  });
    
  // Animate .line-center elements
  gsap.utils.toArray('.line-center').forEach((line) => {
    gsap.from(line, 
      {
        scaleX: 0, // Start with scaleX of 0 (shrinks horizontally)
        transformOrigin: "center center", // Expand from the center
        duration: 1.5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: line,       // Trigger the animation when this .line-center enters the viewport
          start: "top 80%",    // Adjust start based on your needs
          end: "top 30%",      // Adjust end based on your needs
          toggleActions: "play none none none",
        }
      }
    );
  });
    
    // Define your blob shapes
  const shapes = [
    "M45272.5,22384.3A409.448,409.448,0,1,1,45272.5,21564.5A409.448,409.448,0,1,1,45272.5,22384.3Z", // Initial circle
    "M45700,21950C45880,21980 46300,22300 46000,22600C45800,22750 45400,22850 45300,22650C45200,22500 45100,22300 45100,22150C45100,21900 45300,21800 45700,21950Z" // Example blob shape
  ];

  // GSAP shape animation
  gsap.to("#gradientBG", {
    duration: 1,
    attr: { d: shapes[1] }, // Animation target shape
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });

  // Function to get random movement values
  function getRandomMovement(max) {
    return (Math.random() - 0.5) * 2 * max + 'vh'; // Random value between -max and +max
  }

  // GSAP movement animation with random direction
  function animateRandomMovement() {
    gsap.to("#gradientBG", {
      duration: 1,
      x: getRandomMovement(1.5), // Random x movement within -50 to +50 pixels
      y: getRandomMovement(1.5), // Random y movement within -50 to +50 pixels
      ease: "power1.inOut",
      onComplete: animateRandomMovement // Repeat animation with new random values
    });
  }

  animateRandomMovement(); // Start the random movement animation





  const randomElements = document.querySelectorAll('.random-content li');

// Helper function to generate random values
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// GSAP animation for each random element
randomElements.forEach((el) => {
  const delay = random(0, 5); // Delay between 0 and 5 seconds
  const duration = random(10, 30); // Animation duration between 10 and 30 seconds
  const size = random(20, 150); // Random font size
  const startX = random(0, window.innerWidth); // Random starting X position
  const endY = -200; // End off the screen
  const startY = window.innerHeight + 100; // Start just below the screen
  
  gsap.set(el, {
    fontSize: `${size}px`, // Random font size
    x: startX, // Random X position
    y: startY, // Start below the screen
    opacity: 0, // Hidden at first
  });
  
  // GSAP timeline
  gsap.to(el, {
    y: endY, // Move up off the screen
    opacity: 1, // Fade in
    ease: "power1.out",
    duration: duration, // Random duration
    delay: delay, // Random delay
    repeat: -1, // Infinite repeat
    onStart() {
      // Randomize content opacity during animation
      gsap.to(el, { opacity: random(0.3, 1), duration: 1, yoyo: true, repeat: -1 });
    },
    onRepeat() {
      // After each repeat, reset to new random positions and sizes
      gsap.set(el, {
        fontSize: `${random(20, 150)}px`, // Random font size
        x: random(0, window.innerWidth), // Random X position
        y: window.innerHeight + 100, // Reset starting position below the screen
      });
    }
  });
});
  
  
  
// Animate all bars from a scaleY of 0.1 to their original height (scaleY: 1)
gsap.from('.bar', {
  scaleY: 0.1,             // Start at scaleY 0.1
  transformOrigin: 'bottom', // Grow from the bottom
  duration: 1.5,           // Duration of the animation
  ease: 'power2.out',      // Easing for smooth growth
  stagger: 0.3             // Stagger the animation start times
});

  gsap.from('.circle', {
  scale: 0,                // Start from a scale of 0
  opacity: 0,              // Start from invisible
  duration: 1.5,           // Duration of the animation
  ease: 'back.out(1.7)',   // Easing for a bouncy effect
  stagger: 0.3,            // Stagger the animation start times
  rotate: 360,             // Rotate 360 degrees
  transformOrigin: 'center' // Set the transform origin to center
});


  
  

});



