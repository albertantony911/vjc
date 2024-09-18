import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";

const containerEl = document.querySelector(".globe-wrapper");
const canvas3D = containerEl.querySelector("#globe-3d");

let renderer, scene, camera, rayCaster, controls;
let clock, mouse, pointer, globe, globeMesh;
let earthTexture, mapMaterial;
let dragged = false;

initScene();
window.addEventListener("resize", updateSize);

function initScene() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true });
    renderer.setPixelRatio(2);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1.1, 1.1, 1.1, -1.1, 0, 3);
    camera.position.z = 1.1;

    rayCaster = new THREE.Raycaster();
    rayCaster.far = 1.15;
    mouse = new THREE.Vector2(-1, -1);
    clock = new THREE.Clock();

    createOrbitControls();

    new THREE.TextureLoader().load("./img/map.png", (mapTex) => {
        earthTexture = mapTex;
        earthTexture.repeat.set(1, 1);
        createGlobe();
        createPointer();
        addCanvasEvents();
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
                gl_PointSize = visibility * u_dot_size;
    
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
            u_dot_size: { type: "f", value: 0 },
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

function createPointer() {
    const geometry = new THREE.SphereGeometry(0.04, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00000, 
        transparent: true,
        opacity: 0
    });
    pointer = new THREE.Mesh(geometry, material);
    scene.add(pointer);
}

function addCanvasEvents() {
    containerEl.addEventListener("mousemove", (e) => {
        updateMousePosition(e.clientX, e.clientY);
    });

    containerEl.addEventListener("click", (e) => {
        if (!dragged) {
            updateMousePosition(e.clientX, e.clientY);
            const res = checkIntersects();
            if (res.length) {
                pointer.position.set(
                    res[0].face.normal.x,
                    res[0].face.normal.y,
                    res[0].face.normal.z
                );
                mapMaterial.uniforms.u_pointer.value = res[0].face.normal;
                clock.start();
            }
        }
    });

    function updateMousePosition(eX, eY) {
        mouse.x = ((eX - containerEl.offsetLeft) / containerEl.offsetWidth) * 2 - 1;
        mouse.y = -((eY - containerEl.offsetTop) / containerEl.offsetHeight) * 2 + 1;
    }
} 


function checkIntersects() {
    rayCaster.setFromCamera(mouse, camera);
    return rayCaster.intersectObject(globeMesh);
}

function render() {
    mapMaterial.uniforms.u_time_since_click.value = clock.getElapsedTime();
    checkIntersects();
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

let initialSize;

function updateSize() {
    if (!initialSize) {
        const minSide = Math.min(window.innerWidth, window.innerHeight);
        const isPortrait = window.innerHeight > window.innerWidth;
        initialSize = isPortrait ? 0.8 * minSide : 0.5 * minSide;
        
        // Apply the initial size
        containerEl.style.width = initialSize + "px";
        containerEl.style.height = initialSize + "px";

        // Update the renderer size
        renderer.setSize(initialSize, initialSize);

        // Update the dot size in the shader material
        mapMaterial.uniforms.u_dot_size.value = 0.04 * initialSize;
    }
}


