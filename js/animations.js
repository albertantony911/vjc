document.addEventListener("DOMContentLoaded", function () {
  // Reusable IntersectionObserver for all counters
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counterElement = entry.target;
        const { target, duration, start, suffix } = counterElement.dataset;

        // Start counter animation using requestAnimationFrame
        animateCounter(counterElement, Number(start), Number(target), Number(duration), suffix || '+');
        
        observerInstance.unobserve(counterElement); // Stop observing this element
      }
    });
  }, { threshold: 0.5 }); // Trigger closer to center of viewport

  // Core animation function
  function animateCounter(element, startValue, targetValue, duration, suffix) {
    const frameRate = 20;  // Reduced frame rate to save CPU
    const increment = (targetValue - startValue) / (duration * frameRate);
    let currentValue = startValue;
    let frameCount = 0;

    function updateCounter() {
      currentValue += increment;
      frameCount++;

      // Stop animation if target is reached or exceeded
      if (currentValue >= targetValue || frameCount >= duration * frameRate) {
        element.textContent = `${targetValue}${suffix}`; // Set final value
      } else {
        element.textContent = `${Math.floor(currentValue)}${suffix}`;
        requestAnimationFrame(updateCounter);
      }
    }

    requestAnimationFrame(updateCounter); // Start the animation loop
  }

  // Initialize counters by assigning data attributes
  function initializeCounter(elementId, target, duration = 3, start = 0, suffix = '+') {
    const counterElement = document.getElementById(elementId);
    if (!counterElement || counterElement.dataset.initialized) return;

    // Store parameters on the element for reuse in the observer
    counterElement.dataset.target = target;
    counterElement.dataset.duration = duration;
    counterElement.dataset.start = start;
    counterElement.dataset.suffix = suffix;
    counterElement.dataset.initialized = 'true'; // Mark as initialized

    observer.observe(counterElement); // Start observing the element
  }

  // Example usage
  initializeCounter("counter1", 3000, 3, 0, '+');
  initializeCounter("counter2", 36, 3, 0, '+');
  initializeCounter("counter3", 40, 3, 0, '+');
  initializeCounter("counter4", 50, 3, 0, '%');
});




document.addEventListener("DOMContentLoaded", function () {
  // Function to activate IntersectionObserver for elements by class
  function activateScrollAnimation(className, threshold = 0.8) {
    const options = {
      root: null, // Observes the viewport
      rootMargin: "0px",
      threshold: threshold // Trigger when 80% of the element is visible
    };

    // IntersectionObserver callback
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active"); // Add 'active' class on enter
        } else {
          entry.target.classList.remove("active"); // Remove 'active' class on leave
        }
      });
    };

    // Create the IntersectionObserver with the specified options
    const observer = new IntersectionObserver(observerCallback, options);

    // Select all elements with the specified class and observe them
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => observer.observe(element));
  }

  // Activate IntersectionObserver for 'cloud' and 'floater' animations
  activateScrollAnimation("cloud");
  activateScrollAnimation("floater");
});







document.addEventListener("DOMContentLoaded", function () {
  // Function to activate IntersectionObserver for marquee items
  function activateMarqueeObserver() {
    const options = {
      root: null, // Observes the viewport
      rootMargin: "0px",
      threshold: 0.8 // Trigger when 80% of the element is visible
    };

    // IntersectionObserver callback
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    };

    // Create the IntersectionObserver with the specified options
    const observer = new IntersectionObserver(observerCallback, options);

    // Observe each marquee item
    const marqueeItems = document.querySelectorAll(".marquee__item");
    marqueeItems.forEach(item => observer.observe(item));
  }

  // Activate IntersectionObserver for marquee items
  activateMarqueeObserver();
});









// Select all elements with the triggering class
const elementsToAnimate = document.querySelectorAll('.scaler, .scaler-big');

// Create the Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Add the `active` class to trigger the animation
      entry.target.classList.add('active');
      
      // Optional: Unobserve the element if the animation should only happen once
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 }); // Trigger when 50% of the element is visible

// Observe each element with `.scaler` or `.scaler-big` class
elementsToAnimate.forEach(element => observer.observe(element));




document.addEventListener("DOMContentLoaded", initAnimation, { once: true });

