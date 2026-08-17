import * as THREE from "three";
import { Line2 } from "./libs/Line2.js";
import { LineMaterial } from "./libs/LineMaterial.js";
import { LineGeometry } from "./libs/LineGeometry.js";

export { THREE, Line2, LineMaterial, LineGeometry };

// --- HELPER MATH FUNCTIONS ---
function latLonToTiltedVector3(lat, lon, radius = 1, tiltAngle = 30) {
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

// --- COORDINATES ---
const globeRadius = 1;
const tiltAngle = 38;

// Start Point (New Delhi, India)
const point1 = latLonToTiltedVector3(28.6139, 77.2090, globeRadius, tiltAngle);

// End Points (Australia Cities)
const endPoints = [
  latLonToTiltedVector3(-27.4698, 153.0251, globeRadius, tiltAngle), // Brisbane
  latLonToTiltedVector3(-31.9505, 115.8605, globeRadius, tiltAngle), // Perth
  latLonToTiltedVector3(-33.8688, 151.2093, globeRadius, tiltAngle), // Sydney
  latLonToTiltedVector3(-34.9285, 138.6007, globeRadius, tiltAngle), // Adelaide
  latLonToTiltedVector3(-37.8136, 144.9631, globeRadius, tiltAngle), // Melbourne
];

// --- GLOBE SETUP ---
const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera;
let clock, globe, globeMesh;
let earthTexture, mapMaterial;
let animationFrameId;
let globeIsActive = true;
let opacityObjects = []; 

// Cached vectors for reuse in the update loop (Zero allocation)
const tempCameraPosition = new THREE.Vector3();

// Reusable materials
const staticCircleMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  transparent: false,
  opacity: 1.0,
  side: THREE.DoubleSide
});
const pulsingCircleMaterial = new THREE.MeshBasicMaterial({
  color: 0x10B981, // Vibrant emerald green pulse matching arc curves
  transparent: true,
  opacity: 1.0,
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
  scene.position.x = 0.55; // Position 3D content horizontally (Right: +, Left: -)
  scene.position.y = 0;    // Position 3D content vertically (Up: +, Down: -)
  camera = new THREE.OrthographicCamera(-0.96, 0.96, 0.96, -0.96, 0, 3);
  camera.position.set(-0.2, -0.2, 1.45);
  camera.lookAt(0, 0, 0);

  clock = new THREE.Clock();

  new THREE.TextureLoader().load("./img/map.webp", (mapTex) => {
    earthTexture = mapTex;
    earthTexture.minFilter = THREE.NearestFilter;
    earthTexture.magFilter = THREE.NearestFilter;
    createGlobe();
    updateSize();
    if (globeIsActive) animationFrameId = requestAnimationFrame(render);
  });
}

let angle = Math.PI / 4.75;
const rotationSpeed = 0.01;
const radius = 1.5;

function render() {
  if (!globeIsActive) return;

  const delta = clock.getDelta();
  angle = (angle + rotationSpeed * delta) % (2 * Math.PI);

  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);
  camera.position.set(x, -0.65, z); // Lower camera height angle to view Southern Hemisphere (Australia)
  camera.lookAt(0, 0, 0);

  updateOpacity();
  renderer.render(scene, camera);
  animationFrameId = requestAnimationFrame(render);
}

let initialSize;

