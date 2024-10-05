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
  
  
  





gsap.to("#cog", {
    rotation: 360, // Rotate 360 degrees for one full rotation
    duration: 4, // Duration of one full rotation (you can adjust this)
    ease: "none", // Linear movement, so it rotates continuously without easing
    repeat: -1, // Repeat infinitely
    transformOrigin: "50% 50%" // Rotate around the center
});
  
  
gsap.to("#cloud", {
    y: -30, // Move the cloud up by 30 pixels
    duration: 1, // Duration for the upward movement
    ease: "power1.inOut", // Smooth easing for gentle floating effect
    repeat: -1, // Infinite loop
    yoyo: true, // Makes the cloud come back down to its original position
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


// Define a GSAP timeline for animation
let bl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });

// Animate all bars by scaling down their height using percentages
bl.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [0.6, 0.5, 0.9][i] : 1, // Only scale bars, keep circles unaffected
    y: (i) => i >= 3 ? [73, 90, 17][i - 3] : 0, // Only move circles, keep bars unaffected
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
})
.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [0.5, 1, 0.6][i] : 1, // Only scale bars, keep circles unaffected
    y: (i) => i >= 3 ? [90, 0, 73][i - 3] : 0, // Only move circles, keep bars unaffected
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
})
.to(["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"], {
    scaleY: (i) => i < 3 ? [1, 0.6, 1][i] : 1, // Only scale bars, keep circles unaffected
    y: (i) => i >= 3 ? [0, 73, 0][i - 3] : 0, // Only move circles, keep bars unaffected
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut"
});

  
  
  
  
let gl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });

// Animate all bars by scaling down their height using percentages
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
  
  

  // Original path d attribute


 // Create a GSAP animation for slight vertex changes
  const originalYValues = [2122.11, -71.5, 13.8, -111];
  const newYValues = [2122.11 - 40, -71.5 + 70, 13.8 - 90, -111 + 100];

  const updatePath = (yValues) => {
    const newPath = `m709.116 ${yValues[0]} 67.326 ${yValues[1]} 75.161 ${yValues[2]} 47.985 ${yValues[3]}`;
    document.getElementById("lineGraph").setAttribute("d", newPath);
  };

  // Animate the path vertices using GSAP
  gsap.to({ progress: 0 }, {
    progress: 1,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const interpolatedYValues = originalYValues.map((original, index) => original + (newYValues[index] - original) * progress);
      updatePath(interpolatedYValues);
    }
  });




 
gsap.to('#transmission-waves', {
    duration: 3,
    y: -1,
    opacity: 0,
    ease: "power2.out",
    repeat: -1
});

  
  
  
  const path = document.querySelector("#lineGraphLarge");

// Get the length of the path
const pathLength = path.getTotalLength();

// Set initial values to create an invisible line
gsap.set(path, {
  strokeDasharray: pathLength,
  strokeDashoffset: pathLength
});

// Animate the path
gsap.to(path, {
  duration: 3,
  strokeDashoffset: 0,
  ease: "power1.inOut",
  repeat: -1,
  yoyo: true
});
  
  


  
  function randomFadeAndReposition() {
  const container = document.querySelector("#animationContainer"); // Select the SVG container

  // Currency symbols to be animated
  const symbols = ["$", "€", "£", "¥", "₹", "$", "€", "₹", "¥", "£"];

  symbols.forEach((symbol, index) => {
    // Create and configure the currency element
    const currencyElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    currencyElement.classList.add("fadeintext");
    currencyElement.textContent = symbol;
    currencyElement.setAttribute("font-size", "12");
    currencyElement.setAttribute("fill", "#7ED348");
    currencyElement.setAttribute("font-family", "Arial");

    // Append to container
    container.appendChild(currencyElement);

    // Initially set opacity to 0 to avoid appearing in top left
    gsap.set(currencyElement, { opacity: 0 });

    function animateElement() {
      const totalWidth = container.clientWidth;

      // Limit the falling elements to the sides (25% left and right of the container)
      const sideWidth = totalWidth * 0.2; // Define 25% width for both left and right sides
      const randomSide = gsap.utils.random(0, 1); // Randomly choose between left side or right side

      let startX;
      if (randomSide < 0.5) {
        // Left side range: 0 to sideWidth
        startX = gsap.utils.random(0, sideWidth);
      } else {
        // Right side range: totalWidth - sideWidth to totalWidth
        startX = gsap.utils.random(totalWidth - sideWidth, totalWidth);
      }

      // Determine start and end Y positions
      const startY = gsap.utils.random(-200, -50); // Start above the visible area
      const endY = container.clientHeight + 30; // End below the visible area

      // Fixed duration for the falling effect
      const duration =18; // Set a consistent duration for all elements

      // Set initial position and animate element falling
      gsap.set(currencyElement, { x: startX, y: startY, opacity: 1 });
      gsap.to(currencyElement, {
        y: endY,
        duration: duration,
        ease: "power1.out",
        opacity: 0,
        onComplete: animateElement,
      });
    }

    // Start the animation with staggered delay
    gsap.delayedCall(index * gsap.utils.random(0.5, 1.5), animateElement);
  });
  }
  



// Initialize and start the rain effect
randomFadeAndReposition();

// Set up for creating and animating lines
const lineGroup = document.querySelector("#dottedLine");
const lineSpacing = 103;  // Spacing between lines
const numberOfLines = 5;  // Number of lines to create
const startingX = 586;    // Starting x-coordinate for the first line
const startingY = 641;    // Starting y-coordinate
const endingY = 800;      // Ending y-coordinate (line length)
const lineColor = "#01377D";
const lineThickness = 7;
const dashPattern = "20, 20";  // Dash length and spacing

// Create and animate lines
for (let i = 0; i < numberOfLines; i++) {
    // Create a line element using the SVG namespace
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Set line attributes
    line.setAttribute("x1", startingX + i * lineSpacing); // x-position for each line
    line.setAttribute("y1", startingY);                   // Starting y-coordinate
    line.setAttribute("x2", startingX + i * lineSpacing); // Same x-position to make it vertical
    line.setAttribute("y2", endingY);                     // Ending y-coordinate
    line.setAttribute("stroke", lineColor);               // Line color
    line.setAttribute("stroke-width", lineThickness);     // Line thickness
    line.setAttribute("stroke-dasharray", dashPattern);   // Dashed effect
    line.setAttribute("stroke-linecap", "round");         // Rounded line ends

    // Append line to the <g> group in the SVG
    lineGroup.appendChild(line);

    // Animate the line using GSAP for continuous dashed movement
    gsap.to(line, {
        strokeDashoffset: "+=40",
        duration: 1,
        ease: "none",
        repeat: -1
    });
}

  

  
});


