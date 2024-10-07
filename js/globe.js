import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { Line2 } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/Line2.js";
import { LineMaterial } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineGeometry.js";

const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera, controls;
let clock, globe, globeMesh;
let earthTexture, mapMaterial;

initScene();
window.addEventListener("resize", updateSize);

function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
    renderer.setPixelRatio(3);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1.4, 1.4, 1.4, -1.4, 0, 3);
    
    // Adjust camera position to the left and a bit above
    camera.position.set(-0.2, -0.2, 1.45);

    // Make the camera look at the center of the globe
    camera.lookAt(0, 0, 0); // X, Y, Z

    clock = new THREE.Clock();

    createOrbitControls();

    new THREE.TextureLoader().load("./img/map.png", (mapTex) => {
        earthTexture = mapTex;
        earthTexture.repeat.set(1, 1);
        createGlobe();
        updateSize();
        render();
    });
}

function createOrbitControls() {
    controls = new OrbitControls(camera, canvas3D);
    controls.enablePan = false; // Disable panning
    controls.enableZoom = false; // Disable zooming
    controls.enableDamping = true; // Smooth controls
    controls.enableRotate = false; // Disable manual rotation
    controls.autoRotate = true; // Enable auto-rotation
    controls.autoRotateSpeed = 1.5; // Set auto-rotation speed

    controls.domElement.style.pointerEvents = 'none'; // Disable pointer events
}


function createGlobe() {
    const globeGeometry = new THREE.IcosahedronGeometry(1, 22);
    mapMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            uniform sampler2D u_map_tex;
            uniform float u_dot_size, u_time_since_click;
            uniform vec3 u_pointer;
    
            #define PI 3.14159265359
            varying float vOpacity;
            varying vec2 vUv;
    
            void main() {
                vUv = uv;
                float visibility = step(0.2, texture2D(u_map_tex, uv).r);
                gl_PointSize = visibility * u_dot_size * 0.78;
    
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vOpacity = clamp(1.0 / length(mvPosition.xyz) - 0.7, 0.03, 1.0);
    
                float t = max(0.0, u_time_since_click - 0.1);
                float dist = 1.0 - 0.5 * length(position - u_pointer);
                float damping = 1.0 / (1.0 + 20.0 * t);
                float delta = 0.15 * damping * sin(5.0 * t * (1.0 + 2.0 * dist) - PI);
                delta *= 1.0 - smoothstep(0.8, 1.0, dist);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1.0 + delta), 1.0);
            }
        `,
        fragmentShader: `
    uniform sampler2D u_map_tex;
    varying float vOpacity;
    varying vec2 vUv;

    void main() {
        vec3 color = texture2D(u_map_tex, vUv).rgb;

        // Original color tint with a hue shifted towards lighter blue
        vec3 originalTint = vec3(0.6, 0.9, 1.3); // Lighter blue tint
                
        // Apply the tint by blending it with the texture color
        color = mix(color, originalTint, 0.5); // Adjust the 0.5 to control the tint strength

        color -= 0.1 * length(gl_PointCoord.xy - vec2(0.5));
        float dot = 1.0 - smoothstep(0.5, 0.5, length(gl_PointCoord.xy - vec2(0.5)));
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

    // Set the globe rotation to mimic Earth's axial tilt
    globe.rotation.x = THREE.MathUtils.degToRad(23.5); // 23.5 degrees tilt
    globe.rotation.y = 0; // You can adjust this for initial rotation
    globe.rotation.z = 0; // Typically zero unless you want to add more rotation

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
    updateOpacity(); // Call to update opacity based on distance
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

let initialSize;

// Update the size of the renderer and material uniform only when necessary
function updateSize() {
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    const newSize = window.innerHeight > window.innerWidth ? minSide : 0.47 * window.innerWidth;

    if (initialSize !== newSize) {
        initialSize = newSize;
        containerEl.style.width = containerEl.style.height = `${initialSize}px`;
        renderer.setSize(initialSize, initialSize);
        mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
    }
}

// Debounce function to limit how often `updateSize` is called
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedUpdateSize = debounce(updateSize, 200);
window.addEventListener('resize', debouncedUpdateSize);

// Aligns circles to the surface of the globe
function alignCircleToSurface(circle, position, elevation = 0) {
    const liftedPos = position.clone().normalize().multiplyScalar(1 + elevation);
    circle.position.copy(liftedPos);

    const up = new THREE.Vector3(0, 0, 1);
    const direction = liftedPos.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

    circle.setRotationFromQuaternion(quaternion);
}

// Function to create a circle with specified geometry and material parameters
function createCircle(geometryParams, materialParams) {
    const geometry = new THREE.CircleGeometry(...geometryParams);
    const material = new THREE.MeshBasicMaterial(materialParams);
    return new THREE.Mesh(geometry, material);
}

// Function to create static and pulsing circles
function createStaticAndPulsingCircles(position, isStartingPoint = false) {
    const elevation = isStartingPoint ? 0.02 : 0.015;
    const circleSize = isStartingPoint ? 0.04 : 0.027;
    const circleColor = 0x01377D;

    // Create and add static circle
    const staticCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: true });
    alignCircleToSurface(staticCircle, position, elevation);
    scene.add(staticCircle);

    // Create and add pulsing circle
    const pulsingCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
    alignCircleToSurface(pulsingCircle, position, elevation);
    pulsingCircle.position.z -= 0.003; // Small Z-adjustment
    scene.add(pulsingCircle);

    pulsingCircle.userData.gsapOpacity = 1;
    animatePulsingCircle(pulsingCircle);

    staticCircle.userData.distanceOpacityControl = staticCircle.material;
    pulsingCircle.userData.distanceOpacityControl = pulsingCircle.material;

    return { staticCircle, pulsingCircle };
}

