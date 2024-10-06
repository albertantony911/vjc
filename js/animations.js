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





/*
============================
  LANDING ANIMATION BEGINS
============================
*/


gsap.to("#cog", {
    rotation: 360, // Rotate 360 degrees for one full rotation
    duration: 4, // Duration of one full rotation (you can adjust this)
    ease: "none", // Linear movement, so it rotates continuously without easing
    repeat: -1, // Repeat infinitely
    transformOrigin: "50% 50%" // Rotate around the center
});
  
  
gsap.to("#cloud", {
    y: -50, // Move the cloud up by 30 pixels
    duration: 1, // Duration for the upward movement
    ease: "power1.inOut", // Smooth easing for gentle floating effect
    repeat: -1, // Infinite loop
    yoyo: true, // Makes the cloud come back down to its original position
});
  
gsap.to("#floater", {
    y: -10, // Move the cloud up by 30 pixels
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
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const interpolatedYValues = originalYValues.map((original, index) => original + (newYValues[index] - original) * progress);
      updatePath(interpolatedYValues);
    }
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
  const container = document.querySelector("#currencyContainer");
  let symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];

  function createAndAnimateElement(side) {
    // Select a random currency symbol
    const randomIndex = Math.floor(Math.random() * symbols.length);
    const symbol = symbols[randomIndex];
    symbols.splice(randomIndex, 1);
    if (symbols.length === 0) {
      symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];
    }

    // Create an SVG text element for the currency symbol
    const currencyElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    currencyElement.textContent = symbol;
    currencyElement.setAttribute("fill", "#C0F079");
    currencyElement.setAttribute("font-family", "Arial");
    container.appendChild(currencyElement);

    // Determine the start and end positions for the animation
    const sideWidth = container.clientWidth * 0.2; // 20% of the container width
    const startX = side === "left"
      ? Math.random() * sideWidth // Random position within the left 20%
      : container.clientWidth - sideWidth + Math.random() * sideWidth; // Random position within the right 20%
    const startY = -10; // Start slightly above the container
    const endY = container.clientHeight + 50; // End slightly below the container

    // Set the initial position of the symbol
    gsap.set(currencyElement, { x: startX, y: startY, opacity: 1 });

    // Animate the symbol with a fade-out effect
    gsap.to(currencyElement, {
      y: endY,
      opacity: 0, // Fade out while moving down
      duration: 20, // Increased duration to slow down the drop
      ease: "none",
      onComplete: () => {
        container.removeChild(currencyElement);
      },
    });
  }

  // Set interval to create new elements at a slower rate (e.g., every 1.5 seconds per side)
  // Immediately create the first set of symbols without delay
createAndAnimateElement("left");
createAndAnimateElement("right");

// Set interval to create new elements at a slower rate (e.g., every 1.5 seconds per side)
setInterval(() => {
  createAndAnimateElement("left");
  createAndAnimateElement("right");
}, 3000); // Increased to 3000 ms (1.5 seconds per side) to match the slower drop duration
}

// Call the function to initiate the animation
randomFadeAndReposition();





  


  
// Set up for creating and animating lines
const lineGroup = document.querySelector("#dottedLine");
const lineSpacing = 103;  // Spacing between lines
const numberOfLines = 5;  // Number of lines to create
const startingX = 586;    // Starting x-coordinate for the first line
const startingY = 641;    // Starting y-coordinate
const endingY = 800;      // Ending y-coordinate (line length)
const lineColor = "#fff";
const lineThickness = 10;
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

  
  /*
============================
  LANDING ANIMATION ENDS
============================
*/

  

  
});


