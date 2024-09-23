import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { Line2 } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/lines/LineGeometry.js';




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
    //controls.enableRotate = false;  // Disable manual rotation
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
    //controls.domElement.style.pointerEvents = 'none';
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
        
        // Use a very light teal with more blue
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

    globeMesh = new THREE.Mesh(
        globeGeometry,
        new THREE.MeshBasicMaterial({
            color: 0x01377D,
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
        opacity: 1,  // Static circle opacity
        side: THREE.DoubleSide,
        depthWrite: true
    });
    const staticCircle = new THREE.Mesh(staticGeometry, staticMaterial);

    // Align the static circle to the globe's surface with elevation
    alignCircleToSurface(staticCircle, position, elevation);

    // Add static circle to the scene
    scene.add(staticCircle);

    // Create the pulsing circle
    const pulsingGeometry = new THREE.CircleGeometry(0.027, 32);
    const pulsingMaterial = new THREE.MeshBasicMaterial({
        color: 0x01377D,
        transparent: true,
        opacity: 1,  // Initial opacity for pulsing effect
        side: THREE.DoubleSide,
        depthWrite: false,  // Disable writing to the depth buffer
        depthTest: false    // Disable depth testing
    });
    const pulsingCircle = new THREE.Mesh(pulsingGeometry, pulsingMaterial);

    // Align the pulsing circle to the globe's surface with elevation
    alignCircleToSurface(pulsingCircle, position, elevation);

    // Adjust the position of the pulsing circle slightly below the static circle
    pulsingCircle.position.z -= 0.003; // Adjust this value as needed

    // Add pulsing circle to the scene
    scene.add(pulsingCircle);

    // Animate the pulsing effect (scaling and fading)
    gsap.to(pulsingCircle.scale, {
        duration: 2,
        x: 1.75,  // Pulsing scale factor
        y: 1.75,  // Pulsing scale factor
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


// Create elevated arcs with short pulse animation
function createElevatedArcs(startPoint, endPoints, heightAboveGlobe, liftFactor = 1.025) {
    startPoint.normalize();
    const liftedStartPoint = startPoint.clone().multiplyScalar(liftFactor);
    const arcs = [];

    endPoints.forEach(endPoint => {
        endPoint.normalize();
        const liftedEndPoint = endPoint.clone().multiplyScalar(liftFactor);
        
        const points = [];
        const numPoints = 250;

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;

            // Interpolate between start and end points
            const point = new THREE.Vector3().lerpVectors(liftedStartPoint, liftedEndPoint, t);

            // Use a sine function for smooth elevation
            const elevationFactor = Math.sin(t * Math.PI); // Smooth rise and fall
            const elevation = elevationFactor * heightAboveGlobe;

            const pointAboveGlobe = point.multiplyScalar(1 + elevation / point.length());
            points.push(pointAboveGlobe);
        }

        const positions = [];
        points.forEach(p => positions.push(p.x, p.y, p.z));

        const arcGeometry = new LineGeometry();
        arcGeometry.setPositions(positions);

        const arcMaterial = new LineMaterial({
            color: 0x01377D,
            linewidth: 0.8,
            transparent: true,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
        });

        const arcLine = new Line2(arcGeometry, arcMaterial);
        scene.add(arcLine);
        arcs.push(arcLine);
        
        createStaticAndPulsingCircles(liftedEndPoint);
    });

    animateGradientPulse(arcs);
    const startCircles = createStaticAndPulsingCircles(liftedStartPoint);
    return { arcs, startCircles };
}


// Function to animate gradient pulse using GSAP
function animateGradientPulse(arcs) {
    arcs.forEach(arc => {
        gsap.to(arc.material.color, {
            r: 0.494, g: 0.829, b: 0.282, // Green color
            duration: 0.75, // Shorter duration for quicker pulse
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut",
            onUpdate: function() {
                arc.material.color.set(`rgb(${Math.floor(arc.material.color.r * 255)}, ${Math.floor(arc.material.color.g * 255)}, ${Math.floor(arc.material.color.b * 255)})`);
            }
        });
    });
}



function latLonToVector3(lat, lon, radius = 1) {
    // Adjust the longitude by 180 degrees to handle the antipodal point issue
    lon = lon + 180;
    if (lon > 180) lon = lon - 360; // Keep longitude within [-180, 180] range

    const phi = (90 - lat) * (Math.PI / 180);  // Latitude to radians
    const theta = (lon + 180) * (Math.PI / 180);  // Longitude to radians

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}



const point1 = latLonToVector3(28.6139, 77.2090); // New Delhi (latitude, longitude)
const endPoints = [
    latLonToVector3(53.3498, -6.2603),  // Dublin, Ireland
    latLonToVector3(51.5074, -0.1278),  // London, UK
    latLonToVector3(46.8182, 8.2275),   // Switzerland
    latLonToVector3(25.276987, 55.296249), // Dubai
    latLonToVector3(-37.8136, 144.9631),   // Melbourne
    latLonToVector3(-31.9505, 115.8605),   // Perth
    latLonToVector3(40.7128, -74.0060),  // New York, USA
    latLonToVector3(34.0522, -118.2437), // California, USA
    latLonToVector3(61.3707, -152.4040), // Alaska, USA
    latLonToVector3(49.2827, -123.1207), // Manitoba, Canada
    latLonToVector3(-22.9068, -43.1729), // Rio de Janeiro, Brazil
    latLonToVector3(3.4372, -76.5226),   // Cali, Colombia
    latLonToVector3(-33.9189, 18.4233),  // Cape Town, South Africa
    latLonToVector3(30.0444, 31.2357),   // Cairo, Egypt
    latLonToVector3(-41.2865, 174.7762), // Wellington, NZ
];


const heightAboveGlobe = 0.5; // Height of the arcs above the globe


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