function createGlobe() {
  const globeGeometry = new THREE.IcosahedronGeometry(1, 46);
  
  mapMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform sampler2D u_map_tex;
      uniform float u_dot_size, u_time_since_click;
      uniform vec3 u_pointer;
      uniform vec3 u_india_pos;
      uniform vec3 u_aus_pos[5];
      
      varying float vOpacity;
      varying float vIndiaGlow;
      varying float vAusGlow;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        
        // Extract rotation from modelMatrix (excludes scene translation offsets)
        vec3 localRotatedPos = mat3(modelMatrix) * position;
        
        gl_PointSize = u_dot_size * 0.65;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distToCam = length(mvPosition.xyz);
        vOpacity = clamp(1.0 / distToCam - 0.7, 0.03, 1.0);
        
        // --- INDIA HEAT MAP ---
        float distToIndia = distance(localRotatedPos, u_india_pos);
        vIndiaGlow = clamp((1.0 - smoothstep(0.0, 0.42, distToIndia)) * 1.3, 0.0, 1.0);
        
        // --- AUSTRALIA HEAT MAP ---
        float ausGlow = 0.0;
        for(int i = 0; i < 5; i++) {
          float distToAus = distance(localRotatedPos, u_aus_pos[i]);
          ausGlow += (1.0 - smoothstep(0.0, 0.45, distToAus)) * 1.5; 
        }
        vAusGlow = clamp(ausGlow, 0.0, 1.0);
        
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
      varying float vIndiaGlow;
      varying float vAusGlow;
      varying vec2 vUv;

      void main() {
        // Read the color of your topological map
        vec3 mapColor = texture2D(u_map_tex, vUv).rgb;
        
        // Is it ocean? (For black-and-white map-3.webp, ocean is black, i.e., red channel < 0.5)
        if (mapColor.r < 0.5) discard; 
        
        // Set standard color for all other landmasses
        vec3 color = vec3(0.6, 0.9, 1.3);
        
        // Define vibrant green color (R: 0.1, G: 1.0, B: 0.25)
        vec3 brightGreen = vec3(0.1, 1.0, 0.25);
        
        // Apply glow calculated in vertex shader
        color = mix(color, brightGreen, vIndiaGlow * 1.25); 
        color = mix(color, brightGreen, vAusGlow * 1.33); 

        // Shape dots into circles
        float distToCenter = length(gl_PointCoord.xy - vec2(0.5));
        color -= 0.1 * distToCenter;
        float dot = 1.0 - smoothstep(0.48, 0.52, distToCenter);
        if (dot < 0.5) discard;
        
        gl_FragColor = vec4(color, dot * vOpacity);
      }
    `,
    uniforms: {
      u_map_tex: { type: "t", value: earthTexture },
      u_india_pos: { type: "v3", value: point1 },
      u_aus_pos: { type: "v3v", value: endPoints },
      u_dot_size: { type: "f", value: 0.01 },
      u_pointer: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1) },
      u_time_since_click: { value: 0 }
    },
    transparent: true
  });

  globe = new THREE.Points(globeGeometry, mapMaterial);
  scene.add(globe);

  globe.rotation.x = THREE.MathUtils.degToRad(tiltAngle);

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
const LANDSCAPE_RATIO = 1.04;

function updateSize() {
  const width = containerEl.clientWidth || containerEl.parentElement?.clientWidth || window.innerWidth;
  const height = containerEl.clientHeight || containerEl.parentElement?.clientHeight || window.innerHeight;

  if (width > 0 && height > 0) {
    renderer.setSize(width, height);
    
    const aspect = width / height;
    const frustumSize = 0.75;
    camera.left = -frustumSize * aspect;
    camera.right = frustumSize * aspect;
    camera.top = frustumSize;
    camera.bottom = -frustumSize;
    camera.updateProjectionMatrix();

    const minSide = Math.min(width, height);
    mapMaterial.uniforms.u_dot_size.value = 0.02 * minSide;
    if (typeof arcMaterial !== "undefined" && arcMaterial.resolution) {
      arcMaterial.resolution.set(width, height);
    }
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
const staticSharedGeometry = new THREE.CircleGeometry(0.013, 32);
const staticStartingPointGeometry = new THREE.CircleGeometry(0.018, 32);
const pulsingSharedGeometry = new THREE.CircleGeometry(0.016, 32);
const pulsingStartingPointGeometry = new THREE.CircleGeometry(0.024, 32);

function alignCircleToSurface(circle, position, elevation = 0) {
  const liftedPos = position.clone().normalize().multiplyScalar(1 + elevation);
  circle.position.copy(liftedPos);
  quaternion.setFromUnitVectors(up, liftedPos.clone().normalize());
  circle.setRotationFromQuaternion(quaternion);
}

function createStaticAndPulsingCircles(position, isStartingPoint = false) {
  const elevation = 0.045; // Harmonized surface elevation matching arc endpoints
  const staticGeo = isStartingPoint ? staticStartingPointGeometry : staticSharedGeometry;
  const pulsingGeo = isStartingPoint ? pulsingStartingPointGeometry : pulsingSharedGeometry;

  const staticCircle = new THREE.Mesh(staticGeo, staticCircleMaterial.clone());
  alignCircleToSurface(staticCircle, position, elevation);
  staticCircle.renderOrder = 3;

  const pulsingCircle = new THREE.Mesh(pulsingGeo, pulsingCircleMaterial.clone());
  alignCircleToSurface(pulsingCircle, position, elevation);
  pulsingCircle.renderOrder = 2; 

  scene.add(staticCircle, pulsingCircle);
  // Only push pulsingCircle to opacityObjects so staticCircle stays 100% opaque
  opacityObjects.push(pulsingCircle);

  pulsingCircle.userData.gsapOpacity = 1;
  animatePulsingCircle(pulsingCircle);

  pulsingCircle.userData.distanceOpacityControl = pulsingCircle.material;

  return { staticCircle, pulsingCircle };
}

function animatePulsingCircle(pulsingCircle) {
  pulsingCircle.userData.tweenScale = gsap.to(pulsingCircle.scale, {
    duration: 2,
    x: 1.35,
    y: 1.35,
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
  camera.getWorldPosition(tempCameraPosition);
  opacityObjects.forEach((object) => updateCircleOpacity(object, tempCameraPosition));
}

function updateCircleOpacity(object, cameraPosition) {
  const material = object.userData.distanceOpacityControl;
  const distance = cameraPosition.distanceTo(object.position);
  const maxDistance = 2.5, minDistance = 0.5;
  const distanceOpacity = THREE.MathUtils.clamp((maxDistance - distance) / (maxDistance - minDistance), 0, 1);
  const newOpacity = object.userData.gsapOpacity !== undefined ? distanceOpacity * object.userData.gsapOpacity : distanceOpacity;

  if (material.opacity !== newOpacity) {
    material.opacity = newOpacity;
  }
}

function createElevatedArcs(startPoint, endPoints, baseHeight, heightScale, liftFactor = 1.045) {
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
  });

  endPoints.forEach((end) => {
    createStaticAndPulsingCircles(end);
  });

  return createStaticAndPulsingCircles(startPoint, true);
}

function animateArc(points, start, end, reverse = false) {
  let pointIndex = 0;
  
  // Pre-flatten vectors into a fast flat float array
  const flatPoints = points.flatMap((p) => [p.x, p.y, p.z]);

  // Create the geometry once with the full coordinates
  const geometry = new LineGeometry();
  geometry.setPositions(flatPoints);

  // Start by rendering 0 instances (nothing visible yet)
  geometry.instanceCount = 0;

  const line2 = new Line2(geometry, arcMaterial.clone());

  function drawArc() {
    if (!globeIsActive) {
      setTimeout(drawArc, 100);
      return;
    }
    if (pointIndex < points.length) {
      // Set instanceCount to the current segment index to draw it dynamically
      geometry.instanceCount = pointIndex;

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

const baseHeightAboveGlobe = 0.1;
const heightScaleFactor = 0.3;

// Initialize arcs
function initializeGlobeArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor) {
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
