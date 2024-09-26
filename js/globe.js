import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { Line2 } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineGeometry.js';




const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera, controls;
let clock, globe, globeMesh;
let earthTexture, mapMaterial;

initScene();
window.addEventListener("resize", updateSize);

function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
    renderer.setPixelRatio(2);

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
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.enableRotate = true;  // Disable manual rotation
    controls.minPolarAngle = 0.4 * Math.PI;
    controls.maxPolarAngle = 0.4 * Math.PI;
    controls.autoRotate = true;

    let timestamp;
    controls.addEventListener("start", () => {
        timestamp = Date.now();
    });
    controls.addEventListener("end", () => {
        dragged = Date.now() - timestamp > 600;
    });
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

        // Define a brighter, more saturated blue color
        vec3 lightTealWithMoreBlue = vec3(0.5, 1.0, 1.2); // A very light teal with more blue
                
                // Apply the tint by blending it with the texture color
                color = mix(color, lightTealWithMoreBlue, 0.5); // Adjust the 0.5 to control the tint strength

        color -= 0.1 * length(gl_PointCoord.xy - vec2(0.5));
        float dot = 1.0 - smoothstep(0.35, 0.4, length(gl_PointCoord.xy - vec2(0.5)));
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

function updateSize() {
    const minSide = Math.min(window.innerWidth, window.innerHeight);
    const isPortrait = window.innerHeight > window.innerWidth;
    const newSize = isPortrait ? 0.95 * minSide : 0.45 * window.innerWidth; // Use half of the viewport width in landscape

    // Only update if size has changed
    if (initialSize !== newSize) {
        initialSize = newSize;
        containerEl.style.width = initialSize + "px";
        containerEl.style.height = initialSize + "px";
        renderer.setSize(initialSize, initialSize);
        mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
    }
}

window.addEventListener("resize", updateSize);


function alignCircleToSurface(circle, position, elevation = 0) {
    // Normalize the position vector to ensure it's on the globe's surface
    const normalizedPosition = position.clone().normalize();
    
    // Calculate the lifted position with elevation
    const liftedPosition = normalizedPosition.multiplyScalar(1 + elevation);

    // Set the lifted position of the circle
    circle.position.copy(liftedPosition);
    
    // Calculate the up direction based on the lifted position
    const up = new THREE.Vector3(0, 0, 1);  // Assuming Z is up for your globe
    const direction = liftedPosition.clone().normalize(); // Ensure direction points outward

    // Create the quaternion for rotation
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    circle.setRotationFromQuaternion(quaternion);
}

function createStaticAndPulsingCircles(position) {
    const elevation = 0.02; // Adjust the elevation as needed
    
    // Create the static circle
    const staticGeometry = new THREE.CircleGeometry(0.027, 32);
    const staticMaterial = new THREE.MeshBasicMaterial({
        color: 0x01377D,
        transparent: true,
        opacity: 1,  // Initial opacity
        side: THREE.DoubleSide,
        depthWrite: true
    });
    const staticCircle = new THREE.Mesh(staticGeometry, staticMaterial);
    alignCircleToSurface(staticCircle, position, elevation);
    scene.add(staticCircle);

    // Create the pulsing circle
    const pulsingGeometry = new THREE.CircleGeometry(0.027, 32);
    const pulsingMaterial = new THREE.MeshBasicMaterial({
        color: 0x01377D,
        transparent: true,
        opacity: 1,  // Initial opacity
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false
    });
    const pulsingCircle = new THREE.Mesh(pulsingGeometry, pulsingMaterial);
    alignCircleToSurface(pulsingCircle, position, elevation);
    pulsingCircle.position.z -= 0.003; // Adjust as needed
    scene.add(pulsingCircle);

    // Initialize gsapOpacity for blending
    pulsingCircle.userData.gsapOpacity = 1;  // Default to fully opaque

    // Animate the pulsing effect (scaling and fading)
    gsap.to(pulsingCircle.scale, {
        duration: 2,
        x: 1.75,
        y: 1.75,
        repeat: -1,
        yoyo: false,
        ease: "power1.inOut"
    });

    // Animate the opacity to fade in and out using GSAP, store result in userData
    gsap.to(pulsingCircle.userData, {
        duration: 2,
        gsapOpacity: 0, 
        repeat: -1,
        yoyo: false,
        ease: "power1.inOut",
        onUpdate: () => {
            pulsingMaterial.opacity = pulsingCircle.userData.gsapOpacity; // Apply GSAP opacity
        }
    });

    // Add references to the circles for later use (both distance and GSAP effects)
    staticCircle.userData = { distanceOpacityControl: staticMaterial };
    pulsingCircle.userData.distanceOpacityControl = pulsingMaterial;

    return { staticCircle, pulsingCircle };
}

