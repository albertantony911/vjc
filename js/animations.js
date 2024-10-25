function initializeGSAP() {
    gsap.registerPlugin(ScrollTrigger);
}

// Ensure GSAP is initialized first
initializeGSAP();


document.addEventListener("DOMContentLoaded", function () {
  function gsapCounterOptimized(target, duration = 3, start = 0, elementId, suffix = '+', updateFrequency = 2) {
    const counterElement = document.getElementById(elementId);
    if (!counterElement) return;

    // Define the counter animation
    const startAnimation = () => {
      gsap.to({ value: start }, {
        value: target,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: function () {
          if (gsap.ticker.frame % updateFrequency === 0) {
            counterElement.textContent = `${Math.floor(this.targets()[0].value)}${suffix}`;
          }
        },
        onComplete: function () {
          counterElement.textContent = `${target}${suffix}`;
        }
      });
    };

    // Create an IntersectionObserver to trigger animation on view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(entry.target); // Stop observing once animation starts
        }
      });
    }, { threshold: 0.8 }); // Trigger when 80% of the element is in view

    observer.observe(counterElement); // Start observing the element
  }

  // Example usage
  gsapCounterOptimized(3000, 3, 0, "counter1", '+', 2);
  gsapCounterOptimized(36, 3, 0, "counter2", '+', 3);
  gsapCounterOptimized(40, 3, 0, "counter3", '+', 2);
  gsapCounterOptimized(50, 3, 0, "counter4", '%', 3);
});






document.addEventListener("DOMContentLoaded", function () {
  // Function to activate ScrollTrigger for elements
  function activateScrollAnimation(className, triggerPosition = "top 80%") {
    // Select all elements with the specified class
    const elements = document.querySelectorAll(`.${className}`);
    
    elements.forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: triggerPosition, // Start animation when element reaches viewport
        onEnter: () => element.classList.add("active"), // Add 'active' class
        onLeave: () => element.classList.remove("active"), // Remove 'active' class when leaving
        onEnterBack: () => element.classList.add("active"),
        onLeaveBack: () => element.classList.remove("active"),
      });
    });

    // Ensure all ScrollTriggers are up-to-date
    ScrollTrigger.refresh();
  }

  // Activate ScrollTrigger for both 'cloud' and 'floater' animations
  activateScrollAnimation("cloud");
  activateScrollAnimation("floater");
});









document.addEventListener("DOMContentLoaded", function () {
  // Function to activate ScrollTrigger for marquee items
  function activateMarqueeScrollTrigger() {
    const marqueeItems = document.querySelectorAll(".marquee__item");

    marqueeItems.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top 80%", // Adjust based on when you want animation to start
        onEnter: () => item.classList.add("active"), // Start animation
        onLeave: () => item.classList.remove("active"), // Stop animation if desired
        onEnterBack: () => item.classList.add("active"),
        onLeaveBack: () => item.classList.remove("active")
      });
    });

    // Ensure ScrollTriggers are up-to-date
    ScrollTrigger.refresh();
  }

  // Activate ScrollTrigger for marquee items
  activateMarqueeScrollTrigger();
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
  const rotatingGroup = document.querySelector(".rotating-group");
  // Select the icons and the rotating group itself as targets
  const rotatingElements = document.querySelectorAll(".rotating-icon-1, .rotating-icon-2, .rotating-icon-3, .rotating-icon-4, .rotating-icon-5, .rotating-group");

  // Apply ScrollTrigger with rotating group as the single trigger for all rotating elements
  if (rotatingGroup && rotatingElements.length > 0) {
    activateScrollTrigger(rotatingGroup, rotatingElements);
  }
});




document.addEventListener("DOMContentLoaded", function () {
  
  // Common ScrollTrigger function for scaling animations
  function createScalingAnimation(element, scaleXValue, scaleYValue, opacityValue, durationValue) {
    gsap.to(element, {
      scaleX: scaleXValue,               // Scale on the X-axis
      scaleY: scaleYValue,               // Scale on the Y-axis
      opacity: opacityValue,             // Change opacity
      duration: durationValue,           // Duration of the animation
      ease: "power2.inOut",              // Smooth ease effect
      transformOrigin: "50% 50%",        // Scale from the center of the element
      scrollTrigger: {
        trigger: element,                // The element that triggers the animation
        start: "top 60%",                // Start a little before center (when the top of the element is at 60% of the viewport)
        end: "bottom 10%",               // End when the center leaves the viewport
        toggleActions: "play reverse play reverse",  // Play on enter, reverse on leave
        markers: false                   // Set to true if you want debugging markers
      }
    });
  }

  // Apply animations using the common function
  createScalingAnimation(".scaler", 0.7, 0.7, 0.2, 0.5);       // Animation for .scaler
  createScalingAnimation(".scaler-big", 1.4, 1.4, 1, 0.5);     // Animation for .scaler-big (focuses on scaling bigger)
});





