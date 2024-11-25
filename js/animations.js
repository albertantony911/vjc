document.addEventListener("DOMContentLoaded", function () {
  function activateScrollAnimations(configurations) {
    configurations.forEach(({ className, observeOnce = false, customClass, threshold = 0.5, childSelector }) => {
      // Create a new observer for each configuration with the specified threshold
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (childSelector) {
              // Handle child elements if childSelector is specified
              entry.target.querySelectorAll(childSelector).forEach(child => {
                child.classList.add(customClass || "active");
              });
            } else {
              const targetClass = entry.target.dataset.revealClass || "active"; // Default to 'active' if no custom class
              entry.target.classList.add(targetClass); // Add the respective class
            }
            if (observeOnce) {
              observer.unobserve(entry.target); // Unobserve if animation should happen once
            }
          } else {
            if (!observeOnce) {
              if (childSelector) {
                // Handle child elements if childSelector is specified
                entry.target.querySelectorAll(childSelector).forEach(child => {
                  child.classList.remove(customClass || "active");
                });
              } else {
                const targetClass = entry.target.dataset.revealClass || "active";
                entry.target.classList.remove(targetClass); // Remove the class on leave
              }
            }
          }
        });
      }, { threshold }); // Apply the threshold

      // Query and observe all elements with the specified class
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(element => {
        element.dataset.observeOnce = observeOnce.toString(); // Set observe-once flag
        if (customClass) element.dataset.revealClass = customClass; // Set custom class if provided
        observer.observe(element); // Start observing
      });
    });
  }

  // Activate animations for various classes with configurations
  activateScrollAnimations([
    { className: "cloud", threshold: 0.8 },
    { className: "floater", threshold: 0.8 },
    { className: "pulser", threshold: 0.8 },
    { className: "marquee__item", threshold: 0.8 },
    { className: "periodBox", threshold: 0.8, customClass: "visible" },
    { className: "line-v", threshold: 0.8, customClass: "visible" },
    { className: "line-center", threshold: 0.8, customClass: "visible" },
    { className: "flasher", threshold: 0.8 },
    { className: "calendarDots", threshold: 0.8 },
    { className: "infrastructure-trigger", threshold: 0.8, childSelector: ".scaler", customClass: "active"}
  ]);
});




// Rotating animation control

document.addEventListener("DOMContentLoaded", function () {
  // Function to toggle 'active' class based on a single scroll trigger for multiple elements
  function activateScrollTrigger(triggerElement, targetElements, triggerPosition = "top 80%") {
    if (!triggerElement || targetElements.length === 0) return; // Guard clause
    ScrollTrigger.create({
      trigger: triggerElement,
      start: triggerPosition, // Start when triggerElement reaches 80% of the viewport
      onEnter: () => targetElements.forEach(el => el.classList.add("active")),
      onLeave: () => targetElements.forEach(el => el.classList.remove("active")),
      onEnterBack: () => targetElements.forEach(el => el.classList.add("active")),
      onLeaveBack: () => targetElements.forEach(el => el.classList.remove("active"))
    });
  }

  // Group configurations
  const groups = [
    { trigger: ".rotating-group-landing", targets: [".rotating-icon-1", ".rotating-icon-2", ".rotating-icon-3", ".rotating-icon-4", ".rotating-icon-5", ".rotating-group-landing"] },
    { trigger: ".rotating-group-cloud", targets: [".rotating-icon-cloud-1", ".rotating-icon-cloud-2", ".rotating-icon-cloud-3", ".rotating-icon-cloud-4", ".rotating-icon-cloud-5", ".rotating-icon-cloud-6", ".rotating-icon-cloud-7", ".rotating-group-cloud"] },
    { trigger: ".rotating-group-vcfo", targets: [".rotating-icon-vcfo-1", ".rotating-icon-vcfo-2", ".rotating-icon-vcfo-3", ".rotating-icon-vcfo-4", ".rotating-icon-vcfo-5", ".rotating-group-vcfo"] },
    { trigger: ".rotating-group-audit", targets: [".rotating-icon-audit-1", ".rotating-icon-audit-2", ".rotating-icon-audit-3", ".rotating-icon-audit-4", ".rotating-icon-audit-5", ".rotating-icon-audit-6", ".rotating-group-audit"] },
    { trigger: ".rotating-group-legal", targets: [".rotating-icon-legal-1", ".rotating-icon-legal-2", ".rotating-icon-legal-3", ".rotating-icon-legal-4", ".rotating-icon-legal-5", ".rotating-icon-legal-6", ".rotating-icon-legal-7", ".rotating-icon-legal-8", ".rotating-icon-legal-9", ".rotating-icon-legal-10", ".rotating-icon-legal-11", ".rotating-group-legal"] }
  ];

  // Loop through each group and initialize ScrollTrigger
  groups.forEach(({ trigger, targets }) => {
    const triggerElement = document.querySelector(trigger);
    const targetElements = document.querySelectorAll(targets.join(", "));
    activateScrollTrigger(triggerElement, targetElements);
  });
});



// Additional setup for elements with 'float' class
  document.querySelectorAll('.float').forEach((element, index) => {
    element.style.setProperty('--n', index + 1); // Add index-based custom property
  });