function updateOpacity() {
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition); // Get the camera position
    
    // Store previous opacity states for comparison
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.distanceOpacityControl) {
            const material = object.userData.distanceOpacityControl;
            const distance = cameraPosition.distanceTo(object.position); // Calculate distance

            // Map the distance to opacity
            const maxDistance = 2.5; // Maximum distance for full opacity
            const minDistance = 0.5; // Minimum distance for full opacity
            const distanceOpacity = THREE.MathUtils.clamp((maxDistance - distance) / (maxDistance - minDistance), 0, 1);

            // Check if it's the pulsing circle (with GSAP-controlled opacity)
            const newOpacity = object.userData.gsapOpacity !== undefined
                ? distanceOpacity * object.userData.gsapOpacity // Blend the two opacities
                : distanceOpacity; // Only distance-based opacity for static circles

            // Update the material opacity only if it has changed
            if (material.opacity !== newOpacity) {
                material.opacity = newOpacity;
                material.needsUpdate = true; // Mark material for update
            }
        } else if (object instanceof Line2 && object.material instanceof LineMaterial) {
            // Remove the opacity update for arcs
            // Now we're not updating the opacity based on distance
            // You can add any other logic for Line2 objects if needed
        }
    });
}






function createElevatedArcs(startPoint, endPoints, baseHeightAboveGlobe, heightScaleFactor, liftFactor = 1.025) {
    const liftedStartPoint = startPoint.clone().normalize().multiplyScalar(liftFactor);
    const arcs = [];
    const numPoints = 50;

    const createArcAnimation = (liftedStartPoint, liftedEndPoint) => {
        const distance = liftedStartPoint.distanceTo(liftedEndPoint);
        const heightAboveGlobe = baseHeightAboveGlobe + distance * heightScaleFactor;

        // Generate arc points
        const points = Array.from({ length: numPoints + 1 }, (_, i) => {
            const t = i / numPoints;
            const point = new THREE.Vector3().lerpVectors(liftedStartPoint, liftedEndPoint, t);
            const elevation = Math.sin(t * Math.PI) * heightAboveGlobe;
            return point.multiplyScalar(1 + elevation / point.length());
        });

        let currentPointIndex = 0;
        const arcMaterial = new LineMaterial({
            color: 0x7ED348,
            linewidth: 1.5,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
            depthTest: true,
            transparent: true,
            opacity: 1.0, // Opacity for the arc
            alphaToCoverage: true,
        });

        const line2 = new Line2(new LineGeometry(), arcMaterial); // Create Line2 object here

        const animateArc = () => {
            if (currentPointIndex < points.length) {
                const arcGeometry = new LineGeometry().setPositions(
                    points.slice(0, currentPointIndex + 1).flatMap(p => [p.x, p.y, p.z])
                );
                line2.geometry = arcGeometry; // Update the geometry of the Line2 object
                scene.add(line2);
                currentPointIndex++;
                requestAnimationFrame(animateArc);
            } else {
                // Delay before starting to fade out
                setTimeout(() => {
                    fadeOutArc(line2, arcMaterial);
                }, 500); // Change delay time as needed
            }
        };

        const fadeOutArc = (line, material) => {
        const fadeDuration = 1000; // Duration of fade in milliseconds
        const startTime = performance.now();

        const fade = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / fadeDuration, 1);
            const opacityValue = 1 - progress; // Calculate the current opacity value

            // Update the material opacity
            material.opacity = opacityValue; 

            // Check if the line has vertex colors and update them
            if (line.geometry.attributes.color) {
                const colors = line.geometry.attributes.color.array;
                for (let i = 0; i < colors.length; i += 3) {
                    colors[i + 0] *= opacityValue; // R
                    colors[i + 1] *= opacityValue; // G
                    colors[i + 2] *= opacityValue; // B
                }
                line.geometry.attributes.color.needsUpdate = true; // Mark the colors for update
            }

            // Continue fading until complete
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                scene.remove(line); // Remove from scene after fade out
                // Restart animation with a delay
                setTimeout(() => createArcAnimation(liftedStartPoint, liftedEndPoint), 500);
            }
        };

        requestAnimationFrame(fade);
    };


        // Initial call to start animation
        const randomDelay = Math.random() * 3000; // Between 0 and 3000 milliseconds
        setTimeout(animateArc, randomDelay);
    };

    endPoints.forEach(endPoint => {
        const liftedEndPoint = endPoint.clone().normalize().multiplyScalar(liftFactor);
        createArcAnimation(liftedStartPoint, liftedEndPoint);
        createStaticAndPulsingCircles(liftedEndPoint);
    });

    const startCircles = createStaticAndPulsingCircles(liftedStartPoint);
    return { arcs, startCircles };
}





