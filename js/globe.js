// threeModules.js
import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/Line2.js";
import { LineMaterial } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineGeometry.js";

export { THREE, OrbitControls, Line2, LineMaterial, LineGeometry };

    

const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera, controls;
let clock, globe, globeMesh;
let earthTexture, mapMaterial;

initScene();


function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
    renderer.setPixelRatio(3);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1.4, 1.4, 1.4, -1.4, 0, 3);
    camera.position.set(-0.2, -0.2, 1.45);
    camera.lookAt(0, 0, 0);

    clock = new THREE.Clock();

    createOrbitControls();

    new THREE.TextureLoader().load("./img/map.webp", (mapTex) => {
        earthTexture = mapTex;
        createGlobe();
        updateSize();
        render();
    });
}



function createOrbitControls() {
    controls = new OrbitControls(camera, canvas3D);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.enableRotate = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.domElement.style.pointerEvents = 'none';
}

function createGlobe() {
    const globeGeometry = new THREE.IcosahedronGeometry(1, 22);
    mapMaterial = new THREE.ShaderMaterial({
        vertexShader: `
    uniform sampler2D u_map_tex;
    uniform float u_dot_size, u_time_since_click, u_pi;
    uniform vec3 u_pointer;

    varying float vOpacity;
    varying vec2 vUv;

    void main() {
        vUv = uv;

        // Fetch visibility once
        float visibility = step(0.2, texture2D(u_map_tex, vUv).r);
        gl_PointSize = visibility * u_dot_size * 0.78;

        // Calculate model-view position
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float distToCam = length(mvPosition.xyz);

        // Calculate opacity based on distance
        vOpacity = clamp(1.0 / distToCam - 0.7, 0.03, 1.0);

        // Time factor and distance from pointer
        float t = max(0.0, u_time_since_click - 0.1);
        float dist = length(position - u_pointer);
        float damping = exp(-20.0 * t);

        // Calculate delta factor for sine wave
        float delta = 0.15 * damping * sin(5.0 * t - u_pi) * (1.0 - smoothstep(0.8, 1.0, dist));

        // Final position calculation
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 + delta), 1.0);
    }
`,
        fragmentShader: `
    uniform sampler2D u_map_tex;
    varying float vOpacity;
    varying vec2 vUv;

    void main() {
        // Fetch the color from the texture and apply the original tint
        vec3 color = texture2D(u_map_tex, vUv).rgb;
        vec3 originalTint = vec3(0.6, 0.9, 1.3);
        color = mix(color, originalTint, 0.5);

        // Calculate distance to the center of the point once
        float distToCenter = length(gl_PointCoord.xy - vec2(0.5));
        color -= 0.1 * distToCenter;

        // Simplify dot calculation
        float dot = 1.0 - smoothstep(0.48, 0.52, distToCenter);
        if (dot < 0.5) discard;

        // Set the final fragment color
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
            color: 0xdbe9f4,
            transparent: true,
            opacity: 0.15
        })
    );
    scene.add(globeMesh);
}

function render() {
    mapMaterial.uniforms.u_time_since_click.value = clock.getElapsedTime();
    controls.update();
    updateOpacity();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

let initialSize;

function updateSize() {
    // Cache window dimensions to avoid repeated recalculation
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Determine the minimum side and the new size based on the window dimensions
    const minSide = Math.min(windowWidth, windowHeight);
    const newSize = windowHeight > windowWidth ? minSide : 0.47 * windowWidth;

    // Update only if the size has actually changed
    if (initialSize !== newSize) {
        initialSize = newSize;

        // Set width and height together for performance
        containerEl.style.cssText = `width: ${initialSize}px; height: ${initialSize}px;`;

        // Update renderer size and material uniform value
        renderer.setSize(initialSize, initialSize);
        const newDotSize = 0.04 * initialSize;
        mapMaterial.uniforms.u_dot_size.value = newDotSize;
    }
}

// Debounce function to limit the rate at which updateSize is called during resize events
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
window.addEventListener("resize", debounce(updateSize, 200));



// Reuse vectors and quaternions to avoid unnecessary object creation
const up = new THREE.Vector3(0, 0, 1);
const quaternion = new THREE.Quaternion();

function alignCircleToSurface(circle, position, elevation = 0) {
    // Avoid cloning and directly manipulate vectors
    const liftedPos = position.normalize().multiplyScalar(1 + elevation);
    circle.position.copy(liftedPos);

    const direction = liftedPos.normalize(); // No need to clone
    quaternion.setFromUnitVectors(up, direction);

    // Use quaternion to set the rotation
    circle.setRotationFromQuaternion(quaternion);
}

function createCircle(geometryParams, materialParams) {
    // Create a circle geometry and material in one step
    const geometry = new THREE.CircleGeometry(...geometryParams);
    const material = new THREE.MeshBasicMaterial(materialParams);
    return new THREE.Mesh(geometry, material);
}


// Reuse geometry instances
const sharedGeometry = new THREE.CircleGeometry(0.027, 32);
const startingPointGeometry = new THREE.CircleGeometry(0.04, 32);

// Base material properties - these can be cloned for each instance
const baseMaterialProps = {
    color: 0x01377D,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide
};

function createStaticAndPulsingCircles(position, isStartingPoint = false) {
    // Decide the elevation and geometry based on the isStartingPoint flag
    const elevation = isStartingPoint ? 0.02 : 0.015;
    const geometry = isStartingPoint ? startingPointGeometry : sharedGeometry;

    // Create unique materials for each circle to maintain independent opacity control
    const staticCircleMaterial = new THREE.MeshBasicMaterial({
        ...baseMaterialProps,
        depthWrite: true
    });
    
    const pulsingCircleMaterial = new THREE.MeshBasicMaterial({
        ...baseMaterialProps,
        depthWrite: false,
        depthTest: false
    });

    // Create static circle with reused geometry and unique material
    const staticCircle = new THREE.Mesh(geometry, staticCircleMaterial);
    alignCircleToSurface(staticCircle, position, elevation);

    // Create pulsing circle with reused geometry and unique material
    const pulsingCircle = new THREE.Mesh(geometry, pulsingCircleMaterial);
    alignCircleToSurface(pulsingCircle, position, elevation);
    pulsingCircle.position.z -= 0.003;

    // Add both to the scene
    scene.add(staticCircle, pulsingCircle);

    // Add pulsing circle animation
    pulsingCircle.userData.gsapOpacity = 1;
    animatePulsingCircle(pulsingCircle);

    // Store relevant data in userData for distance-based opacity control
    staticCircle.userData.distanceOpacityControl = staticCircle.material;
    pulsingCircle.userData.distanceOpacityControl = pulsingCircle.material;

    return { staticCircle, pulsingCircle };
}



function animatePulsingCircle(pulsingCircle) {
    gsap.to(pulsingCircle.scale, { duration: 2, x: 1.75, y: 1.75, repeat: -1, yoyo: true, ease: "power1.Out" });
    gsap.to(pulsingCircle.userData, { duration: 2, gsapOpacity: 0, repeat: -1, yoyo: true, ease: "power1.Out", onUpdate: () => pulsingCircle.material.opacity = pulsingCircle.userData.gsapOpacity });
}

function updateOpacity() {
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.distanceOpacityControl) {
            updateCircleOpacity(object, cameraPosition);
        }
    });
}

function updateCircleOpacity(object, cameraPosition) {
    const material = object.userData.distanceOpacityControl;
    const distance = cameraPosition.distanceTo(object.position);
    const maxDistance = 2.5, minDistance = 0.5;

    // Calculate distance-based opacity
    const distanceOpacity = THREE.MathUtils.clamp((maxDistance - distance) / (maxDistance - minDistance), 0, 1);
    const newOpacity = object.userData.gsapOpacity !== undefined ? distanceOpacity * object.userData.gsapOpacity : distanceOpacity;

    if (material.opacity !== newOpacity) {
        material.opacity = newOpacity;
        material.needsUpdate = true;
    }
}


function createElevatedArcs(startPoint, endPoints, baseHeight, heightScale, liftFactor = 1.025) {
    // Lift the start point
    const liftedStart = startPoint.clone().normalize().multiplyScalar(liftFactor);
    const numPoints = 50;
    const tempVector = new THREE.Vector3();

    const createArc = (start, end) => {
        // Precompute the distance and height above the globe
        const distance = start.distanceTo(end);
        const heightAboveGlobe = baseHeight + distance * heightScale;

        // Precompute the elevation values
        const elevationArray = Array.from({ length: numPoints + 1 }, (_, i) => 
            Math.sin((i / numPoints) * Math.PI) * heightAboveGlobe
        );

        // Create points along the arc
        const points = Array.from({ length: numPoints + 1 }, (_, i) => {
            const t = i / numPoints;
            tempVector.lerpVectors(start, end, t);
            const elevation = elevationArray[i];
            return tempVector.multiplyScalar(1 + elevation / tempVector.length()).clone();
        });

        // Animate the arc with the computed points
        animateArc(points, start, end);
    };

    // Loop through the endpoints
    const liftedEnds = endPoints.map(end => end.clone().normalize().multiplyScalar(liftFactor));
    liftedEnds.forEach(liftedEnd => {
        createArc(liftedStart, liftedEnd);
        createStaticAndPulsingCircles(liftedEnd);
    });

    // Create static and pulsing circles for the start point
    return createStaticAndPulsingCircles(liftedStart);
}


function animateArc(points, start, end, reverse = false) {
    let pointIndex = 0;
    const arcMaterial = new LineMaterial({
        color: 0x7CBA3A,
        linewidth: 1.5,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        depthTest: true,
        transparent: true,
        opacity: 1.0,
        alphaToCoverage: true,
    });

    const line2 = new Line2(new LineGeometry(), arcMaterial);

    const drawArc = () => {
        if (pointIndex < points.length) {
            const arcGeometry = new LineGeometry().setPositions(points.slice(0, pointIndex + 1).flatMap(p => [p.x, p.y, p.z]));
            if (line2.geometry) line2.geometry.dispose();
            line2.geometry = arcGeometry;
            scene.add(line2);
            pointIndex++;
            requestAnimationFrame(drawArc);
        } else {
            setTimeout(() => fadeOutArc(line2, arcMaterial, () => reverse ? animateArc(points.reverse(), end, start, false) : animateArc(points.reverse(), start, end, true)), 500);
        }
    };

    setTimeout(drawArc, Math.random() * 3000);
}

function fadeOutArc(line, material, onComplete) {
    const fadeDuration = 1000;
    const startTime = performance.now();

    const fade = (time) => {
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
    };

    requestAnimationFrame(fade);
}

// Function to convert latitude and longitude to a tilted 3D vector
function latLonToTiltedVector3(lat, lon, radius = 1, tiltAngle = 23.5) {
    // Convert lat/lon to vector3
    lon += 180;
    if (lon > 180) lon -= 360;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Apply tilt
    const radians = THREE.MathUtils.degToRad(tiltAngle);
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);

    const tiltedY = y * cosAngle - z * sinAngle;
    const tiltedZ = y * sinAngle + z * cosAngle;

    return new THREE.Vector3(x, tiltedY, tiltedZ);
}

// Example usage
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

// Function to create static and pulsing circles
createStaticAndPulsingCircles(point1, true);

// Base height and height scale factor for arcs
const baseHeightAboveGlobe = 0.1;
const heightScaleFactor = 0.3;

// Function to initialize arcs with a delay
function initializeGlobeArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor) {
    // Create static and pulsing circles for the start point
    createStaticAndPulsingCircles(startPoint, true);

    // Delay the arc creation for a more natural start
    delayInitialize(() => {
        createElevatedArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor);
    }, 500);
}

// Function to delay initialization using requestAnimationFrame
function delayInitialize(callback, delayMs) {
    const start = performance.now();

    function frame(time) {
        if (time - start >= delayMs) {
            callback();
        } else {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

// Call the function to initialize everything
initializeGlobeArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);