// Initialize animation
function initAnimation() {
   const priceBars = document.querySelectorAll(".priceBar");
   animatePricingBars(priceBars, 100, 1, 0.1);
}

// Function to create translation and fade-in animation with stagger for elements
function animatePricingBars(elements, yValue, durationValue, staggerValue) {
   // Kill any existing tweens on the elements to prevent memory buildup
   gsap.killTweensOf(elements);

   // Define the animation with GSAP
   gsap.from(elements, {
      y: yValue,                   // Translate vertically by yValue pixels
      opacity: 0,                  // Start from 0 opacity for fade-in effect
      duration: durationValue,     // Duration of the animation
      ease: "power2.inOut",
      stagger: staggerValue        // Stagger time between each element's animation
   });
}


document.addEventListener("DOMContentLoaded", initMobileAnimation, { once: true });

// Initialize mobile animation
function initMobileAnimation() {
   const priceBars = document.querySelectorAll(".priceBarMob");
   priceBars.forEach((bar) => {
      animatePricingBar(bar, 100, 1); // Translate 100px on the y-axis and fade in over 1 second
   });
}

// Function to create a translation and fade-in animation for a single element
function animatePricingBar(element, yValue, durationValue) {
   // Clear any existing animation on the element to avoid overlap or memory leaks
   gsap.killTweensOf(element);

   // Animate the element with GSAP
   gsap.from(element, {
      y: yValue,
      opacity: 0,
      duration: durationValue,
      ease: "power2.inOut"
   });
}




document.addEventListener("DOMContentLoaded", () => {
  // Function to handle adding the visible class
  const revealBox = (box) => box.classList.add("visible");

  // Set up IntersectionObserver
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealBox(entry.target);  // Add the visible class
        observer.unobserve(entry.target);  // Stop observing after reveal
      }
    });
  }, { threshold: 0.8 });  // Trigger when 80% of the box is visible

  // Apply observer to each `.periodBox` element
  document.querySelectorAll('.periodBox').forEach((box) => observer.observe(box));
});






document.addEventListener("DOMContentLoaded", () => {
  // Function to handle adding the visible class
  const revealLine = (line) => line.classList.add("visible");

  // Set up IntersectionObserver
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealLine(entry.target);      // Add the visible class
        observer.unobserve(entry.target); // Stop observing after animation
      }
    });
  }, { threshold: 0.8 });  // Trigger when 80% of the line is visible

  // Apply observer to each `.line-v` element
  document.querySelectorAll('.line-v').forEach((line) => observer.observe(line));
});




document.addEventListener("DOMContentLoaded", () => {
  // Function to add the 'visible' class
  const revealLine = (line) => line.classList.add("visible");

  // Set up IntersectionObserver with specified start and end thresholds
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealLine(entry.target); // Trigger the animation by adding the class
        observer.unobserve(entry.target); // Stop observing after animation
      }
    });
  }, { threshold: 0.8 });  // Adjust threshold to control when animation starts (80% in view)

  // Apply observer to each `.line-center` element
  document.querySelectorAll('.line-center').forEach((line) => observer.observe(line));
});



/*
============================
  LANDING ANIMATION BEGINS
============================
*/
// Optimized GSAP animations for better performance

// Add will-change in JS (if not using CSS directly)
// Set any pre-animation styles
document.addEventListener("DOMContentLoaded", function () {
  gsap.set("#cog", {
    willChange: "transform"
  });

  // Animate the #cog only when it's in the viewport
  gsap.to("#cog", {
    rotation: 360,               // Rotate 360 degrees for one full rotation
    duration: 4,                 // Duration of one full rotation (adjust as needed)
    ease: "none",                // Linear movement, no easing
    repeat: -1,                  // Repeat infinitely
    transformOrigin: "50% 50%",  // Rotate around the center
    scrollTrigger: {
      trigger: "#cog",           // The element that triggers the animation
      start: "top 90%",          // Start the animation when #cog is 80% in the viewport
      end: "bottom 10%",         // End the animation when the bottom of #cog is 20% out of the viewport
      toggleActions: "play pause resume pause", // Play when in view, pause when out
      markers: false             // Set to true if you want to see visual markers for debugging
    }
  });
});



