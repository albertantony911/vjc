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
window.addEventListener("resize", debounce(updateSize, 200));

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
                vec3 originalTint = vec3(0.6, 0.9, 1.3);
                color = mix(color, originalTint, 0.5);
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
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    const newSize = window.innerHeight > window.innerWidth ? minSide : 0.47 * window.innerWidth;

    if (initialSize !== newSize) {
        initialSize = newSize;
        containerEl.style.width = containerEl.style.height = `${initialSize}px`;
        renderer.setSize(initialSize, initialSize);
        mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function alignCircleToSurface(circle, position, elevation = 0) {
    const liftedPos = position.clone().normalize().multiplyScalar(1 + elevation);
    circle.position.copy(liftedPos);

    const up = new THREE.Vector3(0, 0, 1);
    const direction = liftedPos.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

    circle.setRotationFromQuaternion(quaternion);
}

function createCircle(geometryParams, materialParams) {
    const geometry = new THREE.CircleGeometry(...geometryParams);
    const material = new THREE.MeshBasicMaterial(materialParams);
    return new THREE.Mesh(geometry, material);
}

function createStaticAndPulsingCircles(position, isStartingPoint = false) {
    const elevation = isStartingPoint ? 0.02 : 0.015;
    const circleSize = isStartingPoint ? 0.04 : 0.027;
    const circleColor = 0x01377D;

    const staticCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: true });
    alignCircleToSurface(staticCircle, position, elevation);
    scene.add(staticCircle);

    const pulsingCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
    alignCircleToSurface(pulsingCircle, position, elevation);
    pulsingCircle.position.z -= 0.003;
    scene.add(pulsingCircle);

    pulsingCircle.userData.gsapOpacity = 1;
    animatePulsingCircle(pulsingCircle);

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

    // Preallocate a temporary vector for reuse
    const tempPoint = new THREE.Vector3();

    const createArc = (start, end) => {
        const distance = start.distanceTo(end);
        const heightAboveGlobe = baseHeight + distance * heightScale;

        // Use a pre-calculated vector for point interpolation and reuse it
        const points = Array.from({ length: numPoints + 1 }, (_, i) => {
            const t = i / numPoints;
            // Reuse tempPoint to avoid creating a new vector on each iteration
            tempPoint.lerpVectors(start, end, t);
            const elevation = Math.sin(t * Math.PI) * heightAboveGlobe;
            return tempPoint.clone().multiplyScalar(1 + elevation / tempPoint.length());
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

    // Pre-flatten points array for performance
    const flatPoints = points.flatMap(p => [p.x, p.y, p.z]);

    // Add the line to the scene only once
    scene.add(line2);

    const drawArc = () => {
        if (pointIndex < points.length) {
            const arcGeometry = new LineGeometry();

            // Update geometry's positions directly without slicing and flat-mapping every time
            arcGeometry.setPositions(flatPoints.slice(0, (pointIndex + 1) * 3)); // Multiply by 3 because we're dealing with x, y, z

            // Update the geometry of line2 without disposing
            line2.geometry = arcGeometry;
            pointIndex++;
            requestAnimationFrame(drawArc);
        } else {
            // Reverse or repeat animation
            setTimeout(() => fadeOutArc(line2, arcMaterial, () => reverse ? animateArc(points.reverse(), end, start, false) : animateArc(points.reverse(), start, end, true)), 500);
        }
    };

    // Add a random delay for the arc to start drawing
    setTimeout(drawArc, Math.random() * 3000);
}


function fadeOutArc(line, material, onComplete) {
    const fadeDuration = 1; // 1 second fade-out duration

    gsap.to(material, {
        opacity: 0,
        duration: fadeDuration,
        ease: "power1.out",
        onComplete: () => {
            scene.remove(line); // Remove the line from the scene
            line.geometry.dispose(); // Dispose of the geometry to free resources
            material.dispose(); // Dispose of the material

            if (onComplete) {
                onComplete(); // Call the provided onComplete callback if any
            }
        }
    });
}


// Precompute conversion factors
const DEG_TO_RAD = Math.PI / 180;

function latLonToVector3(lat, lon, radius = 1, vector = new THREE.Vector3()) {
    const phi = (90 - lat) * DEG_TO_RAD;  // Convert latitude to radians
    const theta = lon * DEG_TO_RAD;  // Convert longitude to radians

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Update and return the passed vector for reuse
    return vector.set(x, y, z);
}

const globeRadius = 1;
const tiltAngle = 23.5;

function applyTilt(vector, angle, resultVector = vector) {
    const radians = THREE.MathUtils.degToRad(angle);
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);

    // Apply tilt transformation directly on the vector or result vector
    const y = vector.y * cosAngle - vector.z * sinAngle;
    const z = vector.y * sinAngle + vector.z * cosAngle;

    // Update the resultVector with the transformed values
    return resultVector.set(vector.x, y, z);
}

// Coordinates for different locations
const locations = [
    [53.3498, -6.2603],  // Dublin
    [51.5074, -0.1278],  // London
    [46.8182, 8.2275],   // Switzerland
    [25.276987, 55.296249],  // Dubai
    [-37.8136, 144.9631], // Melbourne
    [-31.9505, 115.8605], // Perth
    [40.7128, -74.0060],  // New York
    [34.0522, -118.2437], // Los Angeles
    [61.3707, -152.4040], // Alaska
    [49.2827, -123.1207], // Vancouver
    [-22.9068, -43.1729], // Rio de Janeiro
    [3.4372, -76.5226],   // Cali, Colombia
    [-33.9189, 18.4233],  // Cape Town
    [30.0444, 31.2357],   // Cairo
    [-41.2865, 174.7762], // Wellington
];

// Apply latLonToVector3 and applyTilt to each location
const endPoints = locations.map(([lat, lon]) => {
    const vector = latLonToVector3(lat, lon, globeRadius);
    return applyTilt(vector, tiltAngle);
});

// Example usage
const point1 = applyTilt(latLonToVector3(28.6139, 77.2090, globeRadius), tiltAngle);
const baseHeightAboveGlobe = 0.1;
const heightScaleFactor = 0.3;
const arcDelay = 500;  // Configurable delay

// Function to initialize and create arcs
function initializeArcs(delay = arcDelay) {
    setTimeout(() => {
        createElevatedArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);
    }, delay);
}

