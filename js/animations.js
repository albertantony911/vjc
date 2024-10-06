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
  ====================================
  LANDING ILLUSTRATION BEGINS
  ====================================
  */

// Cache Selectors
const container = document.querySelector("#animationContainer");
const cogElement = document.querySelector("#cog");
const cloudElement = document.querySelector("#cloud");
const floatElement = document.querySelector("#float");
const lineGraph = document.querySelector("#lineGraph");
const lineGraphLarge = document.querySelector("#lineGraphLarge");
const dottedLineGroup = document.querySelector("#dottedLine");
const barElements = ["#bar1", "#bar2", "#bar3", "#barDot1", "#barDot2", "#barDot3"];
const graphDotElements = ["#graphDot1", "#graphDot2"];
const symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];

// Animation Functions
function animateCog() {
  gsap.to(cogElement, {
    rotation: 360,
    duration: 4,
    ease: "none",
    repeat: -1,
    transformOrigin: "50% 50%",
  });
}

function animateCloud() {
  gsap.to(cloudElement, {
    y: -30,
    duration: 1,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
  });
}

function animateFloat() {
  gsap.to(floatElement, {
    x: () => gsap.utils.random(-0.8, 0.8) * floatElement.getBBox().width,
    y: () => gsap.utils.random(-0.8, 0.8) * floatElement.getBBox().height,
    duration: gsap.utils.random(1, 1),
    ease: "power1.inOut",
    onComplete: animateFloat,
  });
}

function animateBarsAndDots() {
  let bl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });

  bl.to(barElements, {
    scaleY: (i) => (i < 3 ? [0.6, 0.5, 0.9][i] : 1),
    y: (i) => (i >= 3 ? [73, 90, 17][i - 3] : 0),
    duration: 1.5,
    transformOrigin: "bottom",
    ease: "power1.inOut",
  })
    .to(barElements, {
      scaleY: (i) => (i < 3 ? [0.5, 1, 0.6][i] : 1),
      y: (i) => (i >= 3 ? [90, 0, 73][i - 3] : 0),
      duration: 1.5,
      transformOrigin: "bottom",
      ease: "power1.inOut",
    })
    .to(barElements, {
      scaleY: (i) => (i < 3 ? [1, 0.6, 1][i] : 1),
      y: (i) => (i >= 3 ? [0, 73, 0][i - 3] : 0),
      duration: 1.5,
      transformOrigin: "bottom",
      ease: "power1.inOut",
    });
}

function animateGraphDots() {
  let gl = gsap.timeline({ repeat: -1, yoyo: true, yoyoEase: "power1.inOut" });

  gl.to(graphDotElements, {
    y: (i) => [73, 90][i],
    duration: 1.5,
    ease: "power1.inOut",
  })
    .to(graphDotElements, {
      y: (i) => [17, 0][i],
      duration: 1.5,
      ease: "power1.inOut",
    })
    .to(graphDotElements, {
      y: (i) => [0, 73][i],
      duration: 1.5,
      ease: "power1.inOut",
    });
}

function animateLineGraph() {
  const originalYValues = [2122.11, -71.5, 13.8, -111];
  const newYValues = [2122.11 - 40, -71.5 + 70, 13.8 - 90, -111 + 100];

  const updatePath = (yValues) => {
    const newPath = `m709.116 ${yValues[0]} 67.326 ${yValues[1]} 75.161 ${yValues[2]} 47.985 ${yValues[3]}`;
    lineGraph.setAttribute("d", newPath);
  };

  gsap.to({ progress: 0 }, {
    progress: 1,
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    onUpdate: function () {
      const progress = this.progress();
      const interpolatedYValues = originalYValues.map(
        (original, index) => original + (newYValues[index] - original) * progress
      );
      updatePath(interpolatedYValues);
    },
  });
}

function animateLineGraphLarge() {
  const pathLength = lineGraphLarge.getTotalLength();

  gsap.set(lineGraphLarge, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  gsap.to(lineGraphLarge, {
    duration: 3,
    strokeDashoffset: 0,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
  });
}

function animateDottedLines() {
  const lineSpacing = 103;
  const numberOfLines = 5;
  const startingX = 586;
  const startingY = 641;
  const endingY = 800;
  const lineColor = "#fff";
  const lineThickness = 10;
  const dashPattern = "20, 20";

  for (let i = 0; i < numberOfLines; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", startingX + i * lineSpacing);
    line.setAttribute("y1", startingY);
    line.setAttribute("x2", startingX + i * lineSpacing);
    line.setAttribute("y2", endingY);
    line.setAttribute("stroke", lineColor);
    line.setAttribute("stroke-width", lineThickness);
    line.setAttribute("stroke-dasharray", dashPattern);
    line.setAttribute("stroke-linecap", "round");

    dottedLineGroup.appendChild(line);

    gsap.to(line, {
      strokeDashoffset: "+=40",
      duration: 1,
      ease: "none",
      repeat: -1,
    });
  }
}

function randomFadeAndReposition() {
  function createAndAnimateElement(side) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const currencyElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    currencyElement.textContent = symbol;
    currencyElement.setAttribute("font-size", "16");
    currencyElement.setAttribute("fill", "#7ED348");
    currencyElement.setAttribute("font-family", "Arial");
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
        container.removeChild(currencyElement);
      },
    });
  }

  setInterval(() => {
    createAndAnimateElement("left");
    createAndAnimateElement("right");
  }, 3000);
}

// Master function to group all animations together
function initiateAllAnimations() {
  animateCog();
  animateCloud();
  animateFloat();
  animateBarsAndDots();
  animateGraphDots();
  animateLineGraph();
  animateLineGraphLarge();
  animateDottedLines();
  randomFadeAndReposition();
}

// Start all animations
initiateAllAnimations();

  /* 
  ====================================
  LANDING ILLUSTRATION ENDS
  ====================================
  */

  
  
  
  
});