document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.float').forEach((element, index) => {
    element.style.setProperty('--n', index + 1);
  });
});




document.addEventListener("DOMContentLoaded", function () {
  // Precompute the transform origins for bars
  const barElements = ["#bar1", "#bar2", "#bar3"];
  const dotElements = ["#barDot1", "#barDot2", "#barDot3", "#graphDot1", "#graphDot2"];

  gsap.set(barElements, { transformOrigin: "bottom" });

  // Single timeline for bars and dots
  gsap.timeline({
      repeat: -1, 
      yoyo: true, 
      yoyoEase: "power1.inOut"
  })
  .to(barElements, {
      keyframes: [
          { scaleY: (i) => [0.6, 0.5, 0.9][i], duration: 1.5 },  // First keyframe for each bar with explicit duration
          { scaleY: (i) => [0.5, 1.0, 0.6][i], duration: 1.5 },  // Second keyframe
          { scaleY: (i) => [1.0, 0.6, 1.0][i], duration: 1.5 }   // Third keyframe
      ]
  })
  .to(dotElements, {
      keyframes: [
          { y: (i) => [73, 90, 17, 73, 90][i], duration: 1.5 },  // First keyframe for each dot with explicit duration
          { y: (i) => [90, 0, 73, 17, 0][i], duration: 1.5 },    // Second keyframe
          { y: (i) => [0, 73, 0, 0, 73][i], duration: 1.5 }      // Third keyframe
      ]
  }, 0);  // Sync with bars animation
});






document.addEventListener("DOMContentLoaded", function () {
  const originalYValues = [2122.11, -71.5, 13.8, -111];
  const deltaYValues = [-40, 70, -90, 100];

  const lineGraph = document.getElementById("lineGraph");

  let previousPath = "";

  // Precompute static path segments
  const staticSegments = ['67.326', '75.161', '47.985'];

  // Precompute all possible Y values for each step
  const totalSteps = 60; // Define number of steps per animation loop (60 steps = 60 frames per second)
  const precomputedYValues = Array.from({ length: totalSteps }, (_, i) => {
      const progress = i / (totalSteps - 1);
      return originalYValues.map((y, index) => y + deltaYValues[index] * progress);
  });

  // RequestAnimationFrame-based rendering loop for efficient animations
  const render = () => {
      const progressIndex = Math.floor(progressObject.progress * (totalSteps - 1));
      const newYValues = precomputedYValues[progressIndex];

      // Generate new path based on precomputed Y values
      const newPath = `m709.116 ${newYValues[0]} ${staticSegments[0]} ${newYValues[1]} ${staticSegments[1]} ${newYValues[2]} ${staticSegments[2]} ${newYValues[3]}`;

      // Only update if the path has changed
      if (newPath !== previousPath) {
          lineGraph.setAttribute('d', newPath); // Direct DOM update, no need for GSAP here
          previousPath = newPath;
      }

      // Request the next animation frame
      requestAnimationFrame(render);
  };

  // Start the render loop
  requestAnimationFrame(render);

  // Progress tracking object for GSAP
  const progressObject = { progress: 0 };

  // GSAP animation to update progress
  gsap.to(progressObject, {
      progress: 1,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      overwrite: true
  });
});