// Create static and pulsing circles at point1 (starting point)
createStaticAndPulsingCircles(point1, true);

// Initialize arcs after a delay
initializeArcs();



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
window.addEventListener("resize", debounce(updateSize, 200));

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
                vec3 originalTint = vec3(0.6, 0.9, 1.3);
                color = mix(color, originalTint, 0.5);
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
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    const newSize = window.innerHeight > window.innerWidth ? minSide : 0.47 * window.innerWidth;

    if (initialSize !== newSize) {
        initialSize = newSize;
        containerEl.style.width = containerEl.style.height = `${initialSize}px`;
        renderer.setSize(initialSize, initialSize);
        mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
    }
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

function alignCircleToSurface(circle, position, elevation = 0) {
    const liftedPos = position.clone().normalize().multiplyScalar(1 + elevation);
    circle.position.copy(liftedPos);

    const up = new THREE.Vector3(0, 0, 1);
    const direction = liftedPos.clone().normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

    circle.setRotationFromQuaternion(quaternion);
}

function createCircle(geometryParams, materialParams) {
    const geometry = new THREE.CircleGeometry(...geometryParams);
    const material = new THREE.MeshBasicMaterial(materialParams);
    return new THREE.Mesh(geometry, material);
}

function createStaticAndPulsingCircles(position, isStartingPoint = false) {
    const elevation = isStartingPoint ? 0.02 : 0.015;
    const circleSize = isStartingPoint ? 0.04 : 0.027;
    const circleColor = 0x01377D;

    const staticCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: true });
    alignCircleToSurface(staticCircle, position, elevation);
    scene.add(staticCircle);

    const pulsingCircle = createCircle([circleSize, 32], { color: circleColor, transparent: true, opacity: 1, side: THREE.DoubleSide, depthWrite: false, depthTest: false });
    alignCircleToSurface(pulsingCircle, position, elevation);
    pulsingCircle.position.z -= 0.003;
    scene.add(pulsingCircle);

    pulsingCircle.userData.gsapOpacity = 1;
    animatePulsingCircle(pulsingCircle);

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

function latLonToVector3(lat, lon, radius = 1) {
    lon += 180;
    if (lon > 180) lon -= 360;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

const globeRadius = 1;
const tiltAngle = 23.5;

function applyTilt(vector, angle) {
    const radians = THREE.MathUtils.degToRad(angle);
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);

    const y = vector.y * cosAngle - vector.z * sinAngle;
    const z = vector.y * sinAngle + vector.z * cosAngle;

    return new THREE.Vector3(vector.x, y, z);
}

const point1 = applyTilt(latLonToVector3(28.6139, 77.2090, globeRadius), tiltAngle);

const endPoints = [
    applyTilt(latLonToVector3(53.3498, -6.2603, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(51.5074, -0.1278, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(46.8182, 8.2275, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(25.276987, 55.296249, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(-37.8136, 144.9631, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(-31.9505, 115.8605, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(40.7128, -74.0060, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(34.0522, -118.2437, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(61.3707, -152.4040, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(49.2827, -123.1207, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(-22.9068, -43.1729, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(3.4372, -76.5226, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(-33.9189, 18.4233, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(30.0444, 31.2357, globeRadius), tiltAngle),
    applyTilt(latLonToVector3(-41.2865, 174.7762, globeRadius), tiltAngle),
];

createStaticAndPulsingCircles(point1, true);

const baseHeightAboveGlobe = 0.1;
const heightScaleFactor = 0.3;

function initializeArcs() {
    setTimeout(() => {
        createElevatedArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);
    }, 500);
}

initializeArcs();