


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

 

function gsapCounter(target, duration = 3, start = 0, elementId, suffix = '+') {
    const counterElement = document.getElementById(elementId);

    if (!counterElement) return;

    // GSAP animation setup
    gsap.fromTo(counterElement, {
        textContent: start // Start from initial value
    }, {
        textContent: target, // End at the target value
        duration: duration, // Duration for the animation
        scrollTrigger: {
            trigger: counterElement, // Trigger when the counter is in the viewport
            start: "top 80%", // Adjust this based on your scroll point
            toggleActions: "play none none none" // Play the animation only once
        },
        snap: { textContent: 1 }, // Snap to integers
        onUpdate: function () {
            // Update the text content with rounded values and suffix
            counterElement.textContent = `${Math.round(counterElement.textContent)}${suffix}`;
        },
        ease: "power1.inOut" // Smooth ease for the counter
    });
}

// Example usage
gsapCounter(3000, 3, 0, "counter1", '+');
gsapCounter(36, 3, 0, "counter2", '+');
gsapCounter(40, 3, 0, "counter3", '+');
gsapCounter(50, 3, 0, "counter4", '%');
gsap.utils.toArray('.periodBox').forEach((box) => {
  gsap.fromTo(box, 
    { 
      opacity: 0.1,
      color: "#999",
    },
    { 
      opacity: 1,
      color: "#000",
      duration: 2,
      scrollTrigger: {
        trigger: box,
        start: "top 80%",
        end: "top 30%",
        toggleActions: "play none none none",
        once: true // Trigger the animation once when the box enters the viewport
      }
    }
  );
});


 gsap.utils.toArray('.line-v').forEach((line) => {
  gsap.from(line, 
    {
      scaleY: 0,                  // Start with scaleY at 0 (no height)
      transformOrigin: "top",     // Scale from the top
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

    




/*
============================
  LANDING ANIMATION BEGINS
============================
*/
// Optimized GSAP animations for better performance

// Add will-change in JS (if not using CSS directly)
gsap.set("#cog", {
  willChange: "transform"
});

gsap.to("#cog", {
  rotation: 360, // Rotate 360 degrees for one full rotation
  duration: 4, // Duration of one full rotation (adjust as needed)
  ease: "none", // Linear movement, no easing
  repeat: -1, // Repeat infinitely
  transformOrigin: "50% 50%" // Rotate around the center
});





function animateFloat() {
    // Cache float element and its dimensions
    const floatElement = document.querySelector("#float");
    const width = floatElement.getBBox().width;
    const height = floatElement.getBBox().height;

    // Precompute 6 random positions (X and Y)
    const positions = Array.from({ length: 6 }, () => ({
        x: gsap.utils.random(-0.8, 0.8) * width,
        y: gsap.utils.random(-0.8, 0.8) * height
    }));

    // Function to animate a given element using precomputed positions
    function animatePrecomputedFloat(element, startIndex = 0) {
        let index = startIndex;

        function moveElement() {
            gsap.to(element, {
                x: positions[index].x,
                y: positions[index].y,
                duration: 1, // Fixed duration
                ease: "power1.inOut",
                onComplete: () => {
                    index = (index + 1) % positions.length; // Cycle through positions
                    moveElement(); // Recursively call to continue animation
                }
            });
        }

        moveElement(); // Start the animation
    }

    // Cache the float elements array once
    const floatElements = gsap.utils.toArray("#float");

    // Apply the animation to each float element
    floatElements.forEach((element, idx) => {
        animatePrecomputedFloat(element, idx % positions.length); // Different starting position for each
    });
}

animateFloat();


// Single timeline for bars and dots using batch operation and keyframes
let bl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });

// Cache transform origin outside to avoid recalculating
gsap.set(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3", "#graphDot1", "#graphDot2"], {
    transformOrigin: "bottom"
});

// Use keyframes to define all animations in a single batch
bl.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3", "#graphDot1", "#graphDot2"], {
    keyframes: [
        {
            scaleY: (i) => i < 3 ? [0.6, 0.5, 0.9][i] : 1, // Only scale bars
            y: (i) => i >= 3 ? [73, 90, 17, 73, 90][i - 3] : 0, // Move dots and graph dots
            duration: 1.5,
            ease: "power1.inOut"
        },
        {
            scaleY: (i) => i < 3 ? [0.5, 1, 0.6][i] : 1,
            y: (i) => i >= 3 ? [90, 0, 73, 17, 0][i - 3] : 0,
            duration: 1.5,
            ease: "power1.inOut"
        },
        {
            scaleY: (i) => i < 3 ? [1, 0.6, 1][i] : 1,
            y: (i) => i >= 3 ? [0, 73, 0, 0, 73][i - 3] : 0,
            duration: 1.5,
            ease: "power1.inOut"
        }
    ]
});

