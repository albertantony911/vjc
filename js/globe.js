import * as THREE from "https://cdn.skypack.dev/three@0.133.1?min";
import { Line2 } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/Line2.js?min";
import { LineMaterial } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineMaterial.js?min";
import { LineGeometry } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineGeometry.js?min";

export { THREE, Line2, LineMaterial, LineGeometry };

const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera;
let clock, globe, globeMesh;
let earthTexture, mapMaterial;
let animationFrameId;
let globeIsActive = true;
let opacityObjects = []; // Cache for opacity updates

// Reusable materials
const staticCircleMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide
});
const pulsingCircleMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: true,
  opacity: 1,
  side: THREE.DoubleSide,
  depthWrite: false,
  depthTest: false
});
const arcMaterial = new LineMaterial({
  color: 0x7CBA3A,
  linewidth: 2,
  resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  depthTest: true,
  transparent: true,
  opacity: 1.0,
  alphaToCoverage: true,
});

// IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      globeIsActive = entry.isIntersecting;
      if (globeIsActive) {
        clock.start();
        if (!animationFrameId) animationFrameId = requestAnimationFrame(render);
        scene.traverse((object) => {
          if (object.userData.tweenScale) object.userData.tweenScale.resume();
          if (object.userData.tweenOpacity) object.userData.tweenOpacity.resume();
        });
      } else {
        clock.stop();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        scene.traverse((object) => {
          if (object.userData.tweenScale) object.userData.tweenScale.pause();
          if (object.userData.tweenOpacity) object.userData.tweenOpacity.pause();
        });
      }
    });
  },
  { threshold: 0.1 }
);

observer.observe(containerEl);

initScene();

function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
  renderer.setPixelRatio(2);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1.25, 1.25, 1.25, -1.25, 0, 3);
  camera.position.set(-0.2, -0.2, 1.45);
  camera.lookAt(0, 0, 0);

  clock = new THREE.Clock();

  new THREE.TextureLoader().load("./img/map.webp", (mapTex) => {
    earthTexture = mapTex;
    createGlobe();
    updateSize();
    if (globeIsActive) animationFrameId = requestAnimationFrame(render);
  });
}

let angle = Math.PI / 2.8;
const rotationSpeed = 0.05;
const radius = 1.5;

function render() {
  if (!globeIsActive) return;

  const delta = clock.getDelta();
  angle = (angle + rotationSpeed * delta) % (2 * Math.PI);

  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  camera.position.set(x, 0, z);
  camera.lookAt(0, 0, 0);

  updateOpacity();
  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(render);
}

let initialSize;