document.addEventListener("DOMContentLoaded", function () {
  // Cache the path and its length outside the animation code
  const path = document.querySelector("#lineGraphLarge");
  const pathLength = path.getTotalLength();  // Get and cache path length once

  // Set strokeDasharray and strokeDashoffset once
  gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
  });

  gsap.to(path, {
      duration: 3,           // Animation duration
      strokeDashoffset: 0,    // Reveal the stroke
      ease: "power1.inOut",   // Smooth easing
      repeat: -1,             // Infinite loop
      yoyo: true,
      overwrite: true         // Prevent any memory buildup
  });
});


  
 document.addEventListener("DOMContentLoaded", function () {
  function randomFadeAndReposition() {
      const container = document.querySelector("#currencyContainer");
      const symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];
      const pooledElements = [];
      const sideWidth = container.clientWidth * 0.2;
      const containerHeight = container.clientHeight;

      // Adjusting to a smaller pool size
      const poolSize = symbols.length; // Use the length of symbols array
      const precomputedPositionsLeft = Array.from({ length: poolSize }, () => Math.random() * sideWidth);
      const precomputedPositionsRight = Array.from({ length: poolSize }, () => container.clientWidth - sideWidth + Math.random() * sideWidth);
      
      let animationInterval;
      let currentSymbolIndex = 0; // Track the current symbol index

      function createOrReuseElement() {
          let currencyElement = pooledElements.length ? pooledElements.pop() : document.createElementNS("http://www.w3.org/2000/svg", "text");

          if (!currencyElement.hasAttribute("data-initialized")) {
              currencyElement.setAttribute("fill", "#89DB55");
              currencyElement.setAttribute("font-family", "Arial");
              currencyElement.setAttribute("stroke", "white");
              currencyElement.setAttribute("stroke-width", "0");
              currencyElement.setAttribute("data-initialized", "true");
              container.appendChild(currencyElement);
          }

          return currencyElement;
      }

      function animateElement(element, index, side) {
          element.textContent = symbols[index]; // Use the sequential symbol
          const startX = side === "left" ? precomputedPositionsLeft[index] : precomputedPositionsRight[index];
          const startY = -10;
          const endY = containerHeight + 50;

          gsap.set(element, { x: startX, y: startY, opacity: 1 });

          gsap.to(element, {
              y: endY,
              opacity: 0,
              duration: 20,
              ease: "none",
              onComplete: () => {
                  pooledElements.push(element);
              },
          });
      }

      function startAnimation() {
          if (!animationInterval) {
              for (let i = 0; i < 2; i++) {
                  const side = i === 0 ? "left" : "right";
                  animateElement(createOrReuseElement(), currentSymbolIndex, side);

                  // Update the symbol index and loop back if necessary
                  currentSymbolIndex = (currentSymbolIndex + 1) % poolSize;
              }

              animationInterval = setInterval(() => {
                  for (let i = 0; i < 2; i++) {
                      const side = i === 0 ? "left" : "right";
                      animateElement(createOrReuseElement(), currentSymbolIndex, side);

                      // Update the symbol index and loop back if necessary
                      currentSymbolIndex = (currentSymbolIndex + 1) % poolSize;
                  }
              }, 3000);
          }
      }

      function stopAnimation() {
          if (animationInterval) {
              clearInterval(animationInterval);
              animationInterval = null;
          }
      }

      function removeAllSymbols() {
          gsap.killTweensOf(container.querySelectorAll("text"));
          while (container.firstChild) {
              container.removeChild(container.firstChild);
          }
          pooledElements.length = 0;
      }

      document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
              stopAnimation();
              removeAllSymbols();
          } else {
              startAnimation();
          }
      });

      startAnimation();
  }

  randomFadeAndReposition();
});






document.addEventListener("DOMContentLoaded", function () {
  const lineGroup = document.querySelector("#dottedLine");
  const lineSpacing = 103;
  const numberOfLines = 5;
  const startingX = 586;
  const startingY = 641;
  const endingY = 800;

  const fragment = document.createDocumentFragment(); // Batch DOM manipulations

  for (let i = 0; i < numberOfLines; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

      // Set initial attributes using GSAP.set for better performance
      gsap.set(line, {
          attr: {
              x1: startingX + i * lineSpacing,
              y1: startingY,
              x2: startingX + i * lineSpacing,
              y2: endingY
          },
          strokeDasharray: "20, 20",
          strokeWidth: 10,
          strokeLinecap: "round",
          stroke: "#fff"
      });

      fragment.appendChild(line);

      // Animate strokeDashoffset using frame-based animation for smooth performance
      gsap.to(line, {
          strokeDashoffset: "+=40",
          duration: 1,
          ease: "none",
          repeat: -1,
          useFrames: false // Stick with frame-based animation for reduced recalculations
      });
  }

  // Append all lines at once to the DOM
  lineGroup.appendChild(fragment);
});



  /*
============================
  LANDING ANIMATION ENDS
============================
*/
document.addEventListener("DOMContentLoaded", function () {
    const countElement = document.querySelector('.calendarText');

    // Exit if countElement is not found
    if (!countElement) return;

    // Predefine valid numbers (0-30 excluding numbers with '1')
    const validNumbers = [
        2, 3, 4, 5, 6, 7, 8, 9,
        20, 22, 23, 24, 25, 26, 27, 28, 29, 30
    ];

    let shuffledNumbers = [...validNumbers]; // Clone the array for shuffling
    let currentIndex = 0;

    // Function to shuffle the array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Initialize with the first shuffled number
    shuffleArray(shuffledNumbers);
    countElement.textContent = String(shuffledNumbers[currentIndex]).padStart(2, '0');
    currentIndex++;

    // GSAP animation for the random number change
    gsap.to({}, {
        duration: 1.9, // Duration of each number change
        repeat: -1, // Infinite loop
        ease: "power2.inOut", // Smooth easing effect
        onRepeat: () => {
            if (currentIndex >= shuffledNumbers.length) {
                shuffleArray(shuffledNumbers); // Reshuffle when all numbers are used
                currentIndex = 0; // Reset the index
            }
            const randomNumber = shuffledNumbers[currentIndex];
            currentIndex++;

            // Combine fade out, text change, and fade in into a single animation
            gsap.to(countElement, {
                keyframes: [
                    { autoAlpha: 0, duration: 0.2 }, // Fade out
                    {
                        autoAlpha: 1, duration: 0.2, delay: 0, // Fade back in
                        onStart: () => {
                            countElement.textContent = String(randomNumber).padStart(2, '0'); // Update number
                        }
                    }
                ]
            });
        }
    });
});






  


  
  






