document.addEventListener("DOMContentLoaded", function () {
  function activateScrollAnimations(configurations) {
    // Map to store IntersectionObservers based on thresholds
    const observerMap = new Map();

    // Function to get or create an observer for a given threshold
    const getObserver = (threshold) => {
      if (!observerMap.has(threshold)) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const config = entry.target.dataset.config;
            if (!config) return;

            const { observeOnce, childSelector, customClass } = JSON.parse(config);

            if (entry.isIntersecting) {
              if (childSelector) {
                const children = entry.target.querySelectorAll(childSelector);
                if (children.length) {
                  children.forEach(child => child.classList.add(customClass || "active"));
                }
              } else {
                entry.target.classList.add(customClass || "active");
              }

              if (observeOnce) {
                observer.unobserve(entry.target);
              }
            } else if (!observeOnce) {
              if (childSelector) {
                const children = entry.target.querySelectorAll(childSelector);
                if (children.length) {
                  children.forEach(child => child.classList.remove(customClass || "active"));
                }
              } else {
                entry.target.classList.remove(customClass || "active");
              }
            }
          });
        }, { threshold });

        observerMap.set(threshold, observer);
      }
      return observerMap.get(threshold);
    };

    // Initialize observers and observe elements
    configurations.forEach(({ className, threshold = 0.5, observeOnce = false, customClass, childSelector }) => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(element => {
        // Store configuration in the element's dataset
        element.dataset.config = JSON.stringify({ observeOnce, customClass, childSelector });

        // Observe the element with the appropriate observer
        const observer = getObserver(threshold);
        observer.observe(element);
      });
    });
  }

  // Activate animations with configurations
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
    { className: "priceBarMob", threshold: 0.8 },
    { className: "dotted-line", threshold: 0.8 },
    { className: "rightWatcher", threshold: 0.8, childSelector: ".rotateRight", customClass: "active" },
    { className: "leftWatcher", threshold: 0.8, childSelector: ".rotateLeft", customClass: "active" },
    { className: "observedBar", threshold: 0.8, childSelector: ".priceBar", customClass: "active" },
    { className: "infrastructure-trigger", threshold: 0.8, childSelector: ".scaler", customClass: "active" }
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

        // Generate precomputed random positions
        const getRandom = () => precomputedRandoms[(randomIndex++) % precomputedRandoms.length];
        const precomputePositions = () => ({
            left: Array.from({ length: symbols.length }, () => getRandom() * sideWidth),
            right: Array.from({ length: symbols.length }, () => containerWidth - sideWidth + getRandom() * sideWidth),
        });

        let positions = precomputePositions();
        const startY = -10;
        const endY = containerHeight + 50;

        // Update dimensions on resize
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

        // Create or reuse pooled SVG text elements
        const createOrReuseElement = () => {
            const element = pooledElements.pop() || document.createElementNS("http://www.w3.org/2000/svg", "text");
            if (!element.parentNode) {
                element.setAttribute("text-anchor", "middle");
                element.style.willChange = "transform, opacity";
                element.setAttribute("fill", "#01377D"); // Set consistent dark blue color
                container.appendChild(element);
            }
            return element;
        };

        // Animate an element with GSAP
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
                    pooledElements.push(element); // Reuse the element
                },
            });
        };

        // Animate a batch of elements (one for each side)
        const animateBatch = () => {
            for (let i = 0; i < 2; i++) {
                const side = i === 0 ? "left" : "right";
                const element = createOrReuseElement();
                const symbolIndex = Math.floor(getRandom() * symbols.length);
                animateElement(element, symbolIndex, side);
            }
        };

        // Start the animation loop
        const startAnimation = () => {
            animateBatch();
            setTimeout(() => {
                requestAnimationFrame(startAnimation);
            }, 3000); // Match the interval
        };

        // Handle page visibility changes to pause/resume animations
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






  /*
============================
  LANDING ANIMATION ENDS
============================
*/


const numbers = ["25", "03", "22", "28", "04", "29", "07", "24", "06", "02", "20", "27", "09", "26", "30", "23", "08", "05"];
const textElement = document.getElementById('calendarText');
let currentIndex = 0;
let intervalId = null; // Store the interval ID to control it
let isInView = false; // Track if the element is in the viewport

// Function to update text
function updateText() {
  textElement.textContent = numbers[currentIndex];
  textElement.style.opacity = '1';
  setTimeout(() => {
    textElement.style.opacity = '0';
  }, 1000); // Visible for 1 second
  currentIndex = (currentIndex + 1) % numbers.length;
}

// Start the interval
function startUpdates() {
  if (!intervalId) {
    intervalId = setInterval(updateText, 2000);
    updateText(); // Start immediately
  }
}

// Stop the interval
function stopUpdates() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Set up the Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      isInView = true;
      startUpdates();
    } else {
      isInView = false;
      stopUpdates();
    }
  });
});

// Observe the text element
observer.observe(textElement);
