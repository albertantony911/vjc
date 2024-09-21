import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";



const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera, rayCaster, controls;
let clock, mouse, globe, globeMesh;
let earthTexture, mapMaterial;
let dragged = false;

initScene();
window.addEventListener("resize", updateSize);

function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
    renderer.setPixelRatio(2);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1.4, 1.4, 1.4, -1.4, 0, 3);
    camera.position.z = 1.45;

    
    
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
}

function createGlobe() {
    const globeGeometry = new THREE.IcosahedronGeometry(1,22);
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
                
                // Define a more intense blue tint color
                vec3 lightBlueTint = vec3(0.3, 0.5, 0.8); // A more blue shade
                
                // Apply the blue tint by blending it with the texture color
                color = mix(color, lightBlueTint, 0.5); // Adjust the 0.5 to control the tint strength
        
                color -= 0.2 * length(gl_PointCoord.xy - vec2(0.5));
                float dot = 1.0 - smoothstep(0.38, 0.4, length(gl_PointCoord.xy - vec2(0.5)));
                if (dot < 0.5) discard;
                gl_FragColor = vec4(color, dot * vOpacity);
            }
        `,
        uniforms: {
            u_map_tex: { type: "t", value: earthTexture },
            u_dot_size: { type: "f", value: 0.02 },
            u_pointer: { type: "v3", value: new THREE.Vector3(0.0, 0.0, 1) },
            u_time_since_click: { value: 0 }
        },
        transparent: true
    });

    globe = new THREE.Points(globeGeometry, mapMaterial);
    scene.add(globe);

    globeMesh = new THREE.Mesh(
        globeGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.01
        })
    );
    scene.add(globeMesh);
}





function render() {
    mapMaterial.uniforms.u_time_since_click.value = clock.getElapsedTime();
    // Remove the following line
    // checkIntersects();
    controls.update();
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


// Create a static and pulsing circle at a given position
// Function to align the circles properly on the globe's surface
function alignCircleToSurface(circle, position, elevation = 0) {
    // First, normalize the position vector so it's on the globe's surface
    position.normalize();
    
    // Calculate the lifted position by adding the elevation
    const liftedPosition = position.clone().multiplyScalar(1 + elevation); // Elevation above the globe

    // Set the lifted position of the circle
    circle.position.copy(liftedPosition);
    
    // Create a new direction vector from the lifted position to the globe's center
    const up = new THREE.Vector3(0, 0, 0); // The center of the globe
    const direction = new THREE.Vector3().subVectors(circle.position, up).normalize();
    
    // Align the circle so that it is perpendicular to the surface at the given point
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);  // Adjust for surface normal
    circle.setRotationFromQuaternion(quaternion);
}


function createStaticAndPulsingCircles(position) {
    const elevation = 0.015 // Adjust the elevation as needed
    
    // Create the static circle
    const staticGeometry = new THREE.CircleGeometry(0.04, 32);
    const staticMaterial = new THREE.MeshBasicMaterial({
        color: 0x01377D,
        transparent: true,
        opacity: 1,  // Static circle opacity
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const staticCircle = new THREE.Mesh(staticGeometry, staticMaterial);

    // Align the static circle to the globe's surface with elevation
    alignCircleToSurface(staticCircle, position, elevation);

    // Add static circle to the scene
    scene.add(staticCircle);

    // Create the pulsing circle
    const pulsingGeometry = new THREE.CircleGeometry(0.04, 32);
    const pulsingMaterial = new THREE.MeshBasicMaterial({
        color: 0x01377D,
        transparent: true,
        opacity: 1,  // Initial opacity for pulsing effect
        side: THREE.DoubleSide
    });
    const pulsingCircle = new THREE.Mesh(pulsingGeometry, pulsingMaterial);

    // Align the pulsing circle to the globe's surface with elevation
    alignCircleToSurface(pulsingCircle, position, elevation);

    // Add pulsing circle to the scene
    scene.add(pulsingCircle);

    // Animate the pulsing effect (scaling and fading)
    gsap.to(pulsingCircle.scale, {
        duration: 2,
        x: 2.5,  // Pulsing scale factor
        y: 2.5,  // Pulsing scale factor
        repeat: -1,
        yoyo: false,  // Pulsating effect
        ease: "power1.inOut"
    });

    // Animate the opacity to fade in and out
    gsap.to(pulsingMaterial, {
        duration: 2,
        opacity: 0,  // Reduced opacity for fade effect
        repeat: -1,
        yoyo: false,  // Fading effect
        ease: "power1.inOut"
    });

    return { staticCircle, pulsingCircle };
}




function createElevatedArcs(startPoint, endPoints, heightAboveGlobe, liftFactor = 1.015) {
    startPoint.normalize();
    const liftedStartPoint = startPoint.clone().multiplyScalar(liftFactor);
    
    const arcs = [];
    let colorToggle = false;


    endPoints.forEach(endPoint => {
        endPoint.normalize();
        const liftedEndPoint = endPoint.clone().multiplyScalar(liftFactor);
        const points = [];
        const numPoints = 250;

        // Generate arc points
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const point = new THREE.Vector3().lerpVectors(liftedStartPoint, liftedEndPoint, t);
            const elevation = ((1 - t) * t) * 4 * heightAboveGlobe;
            const pointAboveGlobe = point.normalize().multiplyScalar(point.length() + elevation);
            points.push(pointAboveGlobe);
        }

        // Create shader material for thicker arcs
        const vertexShader = `
            varying vec3 vPosition;
            void main() {
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 3.5;
            }
        `;

        const fragmentShader = `
            varying vec3 vPosition;
            uniform vec3 uColor; // Add color uniform
            void main() {
                float thickness = 0.1; 
                float alpha = smoothstep(0.0, thickness, length(gl_PointCoord - 0.5));
                gl_FragColor = vec4(uColor, alpha); // Use the color uniform
            }
        `;

        const arcMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uColor: { value: new THREE.Color(0x7ED348) }, // Color for the first arc
            },
            transparent: true,
        });

        const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const arcMesh = new THREE.Points(arcGeometry, arcMaterial);
        scene.add(arcMesh);
        arcs.push(arcMesh);

        // Animation function
        function animateArc() {
            let drawRange = 0;
            const totalPoints = points.length;

            const drawAnimation = () => {
                if (drawRange < totalPoints) {
                    arcMesh.geometry.setDrawRange(0, drawRange);
                    drawRange++;
                    requestAnimationFrame(drawAnimation);
                } else {
                    drawOverArc(points);
                }
            };
            drawAnimation();
        }

        // Function to draw a second arc with different color
        function drawOverArc(points) {
            const secondArcMaterial = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uColor: { value: new THREE.Color(colorToggle ? 0xf0f0f0 : 0x7ED348) }, // Toggle color for the second arc
                },
                transparent: true,
            });

            const secondArcMesh = new THREE.Points(arcGeometry.clone(), secondArcMaterial);
            scene.add(secondArcMesh);
            colorToggle = !colorToggle;

            let drawRange = 0;
            const drawAnimation = () => {
                if (drawRange < points.length) {
                    secondArcMesh.geometry.setDrawRange(0, drawRange);
                    drawRange++;
                    requestAnimationFrame(drawAnimation);
                } else {
                    animateArc(); // Restart the animation
                }
            };
            drawAnimation();
        }

        animateArc(); // Start the initial animation
        createStaticAndPulsingCircles(liftedEndPoint);
    });

    const startCircles = createStaticAndPulsingCircles(liftedStartPoint);
    return { arcs, startCircles };
}






// Usage with multiple endpoints
const point1 = new THREE.Vector3(-0.145, 0.32, 0.6265); // Start point on the globe
const endPoints = [
    new THREE.Vector3(0, 1, 5), // First endpoint
    new THREE.Vector3(2, 1, 6), // Second endpoint
    new THREE.Vector3(3, 1, 4), // Third endpoint
    
    // Add more endpoints as needed
];

const heightAboveGlobe = 0.3; // Height of the arcs above the globe

// Function to handle intersection
function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Set a delay before executing the arc creation
            setTimeout(() => {
                createElevatedArcs(point1, endPoints, heightAboveGlobe);
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
observer.observe(target);
