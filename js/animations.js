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
});

