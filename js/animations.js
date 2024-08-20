// Statistics counter Animation

function animatedCounter(target, time = 300, start = 0, elementId) {
    let current = start;
    const increment = (target - current) / time;
    const counterElement = document.getElementById(elementId);

    if (!counterElement) {
        // Counter element not found on the page, do nothing
        return;
    }

    function updateCounter() {
        if (current < target) {
            current += increment;
            const roundedValue = Math.round(current);
            counterElement.innerHTML = `${roundedValue}<span class="text-dark-purple font-normal animate-pulse">+</span>`;
            requestAnimationFrame(updateCounter);
        }
    }

    // Initialize the counter animation when the element is in the viewport
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            updateCounter();
            observer.unobserve(counterElement); // Stop observing once it starts
        }
    });

    // Start observing the counter element
    observer.observe(counterElement);
}

// Example usage on a page where the counter is used
animatedCounter(36, 100, 0, "counter1");
animatedCounter(36, 100, 0, "counter2");
animatedCounter(36, 100, 0, "counter3");
animatedCounter(36, 100, 0, "counter4");




document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(Flip, ScrollTrigger, Observer, ScrollToPlugin, Draggable, MotionPathPlugin, EaselPlugin, PixiPlugin, TextPlugin, RoughEase, ExpoScaleEase, SlowMo, CustomEase);
  // Your GSAP code here!
});
