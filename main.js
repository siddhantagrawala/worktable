/* ===========================================
   WORK TABLE — ENHANCED 3D Interactive Experience
   Three.js + GSAP + Post-Processing
   Compete with best Three.js websites
   =========================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';

// ============================================
// CONSTANTS
// ============================================
const BRAND = {
    bg: 0x0f0f0f,
    copper: 0xc17f59,
    copperLight: 0xe8a87c,
    glass: 0x88ccee,
    concrete: 0x2a2a2a,
    white: 0xffffff,
    floor: 0x1e1e1e,
    ground: 0x141414,
    accent: 0xc17f59,
};

const BUILDING = {
    floors: 10, // G + 9
    floorHeight: 3,
    width: 30,
    depth: 16,
    gap: 0.15,
    windowRows: 4,
    windowCols: 8,
};

const FLOOR_DATA = [
    { name: 'Ground Floor', type: 'Lobby & Reception', seats: 0, image: '/assets/reception-wide.jpeg', available: false, desc: 'Grand entrance with reception desk, visitor lounge, and security. First impression zone.', color: 0x444444 },
    { name: 'Floor 1', type: 'Open Workspace', seats: 80, image: '/assets/lounge.jpeg', available: true, desc: '20 Open Desks, 6 Cabins (4-seater), 9 Manager Cabins. Meeting & Conference rooms included.', color: 0x4ECDC4 },
    { name: 'Floor 2', type: 'Open Workspace', seats: 80, image: '/assets/cabin-3.jpeg', available: true, desc: '20 Open Desks, 6 Cabins (4-seater), 9 Manager Cabins. Meeting & Conference rooms included.', color: 0x4ECDC4 },
    { name: 'Floor 3', type: 'Open Workspace', seats: 80, image: '/assets/pantry.jpeg', available: true, desc: '20 Open Desks, 6 Cabins (4-seater), 9 Manager Cabins. Pantry & lounge area on this floor.', color: 0x4ECDC4 },
    { name: 'Floor 4', type: 'Premium Workspace', seats: 80, image: '/assets/conference-b-1.jpeg', available: true, desc: 'Premium floor — 14,023 sqft offered. 20 Open Desks, 6 Cabins, Conference Room B.', color: 0xc17f59 },
    { name: 'Floor 5', type: 'Premium Workspace', seats: 80, image: '/assets/conference-b-2.jpeg', available: true, desc: 'Premium floor — 14,023 sqft offered. 20 Open Desks, 6 Cabins, Conference Room B.', color: 0xc17f59 },
    { name: 'Floor 6', type: 'Open Workspace', seats: 80, image: '/assets/reception-desk.jpeg', available: true, desc: '20 Open Desks, 6 Cabins (4-seater), 9 Manager Cabins. Top bookable floor.', color: 0x4ECDC4 },
    { name: 'Floor 7', type: 'Corporate', seats: 80, image: '/assets/lounge.jpeg', available: false, desc: 'Reserved corporate floor. Contact for enterprise leasing.', color: 0x666666 },
    { name: 'Floor 8', type: 'Corporate', seats: 80, image: '/assets/cabin-3.jpeg', available: false, desc: 'Reserved corporate floor. Contact for enterprise leasing.', color: 0x666666 },
    { name: 'Floor 9', type: 'Executive', seats: 76, image: '/assets/conference-b-1.jpeg', available: false, desc: 'Top floor executive suites with panoramic views. Premium leasing only.', color: 0x888888 },
];

// Camera presets for different views
const CAMERA_PRESETS = {
    overview: { position: { x: 45, y: 25, z: 45 }, target: { x: 0, y: 15, z: 0 } },
    front: { position: { x: 0, y: 18, z: 60 }, target: { x: 0, y: 18, z: 0 } },
    side: { position: { x: 60, y: 18, z: 0 }, target: { x: 0, y: 18, z: 0 } },
    top: { position: { x: 0, y: 70, z: 0 }, target: { x: 0, y: 0, z: 0 } },
    aerial: { position: { x: 35, y: 45, z: 35 }, target: { x: 0, y: 0, z: 0 } },
};

// ============================================
// SCENE SETUP
// ============================================
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(BRAND.bg);
scene.fog = new THREE.FogExp2(BRAND.bg, 0.012);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(45, 25, 45);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 120;
controls.maxPolarAngle = Math.PI / 2.1;
controls.target.set(0, 15, 0);
controls.autoRotate = false;
controls.autoRotateSpeed = 0.5;

// ============================================
// POST-PROCESSING SETUP
// ============================================
const composer = new EffectComposer(renderer);

// Render pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass for glowing effects
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,    // strength
    0.6,    // radius
    0.3     // threshold
);
composer.addPass(bloomPass);

// Output pass
const outputPass = new OutputPass();
composer.addPass(outputPass);

// ============================================
// LIGHTING — ENHANCED
// ============================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Hemisphere light for sky simulation
const hemiLight = new THREE.HemisphereLight(0x88ccff, 0x2a2a2a, 0.3);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
dirLight.position.set(30, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 150;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
fillLight.position.set(-20, 20, -30);
scene.add(fillLight);

// Copper accent spot lights on building
const spotL = new THREE.SpotLight(BRAND.copper, 2, 80, Math.PI / 6, 0.5);
spotL.position.set(-25, 35, 0);
spotL.target.position.set(0, 15, 0);
scene.add(spotL, spotL.target);

const spotR = new THREE.SpotLight(BRAND.copperLight, 1.5, 80, Math.PI / 6, 0.5);
spotR.position.set(25, 5, 25);
spotR.target.position.set(0, 15, 0);
scene.add(spotR, spotR.target);

// ============================================
// GROUND PLANE + SURROUNDINGS
// ============================================
const groundGeo = new THREE.PlaneGeometry(300, 300);
const groundMat = new THREE.MeshStandardMaterial({
    color: BRAND.ground,
    roughness: 0.95,
    metalness: 0.0,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper for context
const gridHelper = new THREE.GridHelper(200, 40, 0x222222, 0x1a1a1a);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// ============================================
// PROCEDURAL BUILDING GENERATOR — ENHANCED
// ============================================
const buildingGroup = new THREE.Group();
const floorMeshes = []; // for raycasting
const floorHighlights = []; // for hover effects

function createBuilding() {
    const { floors, floorHeight, width, depth, gap } = BUILDING;

    for (let i = 0; i < floors; i++) {
        const floorGroup = new THREE.Group();
        const y = i * (floorHeight + gap);
        const floorData = FLOOR_DATA[i];

        // --- Floor slab ---
        const slabGeo = new THREE.BoxGeometry(width + 1, 0.4, depth + 1);
        const slabMat = new THREE.MeshStandardMaterial({
            color: BRAND.concrete,
            roughness: 0.8,
            metalness: 0.1,
        });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.y = y;
        slab.castShadow = true;
        slab.receiveShadow = true;
        floorGroup.add(slab);

        // --- Glass curtain walls (front + back) with emissive windows ---
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: BRAND.glass,
            transparent: true,
            opacity: 0.25,
            roughness: 0.05,
            metalness: 0.3,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
            transmission: 0.4,
            envMapIntensity: 1.5,
        });

        // Front glass wall
        const frontGlassGeo = new THREE.BoxGeometry(width, floorHeight - 0.5, 0.15);
        const frontGlass = new THREE.Mesh(frontGlassGeo, glassMat);
        frontGlass.position.set(0, y + floorHeight / 2 + 0.2, depth / 2);
        frontGlass.castShadow = false;
        floorGroup.add(frontGlass);

        // Back glass wall
        const backGlass = new THREE.Mesh(frontGlassGeo, glassMat.clone());
        backGlass.position.set(0, y + floorHeight / 2 + 0.2, -depth / 2);
        floorGroup.add(backGlass);

        // --- Emissive windows (glowing) ---
        if (i > 0) {
            const windowMat = new THREE.MeshStandardMaterial({
                color: floorData.color,
                emissive: floorData.color,
                emissiveIntensity: floorData.available ? 0.3 : 0.1,
                roughness: 0.3,
                metalness: 0.2,
            });

            const windowsPerRow = 8;
            const windowWidth = 2.5;
            const windowHeight = 1.2;
            const windowGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.05);

            for (let w = 0; w < windowsPerRow; w++) {
                const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                const xPos = -width / 2 + 3 + w * 3.5;
                windowMesh.position.set(xPos, y + floorHeight / 2 + 0.2, depth / 2 + 0.12);
                floorGroup.add(windowMesh);
            }
        }

        // Side walls (solid with windows)
        const sideGeo = new THREE.BoxGeometry(0.3, floorHeight - 0.5, depth);
        const sideMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.15,
        });
        const leftWall = new THREE.Mesh(sideGeo, sideMat);
        leftWall.position.set(-width / 2, y + floorHeight / 2 + 0.2, 0);
        leftWall.castShadow = true;
        floorGroup.add(leftWall);

        const rightWall = new THREE.Mesh(sideGeo, sideMat.clone());
        rightWall.position.set(width / 2, y + floorHeight / 2 + 0.2, 0);
        rightWall.castShadow = true;
        floorGroup.add(rightWall);

        // --- Window mullions (vertical strips on front) ---
        const mullionMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.5,
            metalness: 0.5,
        });
        const mullionCols = 10;
        for (let c = 0; c <= mullionCols; c++) {
            const mullionGeo = new THREE.BoxGeometry(0.08, floorHeight - 0.5, 0.08);
            const mullion = new THREE.Mesh(mullionGeo, mullionMat);
            const x = -width / 2 + (c / mullionCols) * width;
            mullion.position.set(x, y + floorHeight / 2 + 0.2, depth / 2 + 0.08);
            floorGroup.add(mullion);
        }

        // --- Copper accent strip on floors 4 & 5 (premium) ---
        if (i === 4 || i === 5) {
            const accentGeo = new THREE.BoxGeometry(width + 1.2, 0.15, depth + 1.2);
            const accentMat = new THREE.MeshStandardMaterial({
                color: BRAND.copper,
                roughness: 0.3,
                metalness: 0.7,
                emissive: BRAND.copper,
                emissiveIntensity: 0.3,
            });
            const accent = new THREE.Mesh(accentGeo, accentMat);
            accent.position.y = y + 0.25;
            floorGroup.add(accent);
        }

        // --- Floor highlight outline (invisible by default) ---
        const outlineGeo = new THREE.BoxGeometry(width + 1.5, floorHeight, depth + 1.5);
        const outlineMat = new THREE.MeshBasicMaterial({
            color: floorData.color,
            transparent: true,
            opacity: 0,
            wireframe: true,
            wireframeLinewidth: 2,
        });
        const outline = new THREE.Mesh(outlineGeo, outlineMat);
        outline.position.set(0, y + floorHeight / 2 + 0.2, 0);
        floorGroup.add(outline);
        floorHighlights[i] = outline;

        // --- Interior hint: colored blocks for rooms ---
        if (i > 0) {
            // Reception/cabin blocks
            const roomGeo = new THREE.BoxGeometry(4, 2.2, 4);
            const roomMat = new THREE.MeshStandardMaterial({
                color: i <= 6 ? 0x3a3a3a : 0x2e2e2e,
                roughness: 0.8,
            });

            // Left side cabins
            for (let r = 0; r < 3; r++) {
                const room = new THREE.Mesh(roomGeo, roomMat);
                room.position.set(-width / 2 + 3 + r * 5, y + 1.5, -depth / 2 + 3);
                room.castShadow = true;
                floorGroup.add(room);
            }

            // Conference room (right side)
            const confGeo = new THREE.BoxGeometry(8, 2.2, 6);
            const confMat = new THREE.MeshStandardMaterial({
                color: 0x3d3d3d,
                roughness: 0.6,
            });
            const conf = new THREE.Mesh(confGeo, confMat);
            conf.position.set(width / 2 - 5, y + 1.5, -depth / 2 + 4);
            conf.castShadow = true;
            floorGroup.add(conf);
        }

        // --- Clickable floor plate (invisible for raycasting) ---
        const clickGeo = new THREE.BoxGeometry(width, floorHeight, depth);
        const clickMat = new THREE.MeshBasicMaterial({ visible: false });
        const clickMesh = new THREE.Mesh(clickGeo, clickMat);
        clickMesh.position.set(0, y + floorHeight / 2 + 0.2, 0);
        clickMesh.userData = { floorIndex: i, ...FLOOR_DATA[i] };
        floorGroup.add(clickMesh);
        floorMeshes.push(clickMesh);

        buildingGroup.add(floorGroup);
    }

    // --- Roof slab ---
    const roofGeo = new THREE.BoxGeometry(width + 2, 0.5, depth + 2);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = BUILDING.floors * (BUILDING.floorHeight + BUILDING.gap) + 0.25;
    roof.castShadow = true;
    buildingGroup.add(roof);

    // --- WORK TABLE signage on roof (glowing) ---
    const signGeo = new THREE.BoxGeometry(12, 1.5, 0.3);
    const signMat = new THREE.MeshStandardMaterial({
        color: BRAND.copper,
        emissive: BRAND.copper,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.6,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, BUILDING.floors * (BUILDING.floorHeight + BUILDING.gap) + 1.5, depth / 2 + 0.5);
    buildingGroup.add(sign);

    // --- Building entrance canopy ---
    const canopyGeo = new THREE.BoxGeometry(12, 0.3, 5);
    const canopyMat = new THREE.MeshStandardMaterial({
        color: BRAND.copper,
        roughness: 0.3,
        metalness: 0.6,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 3.5, depth / 2 + 2.5);
    canopy.castShadow = true;
    buildingGroup.add(canopy);

    scene.add(buildingGroup);
}

// ============================================
// SURROUNDING CONTEXT BUILDINGS
// ============================================
function createSurroundings() {
    const contextMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0.0,
    });

    const positions = [
        { x: -50, z: -30, w: 15, h: 20, d: 12 },
        { x: -50, z: 20, w: 12, h: 15, d: 10 },
        { x: 50, z: -20, w: 18, h: 25, d: 14 },
        { x: 50, z: 25, w: 10, h: 12, d: 10 },
        { x: -30, z: -50, w: 20, h: 18, d: 15 },
        { x: 30, z: -50, w: 14, h: 22, d: 12 },
        { x: 0, z: -55, w: 10, h: 10, d: 10 },
        { x: -55, z: 0, w: 12, h: 8, d: 20 },
        { x: 55, z: 0, w: 16, h: 30, d: 10 },
    ];

    positions.forEach(p => {
        const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
        const mesh = new THREE.Mesh(geo, contextMat);
        mesh.position.set(p.x, p.h / 2, p.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
    });

    // Road strips
    const roadMat = new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        roughness: 0.95,
    });
    const road1Geo = new THREE.BoxGeometry(300, 0.05, 10);
    const road1 = new THREE.Mesh(road1Geo, roadMat);
    road1.position.set(0, 0.03, BUILDING.depth / 2 + 10);
    scene.add(road1);

    const road2Geo = new THREE.BoxGeometry(10, 0.05, 300);
    const road2 = new THREE.Mesh(road2Geo, roadMat);
    road2.position.set(-BUILDING.width / 2 - 10, 0.03, 0);
    scene.add(road2);

    // Lane markings
    const markMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a });
    for (let i = -10; i <= 10; i++) {
        const markGeo = new THREE.BoxGeometry(3, 0.06, 0.2);
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.position.set(i * 12, 0.06, BUILDING.depth / 2 + 10);
        scene.add(mark);
    }
}

// ============================================
// RAYCASTER — Enhanced Floor Interaction
// ============================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredFloor = null;

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Check hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(floorMeshes);

    // Reset all highlights
    floorHighlights.forEach(h => {
        if (h) h.material.opacity = 0;
    });

    if (intersects.length > 0) {
        const floorIndex = intersects[0].object.userData.floorIndex;
        if (floorHighlights[floorIndex]) {
            floorHighlights[floorIndex].material.opacity = 0.3;
            canvas.style.cursor = 'pointer';
        }
        hoveredFloor = floorIndex;
    } else {
        canvas.style.cursor = 'default';
        hoveredFloor = null;
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(floorMeshes);

    if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        showFloorModal(data);
        zoomToFloor(data.floorIndex);
    }
}

canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('click', onClick);

// ============================================
// CAMERA ANIMATIONS — Smooth Transitions
// ============================================
function moveCameraTo(preset, duration = 2) {
    const pos = CAMERA_PRESETS[preset].position;
    const target = CAMERA_PRESETS[preset].target;

    gsap.to(camera.position, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: duration,
        ease: 'power2.inOut',
    });

    gsap.to(controls.target, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: duration,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
    });
}

function zoomToFloor(floorIndex) {
    const y = floorIndex * (BUILDING.floorHeight + BUILDING.gap);
    const targetPos = { x: 0, y: y + BUILDING.floorHeight / 2, z: 0 };
    const cameraPos = { x: 35, y: y + BUILDING.floorHeight / 2, z: 35 };

    gsap.to(camera.position, {
        x: cameraPos.x,
        y: cameraPos.y,
        z: cameraPos.z,
        duration: 1.5,
        ease: 'power2.inOut',
    });

    gsap.to(controls.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => controls.update(),
    });
}

// ============================================
// FLOOR MODAL
// ============================================
const floorModal = document.getElementById('floorModal');
const modalClose = document.getElementById('modalClose');

function showFloorModal(data) {
    document.getElementById('modalTitle').textContent = data.name;
    document.getElementById('modalBadge').textContent = data.available ? 'Available' : 'Reserved';
    document.getElementById('modalBadge').style.background = data.available ? '#4ECDC4' : '#666';

    const modalImage = document.getElementById('modalImage');
    modalImage.innerHTML = `<img src="${data.image}" alt="${data.name}" style="width:100%; border-radius:8px; margin-bottom:1rem;">`;

    const modalGrid = document.getElementById('modalGrid');
    modalGrid.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
            <div style="text-align:center; padding:1rem; background:rgba(255,255,255,0.03); border-radius:8px;">
                <div style="font-size:2rem; color:#c17f59; font-weight:600;">${data.seats}</div>
                <div style="font-size:0.8rem; color:#888;">Total Seats</div>
            </div>
            <div style="text-align:center; padding:1rem; background:rgba(255,255,255,0.03); border-radius:8px;">
                <div style="font-size:2rem; color:#4ECDC4; font-weight:600;">${data.type}</div>
                <div style="font-size:0.8rem; color:#888;">Type</div>
            </div>
        </div>
    `;

    document.getElementById('modalDesc').textContent = data.desc;
    floorModal.classList.remove('hidden');
}

modalClose.addEventListener('click', () => {
    floorModal.classList.add('hidden');
});

// ============================================
// GUIDED TOUR
// ============================================
let tourRunning = false;

document.getElementById('tourBtn')?.addEventListener('click', startGuidedTour);

async function startGuidedTour() {
    if (tourRunning) return;
    tourRunning = true;
    controls.enabled = false;

    const steps = [
        { preset: 'overview', duration: 3, info: 'Welcome to WORK TABLE — A Coworking Community' },
        { preset: 'front', duration: 2, info: '816 seats across 10 floors in Sector-135, Noida' },
        { preset: 'aerial', duration: 2, info: 'Strategically located on the Noida Expressway' },
        { preset: 'side', duration: 2, info: 'Premium glass facade with copper accents' },
        { preset: 'overview', duration: 2, info: 'Explore floors by clicking on them' },
    ];

    for (const step of steps) {
        moveCameraTo(step.preset, step.duration);
        updateInfoPanel(step.info);
        await new Promise(resolve => setTimeout(resolve, step.duration * 1000 + 500));
    }

    controls.enabled = true;
    tourRunning = false;
}

function updateInfoPanel(text) {
    const subtitle = document.getElementById('infoPanelSubtitle');
    if (subtitle) subtitle.textContent = text;
}

// ============================================
// URL-BASED DEEP LINKING
// ============================================
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const floorParam = urlParams.get('floor');

    if (floorParam) {
        const floorIndex = parseInt(floorParam);
        if (floorIndex >= 0 && floorIndex < FLOOR_DATA.length) {
            setTimeout(() => {
                zoomToFloor(floorIndex);
                showFloorModal(FLOOR_DATA[floorIndex]);
            }, 1000);
        }
    }
}

// ============================================
// LOADING MANAGER
// ============================================
const loadingManager = new THREE.LoadingManager();
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const loaderPct = document.getElementById('loaderPct');

loadingManager.onProgress = (url, loaded, total) => {
    const progress = (loaded / total) * 100;
    if (loaderBar) loaderBar.style.width = progress + '%';
    if (loaderPct) loaderPct.textContent = `Loading 3D Experience... ${Math.round(progress)}%`;
};

loadingManager.onLoad = () => {
    setTimeout(() => {
        if (loader) loader.style.opacity = '0';
        setTimeout(() => {
            if (loader) loader.style.display = 'none';
        }, 500);
    }, 500);
};

// ============================================
// NAVIGATION SECTION SWITCHING
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = {
    overview: () => moveCameraTo('overview'),
    floors: () => moveCameraTo('front'),
    spaces: () => moveCameraTo('side'),
    pricing: () => document.getElementById('pricingPanel')?.classList.toggle('hidden'),
    contact: () => document.getElementById('contactPanel')?.classList.toggle('hidden'),
};

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const section = link.dataset.section;
        if (sections[section]) sections[section]();
    });
});

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render(); // Use composer instead of renderer
}

// ============================================
// WINDOW RESIZE
// ============================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================
// INITIALIZE
// ============================================
createBuilding();
createSurroundings();
handleURLParams();
animate();

// Hide loading screen after initialization (fallback since no assets use loadingManager)
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}, 1000);

console.log('%c✨ WORK TABLE 3D Experience Loaded', 'font-size:16px; color:#c17f59; font-weight:bold;');
console.log('%cEnhanced with Post-Processing | Bloom Effects | Advanced Interactions', 'color:#4ECDC4;');