document.addEventListener("DOMContentLoaded", function () {
  // Function to toggle 'active' class based on a single scroll trigger for multiple elements
  function activateScrollTrigger(triggerElement, targetElements, triggerPosition = "top 80%") {
    ScrollTrigger.create({
      trigger: triggerElement,
      start: triggerPosition, // Start when triggerElement reaches 80% of the viewport
      onEnter: () => targetElements.forEach(el => el.classList.add("active")),
      onLeave: () => targetElements.forEach(el => el.classList.remove("active")),
      onEnterBack: () => targetElements.forEach(el => el.classList.add("active")),
      onLeaveBack: () => targetElements.forEach(el => el.classList.remove("active"))
    });
  }

  // Select the rotating group to be used as the trigger
  const rotatingGroup = document.querySelector(".rotating-group-landing");
  // Select the icons and the rotating group itself as targets
  const rotatingElements = document.querySelectorAll(".rotating-icon-1, .rotating-icon-2, .rotating-icon-3, .rotating-icon-4, .rotating-icon-5, .rotating-group-landing");

  // Apply ScrollTrigger with rotating group as the single trigger for all rotating elements
  if (rotatingGroup && rotatingElements.length > 0) {
    activateScrollTrigger(rotatingGroup, rotatingElements);
  }
});




document.addEventListener("DOMContentLoaded", function () {
  // Function to toggle 'active' class based on a single scroll trigger for multiple elements
  function activateScrollTrigger(triggerElement, targetElements, triggerPosition = "top 80%") {
    ScrollTrigger.create({
      trigger: triggerElement,
      start: triggerPosition, // Start when triggerElement reaches 80% of the viewport
      onEnter: () => targetElements.forEach(el => el.classList.add("active")),
      onLeave: () => targetElements.forEach(el => el.classList.remove("active")),
      onEnterBack: () => targetElements.forEach(el => el.classList.add("active")),
      onLeaveBack: () => targetElements.forEach(el => el.classList.remove("active"))
    });
  }

  // Select the rotating group to be used as the trigger
  const rotatingGroup = document.querySelector(".rotating-group-cloud");
  // Select the icons and the rotating group itself as targets
  const rotatingElements = document.querySelectorAll(".rotating-icon-cloud-1, .rotating-icon-cloud-2, .rotating-icon-cloud-3, .rotating-icon-cloud-4, .rotating-icon-cloud-5, .rotating-icon-cloud-6, .rotating-icon-cloud-7, .rotating-icon-cloud-main, .rotating-group-cloud ");

  // Apply ScrollTrigger with rotating group as the single trigger for all rotating elements
  if (rotatingGroup && rotatingElements.length > 0) {
    activateScrollTrigger(rotatingGroup, rotatingElements);
  }
});