// Animate pulsing effect for the circle
function animatePulsingCircle(pulsingCircle) {
    gsap.to(pulsingCircle.scale, { duration: 2, x: 1.75, y: 1.75, repeat: -1, yoyo: true, ease: "power1.Out" });
    gsap.to(pulsingCircle.userData, { duration: 2, gsapOpacity: 0, repeat: -1, yoyo: true, ease: "power1.Out", onUpdate: () => pulsingCircle.material.opacity = pulsingCircle.userData.gsapOpacity });
}

// Updates opacity based on camera distance
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

    const distanceOpacity = THREE.MathUtils.clamp((maxDistance - distance) / (maxDistance - minDistance), 0, 1);
    const newOpacity = object.userData.gsapOpacity !== undefined ? distanceOpacity * object.userData.gsapOpacity : distanceOpacity;

    if (material.opacity !== newOpacity) {
        material.opacity = newOpacity;
        material.needsUpdate = true;
    }
}

// Creates elevated arcs between start and end points
function createElevatedArcs(startPoint, endPoints, baseHeight, heightScale, liftFactor = 1.025) {
    const liftedStart = startPoint.clone().normalize().multiplyScalar(liftFactor);
    const numPoints = 50;

    const createArc = (start, end) => {
        const distance = start.distanceTo(end);
        const heightAboveGlobe = baseHeight + distance * heightScale;

        const points = Array.from({ length: numPoints + 1 }, (_, i) => {
            const t = i / numPoints;
            const point = new THREE.Vector3().lerpVectors(start, end, t);
            const elevation = Math.sin(t * Math.PI) * heightAboveGlobe;
            return point.multiplyScalar(1 + elevation / point.length());
        });

        animateArc(points, start, end);
    };

    endPoints.forEach((end) => {
        const liftedEnd = end.clone().normalize().multiplyScalar(liftFactor);
        createArc(liftedStart, liftedEnd);
        createStaticAndPulsingCircles(liftedEnd);
    });

    return createStaticAndPulsingCircles(liftedStart);
}

// Animate arcs between points
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
            if (line2.geometry) line2.geometry.dispose(); // Dispose previous geometry
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

// Fade out and remove arc
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
// Converts latitude/longitude to a 3D vector (x, y, z) on a sphere
function latLonToVector3(lat, lon, radius = 1) {
    lon += 180;
    if (lon > 180) lon -= 360;

    const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
    const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Set the radius and tilt angle for the globe
const globeRadius = 1;
const tiltAngle = 23.5; // Earth's axial tilt

// Applies a tilt to a vector (around the X-axis)
function applyTilt(vector, angle) {
    const radians = THREE.MathUtils.degToRad(angle);
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);

    const y = vector.y * cosAngle - vector.z * sinAngle;
    const z = vector.y * sinAngle + vector.z * cosAngle;

    return new THREE.Vector3(vector.x, y, z);
}

// Define the starting point (New Delhi) with tilt applied
const point1 = applyTilt(latLonToVector3(28.6139, 77.2090, globeRadius), tiltAngle);

// Define a list of end points for arcs with tilt applied
const endPoints = [
    applyTilt(latLonToVector3(53.3498, -6.2603, globeRadius), tiltAngle),   // Dublin
    applyTilt(latLonToVector3(51.5074, -0.1278, globeRadius), tiltAngle),   // London
    applyTilt(latLonToVector3(46.8182, 8.2275, globeRadius), tiltAngle),    // Switzerland
    applyTilt(latLonToVector3(25.276987, 55.296249, globeRadius), tiltAngle), // Dubai
    applyTilt(latLonToVector3(-37.8136, 144.9631, globeRadius), tiltAngle), // Melbourne
    applyTilt(latLonToVector3(-31.9505, 115.8605, globeRadius), tiltAngle), // Perth
    applyTilt(latLonToVector3(40.7128, -74.0060, globeRadius), tiltAngle),  // New York
    applyTilt(latLonToVector3(34.0522, -118.2437, globeRadius), tiltAngle), // California
    applyTilt(latLonToVector3(61.3707, -152.4040, globeRadius), tiltAngle), // Alaska
    applyTilt(latLonToVector3(49.2827, -123.1207, globeRadius), tiltAngle), // Manitoba
    applyTilt(latLonToVector3(-22.9068, -43.1729, globeRadius), tiltAngle), // Rio de Janeiro
    applyTilt(latLonToVector3(3.4372, -76.5226, globeRadius), tiltAngle),   // Cali
    applyTilt(latLonToVector3(-33.9189, 18.4233, globeRadius), tiltAngle),  // Cape Town
    applyTilt(latLonToVector3(30.0444, 31.2357, globeRadius), tiltAngle),   // Cairo
    applyTilt(latLonToVector3(-41.2865, 174.7762, globeRadius), tiltAngle), // Wellington
];

// Create static and pulsing circles at the start point (New Delhi)
createStaticAndPulsingCircles(point1, true);

// Set base height and scale factor for arcs
const baseHeightAboveGlobe = 0.1;  // Base height above the globe
const heightScaleFactor = 0.3;     // Height scaling factor based on distance

// Function to initialize and create arcs
function initializeArcs() {
    setTimeout(() => {
        // Create elevated arcs from the start point to all end points
        createElevatedArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);
    }, 500); // Delay execution by 500ms
}

// Initialize the arcs immediately
initializeArcs();