document.addEventListener("DOMContentLoaded", function () {

  // Function to create a translation and fade-in animation with stagger for the elements
  function pricingBarDesk(elements, yValue, durationValue, staggerValue) {
    gsap.from(elements, {
      y: yValue,                 // Translate vertically by yValue pixels
      opacity: 0,                // Start from 0 opacity for fade-in effect
      duration: durationValue,   // Duration of the animation
      ease: "power2.inOut",
      stagger: staggerValue      // Stagger time between each element's animation
    });
  }

  // Select all elements with the class .priceBar and apply the animation with stagger
  const priceBars = document.querySelectorAll(".priceBar");
  pricingBarDesk(priceBars, 100, 1, 0.1); // 0.2s stagger between each element

});




document.addEventListener("DOMContentLoaded", function () {

  // Function to create a basic translation and fade-in animation for each element
  function pricingBarMob(element, yValue, durationValue) {
    gsap.from(element, {
      y: yValue,                 // Translate vertically by yValue pixels
      opacity: 0,                // Start from 0 opacity for fade-in effect
      duration: durationValue,   // Duration of the animation
      ease: "power2.inOut"
    });
  }

  // Select all elements with the class .priceBar and apply the animation individually
  document.querySelectorAll(".priceBarMob").forEach((bar) => {
    pricingBarMob(bar, 100, 1); // Translate 100px on the y-axis and fade in over 1 second
  });

});





document.addEventListener("DOMContentLoaded", function () {
  // Function to handle animation for each element
  function animatePeriodBox(box) {
    gsap.fromTo(box, 
      { 
        opacity: 0.1,
        color: "#999",
      },
      { 
        opacity: 1,
        color: "#000",
        duration: 2,
        onComplete: () => observer.unobserve(box) // Stop observing once animation completes
      }
    );
  }

  // Set up IntersectionObserver to trigger animations on view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animatePeriodBox(entry.target); // Start animation
      }
    });
  }, { threshold: 0.8 }); // Trigger when 80% of the box is visible

  // Apply observer to each `.periodBox` element
  gsap.utils.toArray('.periodBox').forEach((box) => {
    observer.observe(box); // Start observing the element
  });
});


document.addEventListener("DOMContentLoaded", function () {
  function animateLine(line) {
    gsap.from(line, {
      scaleY: 0,                  // Start with scaleY at 0 (no height)
      transformOrigin: "top",     // Scale from the top
      duration: 1,
      ease: "power1.inOut",
      onComplete: () => observer.unobserve(line) // Stop observing once animation completes
    });
  }

  // Set up IntersectionObserver to trigger animations on view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateLine(entry.target); // Start animation
      }
    });
  }, { threshold: 0.8 }); // Trigger when 80% of the line is visible

  // Apply observer to each `.line-v` element
  gsap.utils.toArray('.line-v').forEach((line) => {
    observer.observe(line); // Start observing the element
  });
});




document.addEventListener("DOMContentLoaded", function () {
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
          once: true // Animation plays only once when it enters the viewport
        }
      }
    );
  });
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
        duration: 1.5, // Duration of each number change
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
  const circles = document.querySelectorAll('circle.calendarDots');
  let circleIndex = 0; // To keep track of the current circle

  // Function to change the color of the next circle and reset the previous one
  function changeNextCircleColor() {
    // Reset the previous circle
    const prevCircle = circles[(circleIndex - 1 + circles.length) % circles.length];
    gsap.to(prevCircle, { fill: '#fff', stroke: 'none', duration: 0.5 });

    // Change the color of the current circle
    const nextCircle = circles[circleIndex];
    gsap.to(nextCircle, { fill: '#7ED348', stroke: '#fff', duration: 0.5 });

    // Increment circleIndex, reset if we've reached the end
    circleIndex = (circleIndex + 1) % circles.length;
  }

  // GSAP timeline to repeat the color change every 1.5 seconds
  gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
    .call(changeNextCircleColor);
});



  


  
  