const originalYValues = [2122.11, -71.5, 13.8, -111];
const newYValues = [2122.11 - 40, -71.5 + 70, 13.8 - 90, -111 + 100];
const deltaYValues = newYValues.map((newVal, index) => newVal - originalYValues[index]);

// Cache the line graph element to avoid repeated DOM lookups
const lineGraph = document.getElementById("lineGraph");

gsap.to({ progress: 0 }, {
    progress: 1,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    onUpdate: function () {
        const progress = this.progress();
        const interpolatedYValues = originalYValues.map((original, index) => original + deltaYValues[index] * progress);
        
        const newPath = `m709.116 ${interpolatedYValues[0]} 67.326 ${interpolatedYValues[1]} 75.161 ${interpolatedYValues[2]} 47.985 ${interpolatedYValues[3]}`;
        
        // Update the path attribute only once after all calculations
        lineGraph.setAttribute("d", newPath);
    }
});
  
  
const path = document.querySelector("#lineGraphLarge");
const pathLength = path.getTotalLength();

// Set initial strokeDash properties to hide the path
gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength
});

// Animate the stroke path
gsap.to(path, {
    duration: 3,           // Animation duration
    strokeDashoffset: 0,    // Reveal the stroke
    ease: "power1.inOut",   // Smooth easing
    repeat: -1,             // Infinite loop
    yoyo: true,
    useFrames: false
    
});

  
  
function randomFadeAndReposition() {
    const container = document.querySelector("#currencyContainer");
    let symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];
    let pooledElements = []; // Pool of reused SVG text elements

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function createOrReuseElement() {
        // Reuse existing element if available, else create a new one
        let currencyElement = pooledElements.length ? pooledElements.pop() : document.createElementNS("http://www.w3.org/2000/svg", "text");
        
        // Set static attributes if this is a new element
        if (!currencyElement.hasAttribute("data-initialized")) {
            currencyElement.setAttribute("fill", "#89DB55");
            currencyElement.setAttribute("font-family", "Arial");
            currencyElement.setAttribute("stroke", "white");
            currencyElement.setAttribute("stroke-width", "0");
            currencyElement.setAttribute("data-initialized", "true"); // Mark as initialized
            container.appendChild(currencyElement); // Add it to DOM only once
        }

        return currencyElement;
    }

    function animateElement(element, side) {
        element.textContent = getRandomSymbol();

        const sideWidth = container.clientWidth * 0.2;
        const startX = side === "left" ? Math.random() * sideWidth : container.clientWidth - sideWidth + Math.random() * sideWidth;
        const startY = -10;
        const endY = container.clientHeight + 50;

        gsap.set(element, { x: startX, y: startY, opacity: 1 });

        gsap.to(element, {
            y: endY,
            opacity: 0,
            duration: 20,
            ease: "none",
            onComplete: () => {
                pooledElements.push(element); // Return the element to the pool
            },
        });
    }

    let animationInterval;
    function startAnimation() {
        if (!animationInterval) {
            // Start immediately with two elements
            animateElement(createOrReuseElement(), "left");
            animateElement(createOrReuseElement(), "right");

            animationInterval = setInterval(() => {
                animateElement(createOrReuseElement(), "left");
                animateElement(createOrReuseElement(), "right");
            }, 3000);
        }
    }

    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    // Remove elements on stop to prevent accumulation (empty pool)
    function removeAllSymbols() {
        gsap.killTweensOf(container.querySelectorAll("text")); // Stop any active animations
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        pooledElements = []; // Clear the element pool
    }

    // Throttling visibility change event handling
    let visibilityThrottleTimeout;
    document.addEventListener('visibilitychange', () => {
        if (visibilityThrottleTimeout) clearTimeout(visibilityThrottleTimeout);
        visibilityThrottleTimeout = setTimeout(() => {
            if (document.hidden) {
                stopAnimation();
                removeAllSymbols();
            } else {
                startAnimation();
            }
        }, 100);
    });

    startAnimation();
}
  randomFadeAndReposition();
  


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

  /*
============================
  LANDING ANIMATION ENDS
============================
*/