document.addEventListener("DOMContentLoaded", function () {
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
    const totalFrames = Math.round(duration * 60); // Fixed 60 FPS
    const increment = (targetValue - startValue) / totalFrames;
    let currentValue = startValue;
    let frame = 0;

    function updateCounter() {
      // Directly set precomputed value without additional math
      element.textContent = `${Math.round(currentValue)}${suffix}`;

      // Increment precomputed value
      currentValue += increment;
      frame++;

      // Stop animation if target is reached
      if (frame < totalFrames) {
        requestAnimationFrame(updateCounter);
      } else {
        // Set final value explicitly
        element.textContent = `${targetValue}${suffix}`;
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
    function randomFadeAndReposition() {
        const container = document.querySelector("#currencyContainer");
        const symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];
        const pooledElements = [];
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;
        const sideWidth = containerWidth * 0.2;

        const precomputedRandoms = Array.from({ length: 50 }, () => Math.random());
        let randomIndex = 0;
        const getRandom = () => precomputedRandoms[(randomIndex++) % precomputedRandoms.length];

        const precomputePositions = () => ({
            left: Array.from({ length: symbols.length }, () => getRandom() * sideWidth),
            right: Array.from({ length: symbols.length }, () => containerWidth - sideWidth + getRandom() * sideWidth),
        });

        let positions = precomputePositions();
        const startY = -10;
        const endY = containerHeight + 50;

        const updateDimensions = () => {
            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;
            positions = precomputePositions();
        };

        const throttle = (func, limit) => {
            let lastFunc, lastRan;
            return function () {
                const context = this;
                const args = arguments;
                if (!lastRan) {
                    func.apply(context, args);
                    lastRan = Date.now();
                } else {
                    clearTimeout(lastFunc);
                    lastFunc = setTimeout(() => {
                        if (Date.now() - lastRan >= limit) {
                            func.apply(context, args);
                            lastRan = Date.now();
                        }
                    }, limit - (Date.now() - lastRan));
                }
            };
        };
        window.addEventListener("resize", throttle(updateDimensions, 200));

        const createOrReuseElement = () => {
            const element = pooledElements.pop() || document.createElementNS("http://www.w3.org/2000/svg", "text");
            if (!element.parentNode) {
                element.setAttribute("text-anchor", "middle");
                element.style.willChange = "transform, opacity";
                container.appendChild(element);
            }
            return element;
        };

        const animateElement = (element, index, side) => {
            element.textContent = symbols[index];
            const startX = side === "left" ? positions.left[index] : positions.right[index];

            gsap.set(element, { x: startX, y: startY, opacity: 1 });

            gsap.to(element, {
                y: endY,
                opacity: 0,
                duration: 15,
                ease: "none",
                onComplete: () => {
                    pooledElements.push(element);
                },
            });
        };

        const animateBatch = () => {
            for (let i = 0; i < 2; i++) {
                const side = i === 0 ? "left" : "right";
                const element = createOrReuseElement();
                const symbolIndex = Math.floor(getRandom() * symbols.length);
                animateElement(element, symbolIndex, side);
            }
        };

        const startAnimation = () => {
            animateBatch();
            setTimeout(() => {
                requestAnimationFrame(startAnimation);
            }, 3000); // Match the interval
        };

        let visibilityTimeout;
        document.addEventListener("visibilitychange", () => {
            clearTimeout(visibilityTimeout);
            visibilityTimeout = setTimeout(() => {
                if (document.hidden) {
                    gsap.globalTimeline.pause();
                } else {
                    gsap.globalTimeline.resume();
                }
            }, 100);
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

    // Create lines without individual animations
    for (let i = 0; i < numberOfLines; i++) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        // Set line attributes
        line.setAttribute("x1", startingX + i * lineSpacing);
        line.setAttribute("y1", startingY);
        line.setAttribute("x2", startingX + i * lineSpacing);
        line.setAttribute("y2", endingY);
        line.setAttribute("stroke-dasharray", "20, 20");
        line.setAttribute("stroke-width", "10");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("stroke", "#fff");

        fragment.appendChild(line);
    }

    // Append all lines at once to the DOM
    lineGroup.appendChild(fragment);

    // Animate the entire group instead of individual lines
    const animation = gsap.to(lineGroup, {
        strokeDashoffset: "+=40",
        duration: 1,
        ease: "none",
        repeat: -1,
        useFrames: false // Frame-based animation is unnecessary now
    });

    // Pause and resume animation based on visibility
    const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
            animation.pause();
        } else {
            animation.resume();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
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

    // Predefine valid numbers (02-30, excluding numbers with '1')
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

    // Initial shuffle
    shuffleArray(shuffledNumbers);

    // Initialize the element with the first formatted number
    countElement.textContent = String(shuffledNumbers[currentIndex]).padStart(2, '0');
    currentIndex++;

    // Efficient GSAP animation for the random number change
    gsap.to({}, {
        duration: 1.9, // Duration of each number change
        repeat: -1, // Infinite loop
        onRepeat: () => {
            // Update the number if all have been used, reshuffle
            if (currentIndex >= shuffledNumbers.length) {
                shuffleArray(shuffledNumbers);
                currentIndex = 0;
            }

            const randomNumber = shuffledNumbers[currentIndex];
            currentIndex++;

            // Update the number with minimal DOM manipulation
            gsap.timeline()
                .to(countElement, { autoAlpha: 0, duration: 0.1 }) // Quick fade out
                .set({}, { onUpdate: () => countElement.textContent = String(randomNumber).padStart(2, '0') }) // Update content with leading zero
                .to(countElement, { autoAlpha: 1, duration: 0.1 }); // Quick fade in
        }
    });
});
