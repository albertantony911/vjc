document.addEventListener("DOMContentLoaded", function () {
  // Utility: Throttle function for event listeners
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

  // Cache DOM elements
  const elementCache = new Map();
  const cacheElements = (selector) => {
    if (!elementCache.has(selector)) {
      elementCache.set(selector, Array.from(document.querySelectorAll(selector)));
    }
    return elementCache.get(selector);
  };

  /*** Scroll Animation Control ***/
  function activateScrollAnimations(configurations) {
    const configMap = new WeakMap();
    const observerMap = new Map();

    const getObserver = (threshold) => {
      if (!observerMap.has(threshold)) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const config = configMap.get(entry.target);
            if (!config) return;
            const { observeOnce, childSelector, customClass } = config;
            const activeClass = customClass || "active";
            if (entry.isIntersecting) {
              if (childSelector) {
                entry.target.querySelectorAll(childSelector).forEach(child => child.classList.add(activeClass));
              } else {
                entry.target.classList.add(activeClass);
              }
              if (observeOnce) observer.unobserve(entry.target);
            } else if (!observeOnce) {
              if (childSelector) {
                entry.target.querySelectorAll(childSelector).forEach(child => child.classList.remove(activeClass));
              } else {
                entry.target.classList.remove(activeClass);
              }
            }
          });
        }, { threshold });
        observerMap.set(threshold, observer);
      }
      return observerMap.get(threshold);
    };

    configurations.forEach(({ className, threshold = 0.2, observeOnce = false, customClass, childSelector }) => {
      cacheElements(`.${className}`).forEach(element => {
        configMap.set(element, { observeOnce, customClass, childSelector });
        getObserver(threshold).observe(element);
      });
    });
  }

  activateScrollAnimations([
    { className: "floater" },
    { className: "pulser" },
    { className: "periodBox", customClass: "visible" },
    { className: "line-v", customClass: "visible" },
    { className: "line-center", customClass: "visible" },
    { className: "priceBarMob" },
    { className: "bounce-left" },
    { className: "rightWatcher", childSelector: ".rotateRight", customClass: "active" },
    { className: "leftWatcher", childSelector: ".rotateLeft", customClass: "active" },
    { className: "observedBar", childSelector: ".priceBar", customClass: "active" },
    { className: "dottedLineObserver", childSelector: ".dotted-line", customClass: "active" },
    { className: "dotObserver", childSelector: ".float", customClass: "active" },
    { className: "circleFadeObserver", childSelector: ".circleFade", customClass: "active" },
    { className: "typingFadeObserver", childSelector: ".typeFade", customClass: "active" },
    { className: "calendarDotsObserver", childSelector: ".calendarDots", customClass: "active" },
    { className: "floatObserver", childSelector: ".float", customClass: "active" },
    { className: "floatDotObserver", childSelector: ".floatDot", customClass: "active" },
    { className: "blog1Observer", childSelector: ".blog1", customClass: "active" },
    { className: "blog2Observer", childSelector: ".blog2", customClass: "active" },
    { className: "flasherObserver", childSelector: ".flasher", customClass: "active" },
    { className: "lineGraphLargeObserver", childSelector: ".lineGraphLarge", customClass: "active" },
    { className: "lineGraphObserver", childSelector: ".lineGraph", customClass: "active" },
    { className: "infrastructure-trigger", childSelector: ".scaler", customClass: "active" }
  ]);

  /*** Logo Carousel Animation Control ***/
  const marquees = cacheElements('.marquee');
  marquees.forEach(marquee => {
    const items = marquee.querySelectorAll('.marquee__item');
    marquee.addEventListener('mouseenter', () => {
      items.forEach(item => (item.style.animationPlayState = 'paused'));
    });
    marquee.addEventListener('mouseleave', () => {
      items.forEach(item => (item.style.animationPlayState = 'running'));
    });
  });

  const marqueeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const items = entry.target.querySelectorAll('.marquee__item');
      const desiredState = entry.isIntersecting ? 'running' : 'paused';
      items.forEach(item => {
        if (item.style.animationPlayState !== desiredState) {
          item.style.animationPlayState = desiredState;
        }
      });
    });
  }, { threshold: 0.1 });
  marquees.forEach(marquee => marqueeObserver.observe(marquee));

  /*** Rotating Groups Animation Control ***/
  const groups = [
    {
      trigger: ".rotating-group-landing",
      targets: [".rotating-icon-1", ".rotating-icon-2", ".rotating-icon-3", ".rotating-icon-4", ".rotating-icon-5", ".rotating-group-landing"]
    },
    {
      trigger: ".rotating-group-cloud",
      targets: [".rotating-icon-cloud-1", ".rotating-icon-cloud-2", ".rotating-icon-cloud-3", ".rotating-icon-cloud-4", ".rotating-icon-cloud-5", ".rotating-icon-cloud-6", ".rotating-icon-cloud-7", ".rotating-group-cloud"]
    },
    {
      trigger: ".rotating-group-vcfo",
      targets: [".rotating-icon-vcfo-1", ".rotating-icon-vcfo-2", ".rotating-icon-vcfo-3", ".rotating-icon-vcfo-4", ".rotating-icon-vcfo-5", ".rotating-group-vcfo"]
    },
    {
      trigger: ".rotating-group-audit",
      targets: [".rotating-icon-audit-1", ".rotating-icon-audit-2", ".rotating-icon-audit-3", ".rotating-icon-audit-4", ".rotating-icon-audit-5", ".rotating-icon-audit-6", ".rotating-group-audit"]
    },
    {
      trigger: ".rotating-group-legal",
      targets: [".rotating-icon-legal-1", ".rotating-icon-legal-2", ".rotating-icon-legal-3", ".rotating-icon-legal-4", ".rotating-icon-legal-5", ".rotating-icon-legal-6", ".rotating-icon-legal-7", ".rotating-icon-legal-8", ".rotating-icon-legal-9", ".rotating-icon-legal-10", ".rotating-icon-legal-11", ".rotating-group-legal"]
    }
  ];

  function checkScrollTriggers() {
    const threshold = window.innerHeight * 0.8;
    groups.forEach(({ trigger, targets }) => {
      const triggerElement = document.querySelector(trigger);
      if (!triggerElement) return;

      const rect = triggerElement.getBoundingClientRect();
      const isActive = rect.top <= threshold && rect.bottom > 0;
      const targetElements = cacheElements(targets.join(", "));
      if (isActive) {
        targetElements.forEach(el => el.classList.add("active"));
      } else {
        targetElements.forEach(el => el.classList.remove("active"));
      }
    });
  }

  const throttledScrollTriggers = throttle(checkScrollTriggers, 100);
  window.addEventListener("scroll", throttledScrollTriggers);
  window.addEventListener("resize", throttledScrollTriggers);
  window.addEventListener("load", checkScrollTriggers);

  /*** Counter Animation Control ***/
  const counterObserver = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counterElement = entry.target;
        const { target, duration, start, suffix } = counterElement.dataset;
        animateCounter(counterElement, Number(start), Number(target), Number(duration), suffix || '+');
        observerInstance.unobserve(counterElement);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(element, startValue, targetValue, duration, suffix) {
    const totalFrames = Math.round(duration * 60);
    const increment = (targetValue - startValue) / totalFrames;
    let currentValue = startValue;
    let frame = 0;

    function updateCounter() {
      element.textContent = `${Math.round(currentValue)}${suffix}`;
      currentValue += increment;
      frame++;
      if (frame < totalFrames) requestAnimationFrame(updateCounter);
      else element.textContent = `${targetValue}${suffix}`;
    }

    requestAnimationFrame(updateCounter);
  }

  function initializeCounter(elementId, target, duration = 3, start = 0, suffix = '+') {
    const counterElement = document.getElementById(elementId);
    if (!counterElement || counterElement.dataset.initialized) return;
    counterElement.dataset.target = target;
    counterElement.dataset.duration = duration;
    counterElement.dataset.start = start;
    counterElement.dataset.suffix = suffix;
    counterElement.dataset.initialized = 'true';
    counterObserver.observe(counterElement);
  }

  initializeCounter("counter1", 3000, 3, 0, '+');
  initializeCounter("counter2", 37, 3, 0, '+');
  initializeCounter("counter3", 40, 3, 0, '+');
  initializeCounter("counter4", 50, 3, 0, '%');

  /*** Currency Drop Animation Control ***/
  function randomFadeAndReposition() {
    const container = document.querySelector("#currencyContainer");
    const symbols = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "₫", "₺", "₴", "₦"];
    const poolSize = 10;
    const pooledElements = [];
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;
    const sideWidth = containerWidth * 0.2;

    for (let i = 0; i < poolSize; i++) {
      const element = document.createElementNS("http://www.w3.org/2000/svg", "text");
      element.setAttribute("text-anchor", "middle");
      element.style.willChange = "transform, opacity";
      element.setAttribute("fill", "#01377D");
      container.appendChild(element);
      pooledElements.push({ element, active: false });
    }

    const precomputedRandoms = Array.from({ length: 50 }, () => Math.random());
    let randomIndex = 0;
    const getRandom = () => precomputedRandoms[(randomIndex++) % precomputedRandoms.length];
    const precomputePositions = () => ({
      left: Array.from({ length: poolSize }, () => getRandom() * sideWidth),
      right: Array.from({ length: poolSize }, () => containerWidth - sideWidth + getRandom() * sideWidth),
    });

    let positions = precomputePositions();
    const startY = -10;
    const endY = containerHeight + 50;

    const updateDimensions = () => {
      containerWidth = container.clientWidth;
      containerHeight = container.clientHeight;
      positions = precomputePositions();
    };

    window.addEventListener("resize", throttle(updateDimensions, 200));

    let lastBatchTime = 0;
    function animateBatch(timestamp) {
      if (timestamp - lastBatchTime >= 3000) {
        for (let i = 0; i < 2; i++) {
          const side = i === 0 ? "left" : "right";
          const poolItem = pooledElements.find(item => !item.active);
          if (poolItem) {
            const symbolIndex = Math.floor(getRandom() * symbols.length);
            poolItem.element.textContent = symbols[symbolIndex];
            const startX = side === "left" ? positions.left[symbolIndex % poolSize] : positions.right[symbolIndex % poolSize];
            poolItem.active = true;

            gsap.set(poolItem.element, { x: startX, y: startY, opacity: 1 });
            gsap.to(poolItem.element, {
              y: endY,
              opacity: 0,
              duration: 15,
              ease: "none",
              onComplete: () => poolItem.active = false,
            });
          }
        }
        lastBatchTime = timestamp;
      }
      requestAnimationFrame(animateBatch);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) gsap.globalTimeline.pause();
      else gsap.globalTimeline.resume();
    });

    requestAnimationFrame(animateBatch);
  }

  randomFadeAndReposition();

  /*** Landing Illustration Bar and Dot Animation Control ***/
  const barElements = ["#bar1", "#bar2", "#bar3"].map(id => document.querySelector(id));
  const dotElements = ["#barDot1", "#barDot2", "#barDot3", "#graphDot1", "#graphDot2"].map(id => document.querySelector(id));
  const animationContainer = document.querySelector("#animationContainer");

  gsap.set(barElements, { transformOrigin: "bottom" });

  const animationTimeline = gsap.timeline({
    repeat: -1,
    yoyo: true,
    yoyoEase: "power1.inOut"
  })
    .to(barElements, {
      keyframes: [
        { scaleY: (i) => [0.6, 0.5, 0.9][i], duration: 1.5 },
        { scaleY: (i) => [0.5, 1.0, 0.6][i], duration: 1.5 },
        { scaleY: (i) => [1.0, 0.6, 1.0][i], duration: 1.5 }
      ]
    })
    .to(dotElements, {
      keyframes: [
        { y: (i) => [73, 90, 17, 73, 90][i], duration: 1.5 },
        { y: (i) => [90, 0, 73, 17, 0][i], duration: 1.5 },
        { y: (i) => [0, 73, 0, 0, 73][i], duration: 1.5 }
      ]
    }, 0);

  const containerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animationTimeline.resume();
      else animationTimeline.pause();
    });
  }, { threshold: 0.1 });

  if (animationContainer) containerObserver.observe(animationContainer);

  /*** Calendar Text Animation Control ***/
  const numbers = ["25", "03", "22", "28", "04", "29", "07", "24", "06", "02", "20", "27", "09", "26", "30", "23", "08", "05"];
  const textElement = document.getElementById('calendarText');
  let currentIndex = 0;
  let intervalId = null;

  function updateText() {
    textElement.textContent = numbers[currentIndex];
    textElement.style.opacity = '1';
    setTimeout(() => textElement.style.opacity = '0', 1000);
    currentIndex = (currentIndex + 1) % numbers.length;
  }

  function startUpdates() {
    if (!intervalId) {
      intervalId = setInterval(updateText, 2000);
      updateText();
    }
  }

  function stopUpdates() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) startUpdates();
      else stopUpdates();
    });
  });
  textObserver.observe(textElement);

  /*** Cog Wheel Animation Control ***/
  const cog = document.getElementById('cog');
  cog.style.willChange = 'transform';

  const rotationTween = gsap.to(cog, {
    rotation: 360,
    duration: 4,
    ease: 'none',
    repeat: -1,
    transformOrigin: '50% 50%',
    paused: true,
  });

  function checkCogInView() {
    const rect = cog.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (rect.top < 0.9 * viewportHeight && rect.bottom > 0.1 * viewportHeight) {
      if (!rotationTween.isActive()) rotationTween.resume();
    } else {
      rotationTween.pause();
    }
  }

  const throttledCogCheck = throttle(checkCogInView, 100);
  window.addEventListener('scroll', throttledCogCheck);
  window.addEventListener('resize', throttledCogCheck);
  window.addEventListener('load', checkCogInView);

  /*** Float Animation Random Selector ***/
  cacheElements('.float').forEach((element, index) => {
    element.style.setProperty('--n', index + 1);
  });
});