const countElement = document.querySelector('.calendarText');

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


  


// Elements to animate
const elements = document.querySelectorAll(".circleRotation");

// Common center for circular path
const centerX = 1026.16;
const centerY = 1058.29;
const radius = 750.95; // Radius for circular path

// Precompute initial angles for each element
const elementData = Array.from(elements).map(element => {
  const bbox = element.getBBox();
  const initialX = bbox.x + bbox.width / 2;
  const initialY = bbox.y + bbox.height / 2;

  // Calculate the initial angle of the element relative to the common center
  const deltaX = initialX - centerX;
  const deltaY = initialY - centerY;
  const initialAngle = Math.atan2(deltaY, deltaX);

  return {
    element,
    initialX,
    initialY,
    initialAngle
  };
});

// Animation parameters
const duration = 20000; // 20 seconds for one complete circle
let startTime = null;

// Animation loop
function animate(time) {
  if (!startTime) startTime = time;
  const elapsed = time - startTime;

  // Calculate the progress of the animation (0 to 1)
  const progress = (elapsed % duration) / duration;
  const currentAngleOffset = progress * Math.PI * 2;

  // Update each element's position using CSS transform (hardware accelerated)
  elementData.forEach(({ element, initialX, initialY, initialAngle }) => {
    const angle = initialAngle + currentAngleOffset;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Use CSS transform to translate the element (hardware-accelerated)
    element.style.transform = `translate(${x - initialX}px, ${y - initialY}px)`;
  });

  // Request the next frame
  requestAnimationFrame(animate);
}

// Start the animation
requestAnimationFrame(animate);

  
  
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


  
  

  window.onload = function() {
        gsap.to(".bouncerRight", {
            x: 30,                        // Move to the right by 50px
            duration: 1,                   // Duration of the animation
            ease: "elastic.out(0.9, 0.5)",   // Elastic bounce effect
            yoyo: true,                    // Returns back to its original position
            repeat: -1                      // Repeats once
        });
    };

  window.addEventListener('load', function() {
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

window.addEventListener('load', function() {
    gsap.to(".rotateLeft", {
        rotate: -5,
        x:10,
        duration: 1,                    // Duration of the rotation animation
        ease: "elastic.out(0.9, 0.5)",  // Elastic bounce effect for rotation
        transformOrigin: "50% 100%",    // Set the rotation origin to the bottom center point
        yoyo: true,                     // Returns back to its original position
        repeat: -1,                     // Infinite repetition
        repeatDelay: 1                  // Delay of 1 second between each repeat
    });
});

  


  function iconFloat() {
  gsap.to("#iconFloat", {
    y: -5, // Move up by 1 pixel
    duration: 1, // Duration of movement
    repeat: -1, // Infinite loop
    yoyo: true // Return to original position
  });
}

// Activate the animation when the document is ready
  document.addEventListener("DOMContentLoaded", iconFloat);
  

  
  












// The binary sequence controlling opacity
        const sequence = '01111101101110101';
        const element = document.getElementById('popper');

        // Function to handle flashing based on sequence using GSAP
        function playFlashingSequence() {
            let index = 0;

            function updateOpacity() {
                // Set opacity based on the current value in the sequence using GSAP
                gsap.to(element, { duration: 0.1, opacity: sequence[index] === '1' ? 1 : 0 });
                
                // Move to the next value in the sequence
                index = (index + 1) % sequence.length;

                // Set timeout for next update
                setTimeout(updateOpacity, 100); // 100ms per step
            }

            // Start the flashing
            updateOpacity();
        }

        // Start the animation
        playFlashingSequence();



});