function createGlobe() {
  const globeGeometry = new THREE.IcosahedronGeometry(1, 20);
  mapMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform sampler2D u_map_tex;
      uniform float u_dot_size, u_time_since_click;
      uniform vec3 u_pointer;
      varying float vOpacity;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_PointSize = u_dot_size * 0.65;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distToCam = length(mvPosition.xyz);
        vOpacity = clamp(1.0 / distToCam - 0.7, 0.03, 1.0);
        float t = max(0.0, u_time_since_click - 0.1);
        float dist = length(position - u_pointer);
        float damping = exp(-20.0 * t);
        float delta = 0.15 * damping * sin(5.0 * t - 3.14159) * (1.0 - smoothstep(0.8, 1.0, dist));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 + delta), 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D u_map_tex;
      varying float vOpacity;
      varying vec2 vUv;

      void main() {
        float visibility = step(0.2, texture2D(u_map_tex, vUv).r);
        if (visibility < 0.5) discard;
        vec3 color = texture2D(u_map_tex, vUv).rgb;
        vec3 originalTint = vec3(0.6, 0.9, 1.3);
        color = mix(color, originalTint, 0.9);
        float distToCenter = length(gl_PointCoord.xy - vec2(0.5));
        color -= 0.1 * distToCenter;
        float dot = 1.0 - smoothstep(0.48, 0.52, distToCenter);
        if (dot < 0.5) discard;
        gl_FragColor = vec4(color, dot * vOpacity);
      }
    `,
    uniforms: {
      u_map_tex: { type: "t", value: earthTexture },
      u_dot_size: { type: "f", value: 0.01 },
      u_pointer: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1) },
      u_time_since_click: { value: 0 }
    },
    transparent: true
  });

  globe = new THREE.Points(globeGeometry, mapMaterial);
  scene.add(globe);

  globe.rotation.x = THREE.MathUtils.degToRad(23.5);

  globeMesh = new THREE.Mesh(
    globeGeometry,
    new THREE.MeshBasicMaterial({
      color: 0x318CE7,
      transparent: true,
      opacity: 0.1
    })
  );
  scene.add(globeMesh);
}

const PORTRAIT_RATIO = 0.9;
const LANDSCAPE_RATIO = 0.7;

function updateSize() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const minSide = Math.min(windowWidth, windowHeight);
  let newSize = windowWidth < windowHeight ? PORTRAIT_RATIO * minSide : LANDSCAPE_RATIO * windowHeight;

  if (initialSize !== newSize) {
    initialSize = newSize;
    containerEl.style.cssText = `width: ${initialSize}px; height: ${initialSize}px;`;
    renderer.setSize(initialSize, initialSize);
    mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
  }
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
window.addEventListener("resize", debounce(updateSize, 200));

const up = new THREE.Vector3(0, 0, 1);
const quaternion = new THREE.Quaternion();
const sharedGeometry = new THREE.CircleGeometry(0.027, 32);
const startingPointGeometry = new THREE.CircleGeometry(0.04, 32);

function alignCircleToSurface(circle, position, elevation = 0) {
  const liftedPos = position.normalize().multiplyScalar(1 + elevation);
  circle.position.copy(liftedPos);
  quaternion.setFromUnitVectors(up, liftedPos.normalize());
  circle.setRotationFromQuaternion(quaternion);
}

function createStaticAndPulsingCircles(position, isStartingPoint = false) {
  const elevation = isStartingPoint ? 0.02 : 0.015;
  const geometry = isStartingPoint ? startingPointGeometry : sharedGeometry;

  const staticCircle = new THREE.Mesh(geometry, staticCircleMaterial.clone());
  alignCircleToSurface(staticCircle, position, elevation);

  const pulsingCircle = new THREE.Mesh(geometry, pulsingCircleMaterial.clone());
  alignCircleToSurface(pulsingCircle, position, elevation);
  pulsingCircle.position.z -= 0.003;

  scene.add(staticCircle, pulsingCircle);
  opacityObjects.push(staticCircle, pulsingCircle); // Add to opacity cache

  pulsingCircle.userData.gsapOpacity = 1;
  animatePulsingCircle(pulsingCircle);

  staticCircle.userData.distanceOpacityControl = staticCircle.material;
  pulsingCircle.userData.distanceOpacityControl = pulsingCircle.material;

  return { staticCircle, pulsingCircle };
}

function animatePulsingCircle(pulsingCircle) {
  pulsingCircle.userData.tweenScale = gsap.to(pulsingCircle.scale, {
    duration: 2,
    x: 1.75,
    y: 1.75,
    repeat: -1,
    yoyo: true,
    ease: "power1.Out",
    paused: !globeIsActive,
  });

  pulsingCircle.userData.tweenOpacity = gsap.to(pulsingCircle.userData, {
    duration: 2,
    gsapOpacity: 0,
    repeat: -1,
    yoyo: true,
    ease: "power1.Out",
    paused: !globeIsActive,
    onUpdate: () => {
      pulsingCircle.material.opacity = pulsingCircle.userData.gsapOpacity;
    },
  });
}

function updateOpacity() {
  const cameraPosition = new THREE.Vector3();
  camera.getWorldPosition(cameraPosition);
  opacityObjects.forEach((object) => updateCircleOpacity(object, cameraPosition));
}

function updateCircleOpacity(object, cameraPosition) {
  const material = object.userData.distanceOpacityControl;
  const distance = cameraPosition.distanceTo(object.position);
  const maxDistance = 2.5, minDistance = 0.5;
  const distanceOpacity = THREE.MathUtils.clamp((maxDistance - distance) / (maxDistance - minDistance), 0, 1);
  const newOpacity = object.userData.gsapOpacity !== undefined ? distanceOpacity * object.userData.gsapOpacity : distanceOpacity;

  if (material.opacity !== newOpacity) {
    material.opacity = newOpacity;
    material.needsUpdate = true;
  }
}

function createElevatedArcs(startPoint, endPoints, baseHeight, heightScale, liftFactor = 1.025) {
  const liftedStart = startPoint.clone().normalize().multiplyScalar(liftFactor);
  const numPoints = 50;
  const tempVector = new THREE.Vector3();

  const createArc = (start, end) => {
    const distance = start.distanceTo(end);
    const heightAboveGlobe = baseHeight + distance * heightScale;
    const elevationArray = Array.from({ length: numPoints + 1 }, (_, i) =>
      Math.sin((i / numPoints) * Math.PI) * heightAboveGlobe
    );
    const points = Array.from({ length: numPoints + 1 }, (_, i) => {
      const t = i / numPoints;
      tempVector.lerpVectors(start, end, t);
      const elevation = elevationArray[i];
      return tempVector.multiplyScalar(1 + elevation / tempVector.length()).clone();
    });

    animateArc(points, start, end);
  };

  const liftedEnds = endPoints.map((end) =>
    end.clone().normalize().multiplyScalar(liftFactor)
  );
  liftedEnds.forEach((liftedEnd) => {
    createArc(liftedStart, liftedEnd);
    createStaticAndPulsingCircles(liftedEnd);
  });

  return createStaticAndPulsingCircles(liftedStart);
}

function animateArc(points, start, end, reverse = false) {
  let pointIndex = 0;
  const line2 = new Line2(new LineGeometry(), arcMaterial.clone());

  function drawArc() {
    if (!globeIsActive) {
      setTimeout(drawArc, 100);
      return;
    }
    if (pointIndex < points.length) {
      const arcGeometry = new LineGeometry().setPositions(
        points.slice(0, pointIndex + 1).flatMap((p) => [p.x, p.y, p.z])
      );
      if (line2.geometry) line2.geometry.dispose();
      line2.geometry = arcGeometry;
      if (!scene.children.includes(line2)) {
        scene.add(line2);
      }
      pointIndex++;
      requestAnimationFrame(drawArc);
    } else {
      setTimeout(() => {
        if (!globeIsActive) {
          const checkActive = () => {
            if (globeIsActive) {
              fadeOutArc(line2, line2.material, () =>
                reverse
                  ? animateArc(points.reverse(), end, start, false)
                  : animateArc(points.reverse(), start, end, true)
              );
            } else {
              setTimeout(checkActive, 100);
            }
          };
          checkActive();
        } else {
          fadeOutArc(line2, line2.material, () =>
            reverse
              ? animateArc(points.reverse(), end, start, false)
              : animateArc(points.reverse(), start, end, true)
          );
        }
      }, 500);
    }
  }

  setTimeout(() => {
    drawArc();
  }, Math.random() * 3000);
}

function fadeOutArc(line, material, onComplete) {
  const fadeDuration = 1000;
  const startTime = performance.now();

  function fade(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / fadeDuration, 1);
    material.opacity = 1 - progress;

    if (progress < 1) {
      requestAnimationFrame(fade);
    } else {
      scene.remove(line);
      line.geometry.dispose();
      material.dispose();
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(fade);
}

function latLonToTiltedVector3(lat, lon, radius = 1, tiltAngle = 23.5) {
  lon += 180;
  if (lon > 180) lon -= 360;

  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const radians = THREE.MathUtils.degToRad(tiltAngle);
  const cosAngle = Math.cos(radians);
  const sinAngle = Math.sin(radians);

  const tiltedY = y * cosAngle - z * sinAngle;
  const tiltedZ = y * sinAngle + z * cosAngle;

  return new THREE.Vector3(x, tiltedY, tiltedZ);
}

const globeRadius = 1;
const tiltAngle = 23.5;
const point1 = latLonToTiltedVector3(28.6139, 77.2090, globeRadius, tiltAngle);

const endPoints = [
  latLonToTiltedVector3(53.3498, -6.2603, globeRadius, tiltAngle),
  latLonToTiltedVector3(51.5074, -0.1278, globeRadius, tiltAngle),
  latLonToTiltedVector3(46.8182, 8.2275, globeRadius, tiltAngle),
  latLonToTiltedVector3(25.276987, 55.296249, globeRadius, tiltAngle),
  latLonToTiltedVector3(-37.8136, 144.9631, globeRadius, tiltAngle),
  latLonToTiltedVector3(-31.9505, 115.8605, globeRadius, tiltAngle),
  latLonToTiltedVector3(40.7128, -74.0060, globeRadius, tiltAngle),
  latLonToTiltedVector3(34.0522, -118.2437, globeRadius, tiltAngle),
  latLonToTiltedVector3(61.3707, -152.4040, globeRadius, tiltAngle),
  latLonToTiltedVector3(49.2827, -123.1207, globeRadius, tiltAngle),
  latLonToTiltedVector3(-22.9068, -43.1729, globeRadius, tiltAngle),
  latLonToTiltedVector3(3.4372, -76.5226, globeRadius, tiltAngle),
  latLonToTiltedVector3(-33.9189, 18.4233, globeRadius, tiltAngle),
  latLonToTiltedVector3(30.0444, 31.2357, globeRadius, tiltAngle),
  latLonToTiltedVector3(-41.2865, 174.7762, globeRadius, tiltAngle),
];

createStaticAndPulsingCircles(point1, true);

const baseHeightAboveGlobe = 0.1;
const heightScaleFactor = 0.3;

function initializeGlobeArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor) {
  createStaticAndPulsingCircles(startPoint, true);
  delayInitialize(() => {
    createElevatedArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor);
  }, 500);
}

function delayInitialize(callback, delayMs) {
  const start = performance.now();
  function frame(time) {
    if (time - start >= delayMs) callback();
    else requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

initializeGlobeArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);