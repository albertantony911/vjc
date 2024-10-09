// Statistics counter Animation

function animatedCounter(target, duration = 3000, start = 0, elementId, suffix = '+') {
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
            counterElement.innerHTML = `${Math.round(current)}<span class="text-darkBlue font-[600] animate-pulse">${suffix}</span>`;
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.innerHTML = `${target}<span class="text-darkBlue font-[600] animate-pulse">${suffix}</span>`;
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
animatedCounter(3000, 3000, 0, "counter1", '+');
animatedCounter(36, 3000, 0, "counter2", '+');
animatedCounter(40, 3000, 0, "counter3", '+'); 
animatedCounter(50, 3000, 0, "counter4", '%');




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





/*
============================
  LANDING ANIMATION BEGINS
============================
*/
// Optimized GSAP animations for better performance

// Optimized cog rotation (added 'use frames' to minimize recalculations)
gsap.to("#cog", {
    rotation: 360, // Rotate 360 degrees for one full rotation
    duration: 4, // Duration of one full rotation (you can adjust this)
    ease: "none", // Linear movement, so it rotates continuously without easing
    repeat: -1, // Repeat infinitely
    transformOrigin: "50% 50%", // Rotate around the center
    useFrames: true
});

// Optimized cloud floating animation
gsap.to("#cloud", {
    y: -50, // Move the cloud up by 30 pixels
    duration: 1, // Duration for the upward movement
    ease: "power1.inOut", // Smooth easing for gentle floating effect
    repeat: -1, // Infinite loop
    yoyo: true, // Makes the cloud come back down to its original position
    useFrames: true // Less frequent recalculation
});

// Optimized floater animation (batching cloud and floater animation to improve efficiency)
gsap.to(["#cloud", "#floater"], {
    y: (i) => i === 0 ? -50 : -10, // Different y values for each element
    duration: 1,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
    useFrames: true
});

function animateFloat() {
    gsap.to("#float", {
        x: () => gsap.utils.random(-0.8, 0.8) * document.querySelector("#float").getBBox().width, // Random x movement based on object width
        y: () => gsap.utils.random(-0.8, 0.8) * document.querySelector("#float").getBBox().height, // Random y movement based on object height
        duration: gsap.utils.random(1, 1), // Random duration for smoother, varied movement
        ease: "power1.inOut", // Smooth easing for gentle floating effect
        onComplete: animateFloat, // Recursively call to create a new random animation on completion
    });
}

animateFloat();

  

// Optimized GSAP timeline for bars and dots (batch operations)
let bl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });
bl.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [0.6, 0.5, 0.9][i] : 1, // Only scale bars, keep circles unaffected
    y: (i) => i >= 3 ? [73, 90, 17][i - 3] : 0, // Only move circles, keep bars unaffected
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
})
.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [0.5, 1, 0.6][i] : 1,
    y: (i) => i >= 3 ? [90, 0, 73][i - 3] : 0,
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
})
.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [1, 0.6, 1][i] : 1,
    y: (i) => i >= 3 ? [0, 73, 0][i - 3] : 0,
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
});

// Optimized graph dot animation (reuse instead of repeating timelines)
let gl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });
gl.to(["#graphDot1", "#graphDot2"], {
    y: (i) => [73, 90][i],
    duration: 1.5,
    ease: "power1.inOut"
})
.to(["#graphDot1", "#graphDot2"], {
    y: (i) => [17, 0][i],
    duration: 1.5,
    ease: "power1.inOut"
})
.to(["#graphDot1", "#graphDot2"], {
    y: (i) => [0, 73][i],
    duration: 1.5,
    ease: "power1.inOut"
});

// Optimized path animation with less recalculations (simplified vertex changes)
const originalYValues = [2122.11, -71.5, 13.8, -111];
const newYValues = [2122.11 - 40, -71.5 + 70, 13.8 - 90, -111 + 100];

gsap.to({ progress: 0 }, {
    progress: 1,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    onUpdate: function () {
        const progress = this.progress();
        const interpolatedYValues = originalYValues.map((original, index) => original + (newYValues[index] - original) * progress);
        const newPath = `m709.116 ${interpolatedYValues[0]} 67.326 ${interpolatedYValues[1]} 75.161 ${interpolatedYValues[2]} 47.985 ${interpolatedYValues[3]}`;
        document.getElementById("lineGraph").setAttribute("d", newPath);
    }
});

// Optimized stroke path animation
const path = document.querySelector("#lineGraphLarge");
const pathLength = path.getTotalLength();

// Set initial values to create an invisible line
gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength
});

// Animate the path with lower recalculation frequency
gsap.to(path, {
    duration: 3,
    strokeDashoffset: 0,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
    useFrames: true
});