document.addEventListener("DOMContentLoaded", function () {
  // Function to create fade-in/fade-out animations between two sets of elements
  function createSeamlessFadeAnimation(blog1Elements, blog2Elements, options = {}) {
    // Default options for timing and staggering
    const { fadeDuration = 1, delayBetween = .2, staggerDelay = 0.1 } = options;

    // Convert NodeLists to arrays for better manipulation
    const blog1Array = Array.from(blog1Elements);
    const blog2Array = Array.from(blog2Elements);

    // Initial setup: Make sure blog1 is visible and blog2 is hidden
    gsap.set(blog1Array, { opacity: 1, visibility: 'visible' });
    gsap.set(blog2Array, { opacity: 0, visibility: 'hidden' });

    // Main timeline controlling the whole animation cycle
    const mainTimeline = gsap.timeline({ repeat: -1 });

    // Reusable function to create fade transition between two element arrays
    function createFadeTransition(fromElements, toElements) {
      return mainTimeline
        .to(fromElements, {
          opacity: 0,
          duration: fadeDuration,
          ease: "power1.inOut",
          stagger: staggerDelay
        })
        .set(fromElements, { visibility: 'hidden' }) // Hide the "from" elements
        .set(toElements, { visibility: 'visible', opacity: 0 }) // Show the "to" elements but keep opacity 0
        .to(toElements, {
          opacity: 1,
          duration: fadeDuration,
          ease: "power1.inOut",
          stagger: staggerDelay,
          delay: delayBetween // Delay before starting fade-in
        });
    }

    // Fade transitions between blog1 -> blog2, and then blog2 -> blog1
    createFadeTransition(blog1Array, blog2Array);
    createFadeTransition(blog2Array, blog1Array);
  }

  // Apply the animation to all elements with the class `.blog1` and `.blog2`
  const blog1Elements = document.querySelectorAll('.blog1');
  const blog2Elements = document.querySelectorAll('.blog2');

  // Only create animation if both blog1 and blog2 elements exist
  if (blog1Elements.length > 0 && blog2Elements.length > 0) {
    createSeamlessFadeAnimation(blog1Elements, blog2Elements, {
      fadeDuration: 1,  // Customize fade duration if needed
      delayBetween: .2,  // Delay between transitions
      staggerDelay: 0.1 // Staggered delay for smoother animations
    });
  }
});





document.addEventListener("DOMContentLoaded", function () {
  // Function to randomly fade out and fade in elements with repeating animation
  function circleFadeRandom(elements, { duration = 2, minDelay = 1, maxDelay = 3, stagger = 2 } = {}) {
    elements.forEach(element => {
      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      gsap.to(element, {
        opacity: 0,
        duration: duration,
        delay: randomDelay,
        ease: "power1.inOut",
        repeat: -1, // Repeat infinitely
        yoyo: true, // Fade back in after fading out
        stagger: stagger // Stagger to keep the animation continuous
      });
    });
  }

  // Example usage for multiple circles with the class `.circleFade`
  const circleFadeElements = document.querySelectorAll('.circleFade');
  circleFadeRandom(circleFadeElements, {
    duration: 2, // Duration of the fade-out
    minDelay: 1, // Minimum delay before starting the fade-out
    maxDelay: 3, // Maximum delay before starting the fade-out (randomized)
    stagger: 2 // Stagger between the elements to keep them animating continuously
  });
});


  
  

document.addEventListener("DOMContentLoaded", function () {
    gsap.to(".bouncerRight", {
        x: 30,                         // Move to the right by 30px
        duration: 1,                   // Duration of the animation
        ease: "elastic.out(0.9, 0.5)", // Elastic bounce effect
        yoyo: true,                    // Returns back to its original position
        repeat: -1                     // Repeats infinitely
    });
});

    



 document.addEventListener("DOMContentLoaded", function () {
    gsap.to(".rotateRight", {
        rotate: 10,                     // Rotate to the right by 10 degrees
        duration: 1,                    // Duration of the rotation animation
        ease: "elastic.out(0.9, 0.5)",  // Elastic bounce effect for rotation
        transformOrigin: "50% 100%",    // Set the rotation origin to the bottom center point
        yoyo: true,                     // Returns back to its original position
        repeat: -1,                     // Infinite repetition
        repeatDelay: 1                  // Delay of 1 second between each repeat
    });
});




document.addEventListener("DOMContentLoaded", function () {
    gsap.to(".rotateLeft", {
        rotate: -5,
        x: 10,
        duration: 1,                    // Duration of the rotation animation
        ease: "elastic.out(0.9, 0.5)",  // Elastic bounce effect for rotation
        transformOrigin: "50% 100%",    // Set the rotation origin to the bottom center point
        yoyo: true,                     // Returns back to its original position
        repeat: -1,                     // Infinite repetition
        repeatDelay: 1                  // Delay of 1 second between each repeat
    });
});

  


 
  
  