function latLonToVector3(lat, lon, radius = 1) {
    // Convert longitude to range [-180, 180]
    lon = lon + 180;
    if (lon > 180) lon = lon - 360; 

    const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
    const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Set the radius of the globe
const globeRadius = 1; // Adjust this to match your globe's actual radius

// Define tilt angle in degrees
const tiltAngle = 23.5; // Example: Earth's axial tilt

// Function to rotate a vector by a tilt angle around the X-axis
function applyTilt(vector, angle) {
    const radians = THREE.MathUtils.degToRad(angle);
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);

    // Rotate around X-axis
    const y = vector.y * cosAngle - vector.z * sinAngle;
    const z = vector.y * sinAngle + vector.z * cosAngle;

    return new THREE.Vector3(vector.x, y, z);
}


// Set up points and endpoint data with tilt adjustment
const point1 = applyTilt(latLonToVector3(28.6139, 77.2090, globeRadius), tiltAngle); // New Delhi

const endPoints = [
    applyTilt(latLonToVector3(53.3498, -6.2603, globeRadius), tiltAngle),  // Dublin
    applyTilt(latLonToVector3(51.5074, -0.1278, globeRadius), tiltAngle),  // London
    applyTilt(latLonToVector3(46.8182, 8.2275, globeRadius), tiltAngle),   // Switzerland
    applyTilt(latLonToVector3(25.276987, 55.296249, globeRadius), tiltAngle), // Dubai
    applyTilt(latLonToVector3(-37.8136, 144.9631, globeRadius), tiltAngle),   // Melbourne
    applyTilt(latLonToVector3(-31.9505, 115.8605, globeRadius), tiltAngle),   // Perth
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

// Now you can use point1 and endPoints in your application logic

const baseHeightAboveGlobe = 0.1; // Base height
const heightScaleFactor = 0.3; // Height increase per unit distance

// Function to handle intersection
function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Set a delay before executing the arc creation
            setTimeout(() => {
                try {
                    createElevatedArcs(point1, endPoints, baseHeightAboveGlobe, heightScaleFactor);
                } catch (error) {
                    console.error("Error creating arcs:", error);
                }
            }, 500); // Delay in milliseconds (500ms = 0.5 seconds)

            // Unobserve the entry after it has been triggered to prevent multiple calls
            observer.unobserve(entry.target);
        }
    });
}

// Create an Intersection Observer
const observer = new IntersectionObserver(handleIntersection);

// Target the element
const target = document.getElementById('arc-container');
if (target) {
    observer.observe(target);
} else {
    console.error("Target element not found");
}