// Optimized random currency symbol animation (reuse elements to avoid DOM thrashing)
function randomFadeAndReposition() {
    const container = document.querySelector("#currencyContainer");
    let symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];

    function createAndAnimateElement(side) {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        const symbol = symbols.splice(randomIndex, 1)[0];
        if (symbols.length === 0) symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];

        const currencyElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        currencyElement.textContent = symbol;
        currencyElement.setAttribute("fill", "#89DB55");
        currencyElement.setAttribute("font-family", "Arial");
        currencyElement.setAttribute("stroke", "white");
        currencyElement.setAttribute("stroke-width", "0");
        container.appendChild(currencyElement);

        const sideWidth = container.clientWidth * 0.2;
        const startX = side === "left" ? Math.random() * sideWidth : container.clientWidth - sideWidth + Math.random() * sideWidth;
        const startY = -10;
        const endY = container.clientHeight + 50;

        gsap.set(currencyElement, { x: startX, y: startY, opacity: 1 });

        gsap.to(currencyElement, {
            y: endY,
            opacity: 0,
            duration: 20,
            ease: "none",
            onComplete: () => {
                currencyElement.remove();
            },
        });
    }

    let animationInterval;
    function startAnimation() {
        if (!animationInterval) {
            // Immediately create the first set of symbols without delay
            createAndAnimateElement("left");
            createAndAnimateElement("right");
            
            animationInterval = setInterval(() => {
                createAndAnimateElement("left");
                createAndAnimateElement("right");
            }, 3000);
        }
    }

    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
    }

    // Remove elements on stop to prevent accumulation
    function removeAllSymbols() {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
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
  


// Optimized line creation and animation
const lineGroup = document.querySelector("#dottedLine");
const lineSpacing = 103;
const numberOfLines = 5;
const startingX = 586;
const startingY = 641;
const endingY = 800;

for (let i = 0; i < numberOfLines; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startingX + i * lineSpacing);
    line.setAttribute("y1", startingY);
    line.setAttribute("x2", startingX + i * lineSpacing);
    line.setAttribute("y2", endingY);
    line.setAttribute("stroke", "#fff");
    line.setAttribute("stroke-width", 10);
    line.setAttribute("stroke-dasharray", "20, 20");
    line.setAttribute("stroke-linecap", "round");

    lineGroup.appendChild(line);

    gsap.to(line, {
        strokeDashoffset: "+=40",
        duration: 1,
        ease: "none",
        repeat: -1,
        useFrames: true // Lower recalculation frequency
    });
}
  
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

// Immediately display the first random number
const initialIndex = Math.floor(Math.random() * validNumbers.length);
countElement.textContent = String(validNumbers[initialIndex]).padStart(2, '0');

// GSAP animation to count numbers randomly between 0-30, excluding numbers with '1'
gsap.to({}, {
    duration: 1.5, // Duration in seconds for each number change
    repeat: -1, // Infinite loop
    ease: "power2.inOut", // Smooth ease for fading effect
    onRepeat: function () {
        // Generate a random index from the valid numbers array
        const randomIndex = Math.floor(Math.random() * validNumbers.length);
        const randomNumber = validNumbers[randomIndex];
        
        // Fade out the current number, change it, then fade in the new number
        gsap.to(countElement, {
            opacity: 0,
            duration: 0.2,
            onComplete: function() {
                countElement.textContent = String(randomNumber).padStart(2, '0');
                gsap.to(countElement, { opacity: 1, duration: 0.2 });
            }
        });
    }
});


  
  // GSAP animation to randomly change the color of one of the dots every second
  const circles = document.querySelectorAll('circle.calendarDots');
  
  function changeRandomCircleColor() {
    /// Reset all circles to white
    circles.forEach(circle => {
      circle.style.fill = '#fff';
      circle.style.stroke = 'none';
    });
    
    // Select a random circle
    const randomIndex = Math.floor(Math.random() * circles.length);
    const randomCircle = circles[randomIndex];
    
    // Change the color of the selected circle
    randomCircle.style.fill = '#7ED348'; // Change to red for visibility
    randomCircle.style.stroke = '#fff';
    randomCircle.style.strokeWidth = '1px'; // Change to red for visibility
  }

  // GSAP timeline to repeat the color change every second
  gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
    .call(changeRandomCircleColor);

  
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

  // Update each element's position
  elementData.forEach(({ element, initialX, initialY, initialAngle }) => {
    const angle = initialAngle + currentAngleOffset;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Use direct translation to move the element to the calculated position
    element.setAttribute("transform", `translate(${x - initialX}, ${y - initialY})`);
  });

  // Request the next frame
  requestAnimationFrame(animate);
}

// Start the animation
requestAnimationFrame(animate);

  
  
// Set initial visibility for the groups
gsap.set("#group1", { opacity: 1, visibility: 'visible' }); // Ensure group1 starts visible
gsap.set("#group2", { opacity: 0, visibility: 'hidden' }); // Ensure group2 starts hidden

// Animation for group1 to fade out, and group2 to fade in simultaneously
const timeline = gsap.timeline({ repeat: -1 });

timeline.to("#group1", {
  opacity: 0, // fade out group1 to opacity 0
  duration: 1, // fade out duration
  delay: 1, // start fading out after 1 second
  onComplete: function() {
    gsap.set("#group1", { visibility: 'hidden' }); // hide group1 immediately after fading out
    gsap.set("#group2", { visibility: 'visible', opacity: 0 }); // make group2 visible and set opacity to 0 before fading in
    gsap.to("#group2", {
      opacity: 1, // fade in group2 to full opacity
      duration: 1, // fade in duration
      ease: "power1.inOut" // add easing for a smoother fade in
    });
  }
}).to("#group2", {
  opacity: 0, // fade out group2 to opacity 0
  duration: 1, // fade out duration
  delay: 2, // wait for 2 seconds before starting fade out
  onComplete: function() {
    gsap.set("#group2", { visibility: 'hidden' }); // hide group2 immediately after fading out
    gsap.set("#group1", { visibility: 'visible', opacity: 0 }); // make group1 visible and set opacity to 0 before fading in
    gsap.to("#group1", {
      opacity: 1, // fade in group1 to full opacity
      duration: 1, // fade in duration
      ease: "power2.inOut" // add a stronger easing for a smoother fade in
    });
  }
});
  
  
});


