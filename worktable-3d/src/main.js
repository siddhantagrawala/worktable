import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

// ===========================================
// WORK TABLE 3D EXPERIENCE - ENHANCED
// ===========================================

// Global variables
let scene, camera, renderer, controls;
let floors = [];
let raycaster, mouse;
let isTourActive = false;
let loadedCount = 0;
const totalAssets = 10;
let hoveredFloor = null;
let currentFloor = null;
let isTransitioning = false;

// Extended floor data with amenities and pricing
const floorData = [
    {
        id: 0,
        name: 'Ground Floor',
        seats: 0,
        status: 'lobby',
        description: 'Reception & Lobby',
        amenities: ['Reception Desk', 'Waiting Area', 'Security Cabin', 'Lift Lobby'],
        pricing: 'N/A',
        sqft: 2500
    },
    {
        id: 1,
        name: 'Floor 1',
        seats: 80,
        status: 'available',
        description: 'Open Desks + Meeting Rooms',
        amenities: ['Open Desks (20)', 'Meeting Room A (8-seater)', 'Meeting Room B (8-seater)', 'Pantry', 'Phone Booths'],
        pricing: '₹1,500/slot',
        sqft: 14023
    },
    {
        id: 2,
        name: 'Floor 2',
        seats: 80,
        status: 'available',
        description: 'Open Desks + Private Cabins',
        amenities: ['Open Desks (20)', 'Private Cabins (6)', 'Manager Cabins (4)', 'Server Room', 'Pantry'],
        pricing: '₹1,500/slot',
        sqft: 14023
    },
    {
        id: 3,
        name: 'Floor 3',
        seats: 80,
        status: 'available',
        description: 'Manager Cabins + Open Area',
        amenities: ['Manager Cabins (9)', 'Open Desks (15)', 'Discussion Area', 'Print Station', 'Pantry'],
        pricing: '₹1,500/slot',
        sqft: 14023
    },
    {
        id: 4,
        name: 'Floor 4',
        seats: 80,
        status: 'premium',
        description: 'Premium Open Seating',
        amenities: ['Premium Desks', 'Lounge Area', 'Focus Zones', 'Wellness Room', 'Premium Pantry'],
        pricing: '₹2,000/slot',
        sqft: 14023
    },
    {
        id: 5,
        name: 'Floor 5',
        seats: 80,
        status: 'premium',
        description: 'Premium Private Cabins',
        amenities: ['Premium Cabins (10)', 'Executive Lounge', 'Board Room (12-seater)', 'Private Pantry'],
        pricing: '₹2,500/slot',
        sqft: 14023
    },
    {
        id: 6,
        name: 'Floor 6',
        seats: 80,
        status: 'available',
        description: 'Enterprise Solutions',
        amenities: ['Enterprise Desks', 'Training Room', 'Event Space', 'Client Meeting Suite'],
        pricing: '₹1,800/slot',
        sqft: 14023
    },
    {
        id: 7,
        name: 'Floor 7',
        seats: 112,
        status: 'reserved',
        description: 'Corporate Leasing',
        amenities: ['Dedicated Floor Access', 'Private Meeting Rooms', 'Custom Furnishing', '24/7 Access'],
        pricing: '₹80/sqft',
        sqft: 14023
    },
    {
        id: 8,
        name: 'Floor 8',
        seats: 112,
        status: 'reserved',
        description: 'Corporate Leasing',
        amenities: ['Dedicated Floor Access', 'Reception', 'Conference Facility', 'Server Room'],
        pricing: '₹80/sqft',
        sqft: 14023
    },
    {
        id: 9,
        name: 'Floor 9',
        seats: 112,
        status: 'reserved',
        description: 'Executive Floor',
        amenities: ['Executive Suite', 'Board Room', 'Secretarial Support', 'VIP Lounge', 'Terrace Access'],
        pricing: '₹100/sqft',
        sqft: 14023
    }
];

// Glow effect materials cache
const glowMaterials = new Map();

// Initialize everything
init();
animate();
setupKeyboardShortcuts();
createMiniMap();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(40, 35, 40);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('scene'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.target.set(0, 10, 0);

    // Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create the building
    createBuilding();

    // Create environment
    createEnvironment();

    // Create lights
    createLights();

    // Event listeners
    setupEventListeners();

    // Start loading
    simulateLoading();
}

function createBuilding() {
    // Building base/ground
    const groundGeometry = new THREE.BoxGeometry(30, 0.5, 30);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.y = -0.25;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create floors
    const floorHeight = 4;
    const floorWidth = 20;
    const floorDepth = 16;

    for (let i = 0; i < 10; i++) {
        const floor = createFloor(i, floorWidth, floorHeight, floorDepth);
        floor.position.y = i * floorHeight + floorHeight / 2;
        floors.push(floor);
        scene.add(floor);
    }

    // Add glass curtain walls
    createCurtainWalls();

    // Add roof
    createRoof();
}

function createFloor(index, width, height, depth) {
    const group = new THREE.Group();

    // Floor slab
    const slabGeometry = new THREE.BoxGeometry(width, 0.3, depth);
    const slabMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.7,
        metalness: 0.3
    });
    const slab = new THREE.Mesh(slabGeometry, slabMaterial);
    slab.position.y = -height / 2;
    slab.receiveShadow = true;
    slab.castShadow = true;
    group.add(slab);

    // Get floor data
    const data = floorData[index] || { status: 'available' };

    // Floor color based on status
    let floorColor = 0x333333;
    if (data.status === 'available') floorColor = 0x2d4a3d;
    if (data.status === 'premium') floorColor = 0x4a3d2d;
    if (data.status === 'reserved') floorColor = 0x3d2d3d;
    if (data.status === 'lobby') floorColor = 0x3d3d4a;

    // Floor surface
    const surfaceGeometry = new THREE.BoxGeometry(width - 0.5, 0.15, depth - 0.5);
    const surfaceMaterial = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.5,
        metalness: 0.2
    });
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.position.y = -height / 2 + 0.2;
    surface.receiveShadow = true;
    surface.name = 'floorSurface';
    group.add(surface);

    // Create glow material for hover effect
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: floorColor,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0xc17f59,
        emissiveIntensity: 0
    });
    glowMaterials.set(index, glowMaterial);

    // Add seating layout visualization
    if (index > 0 && index < 7) {
        addSeatLayout(group, width, depth, index);
    }

    // Add floor label
    const labelCanvas = createLabelCanvas(`F${index}`);
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true
    });
    const label = new THREE.Sprite(labelMaterial);
    label.scale.set(3, 1.5, 1);
    label.position.set(width / 2 + 2, 0, 0);
    group.add(label);

    // Store floor data for click detection
    group.userData = {
        floorIndex: index,
        floorData: floorData[index]
    };

    return group;
}

function addSeatLayout(floorGroup, width, depth, floorIndex) {
    const seatSize = 0.8;
    const seatGap = 1.2;
    const rows = 4;
    const cols = 8;

    const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0xc17f59,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0xc17f59,
        emissiveIntensity: 0.1
    });

    const startX = -(cols * seatGap) / 2 + seatGap / 2;
    const startZ = -(rows * seatGap) / 2 + seatGap / 2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const seatGeometry = new THREE.BoxGeometry(seatSize, seatSize * 0.8, seatSize);
            const seat = new THREE.Mesh(seatGeometry, seatMaterial.clone());

            seat.position.set(
                startX + col * seatGap,
                -1.5,
                startZ + row * seatGap
            );

            seat.castShadow = true;
            seat.receiveShadow = true;
            seat.name = 'seat';
            floorGroup.add(seat);
        }
    }
}

function createCurtainWalls() {
    const wallMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: 0.3
    });

    const wallGeometry = new THREE.BoxGeometry(20.2, 36, 0.1);

    // Front and back walls
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(0, 18, 8);
    scene.add(frontWall);

    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 18, -8);
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.1, 36, 16.2);
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-10, 18, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(10, 18, 0);
    scene.add(rightWall);
}

function createRoof() {
    const roofGeometry = new THREE.BoxGeometry(22, 0.5, 18);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.3
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 40.25;
    roof.castShadow = true;
    roof.receiveShadow = true;
    scene.add(roof);

    // Roof details - HVAC units
    const hvacGeometry = new THREE.BoxGeometry(2, 1, 2);
    const hvacMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.6,
        metalness: 0.4
    });

    const hvacPositions = [
        { x: -6, z: -5 },
        { x: -2, z: -5 },
        { x: 2, z: -5 },
        { x: 6, z: -5 }
    ];

    hvacPositions.forEach(pos => {
        const hvac = new THREE.Mesh(hvacGeometry, hvacMaterial);
        hvac.position.set(pos.x, 40.75, pos.z);
        hvac.castShadow = true;
        scene.add(hvac);
    });
}

function createEnvironment() {
    // Add subtle grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x222222, 0x151515);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Add distant buildings (decoration)
    addDistantBuildings();

    // Add pathway
    addPathway();
}

function addDistantBuildings() {
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.9,
        metalness: 0.1
    });

    const positions = [
        { x: -50, z: -30, w: 15, h: 25, d: 15 },
        { x: -40, z: 35, w: 12, h: 18, d: 12 },
        { x: 45, z: -25, w: 18, h: 30, d: 14 },
        { x: 55, z: 20, w: 10, h: 20, d: 10 },
        { x: -35, z: 40, w: 14, h: 22, d: 16 },
        { x: 35, z: 45, w: 16, h: 28, d: 12 }
    ];

    positions.forEach(pos => {
        const geo = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
        const mesh = new THREE.Mesh(geo, buildingMaterial);
        mesh.position.set(pos.x, pos.h / 2, pos.z);
        scene.add(mesh);
    });
}

function addPathway() {
    const pathMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.9
    });

    // Main entrance path
    const pathGeometry = new THREE.BoxGeometry(6, 0.1, 15);
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.position.set(0, 0.05, 18);
    path.receiveShadow = true;
    scene.add(path);

    // Parking area markers
    const parkingMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8
    });

    for (let i = -2; i <= 2; i++) {
        const parking = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 5),
            parkingMaterial
        );
        parking.position.set(i * 4, 0.05, 30);
        parking.receiveShadow = true;
        scene.add(parking);
    }
}

function createLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(30, 50, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xc17f59, 0.3);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);

    // Copper accent spotlights
    const copperSpot1 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
    copperSpot1.position.set(-15, 40, 15);
    copperSpot1.target.position.set(0, 0, 0);
    scene.add(copperSpot1);
    scene.add(copperSpot1.target);

    const copperSpot2 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
    copperSpot2.position.set(15, 40, -15);
    copperSpot2.target.position.set(0, 0, 0);
    scene.add(copperSpot2);
    scene.add(copperSpot2.target);
}

function createLabelCanvas(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.roundRect(0, 0, 256, 128, 16);
    ctx.fill();

    ctx.fillStyle = '#c17f59';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    return canvas;
}

// ===========================================
// FLOOR HOVER EFFECTS
// ===========================================

function handleFloorHover() {
    if (isTourActive) return;

    raycaster.setFromCamera(mouse, camera);

    const floorObjects = floors.map(f => f.children).flat();
    const intersects = raycaster.intersectObjects(floorObjects, true);

    let foundFloor = null;

    if (intersects.length > 0) {
        for (const floor of floors) {
            if (intersects.some(i =>
                floor.children.includes(i.object) ||
                i.object.parent === floor ||
                i.object.parent?.parent === floor
            )) {
                foundFloor = floor;
                break;
            }
        }
    }

    // Handle hover state change
    if (foundFloor !== hoveredFloor) {
        // Remove glow from previous floor
        if (hoveredFloor !== null) {
            removeFloorGlow(hoveredFloor);
        }

        // Add glow to new floor
        if (foundFloor !== null && foundFloor.userData.floorIndex > 0) {
            addFloorGlow(foundFloor);
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }

        hoveredFloor = foundFloor;
    }
}

function addFloorGlow(floor) {
    const floorIndex = floor.userData.floorIndex;
    const glowMaterial = glowMaterials.get(floorIndex);

    if (glowMaterial) {
        // Animate glow effect
        gsap.to(glowMaterial, {
            emissiveIntensity: 0.4,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Apply glow material to floor surface
        floor.children.forEach(child => {
            if (child.name === 'floorSurface') {
                child.material = glowMaterial;
            }
        });

        // Also glow the seats
        floor.children.forEach(child => {
            if (child.name === 'seat' && child.material) {
                gsap.to(child.material, {
                    emissiveIntensity: 0.3,
                    duration: 0.3
                });
            }
        });
    }

    // Update mini-map highlight
    updateMiniMapHighlight(floorIndex);
}

function removeFloorGlow(floor) {
    if (!floor) return;

    const floorIndex = floor.userData.floorIndex;
    const glowMaterial = glowMaterials.get(floorIndex);

    if (glowMaterial) {
        // Animate glow removal
        gsap.to(glowMaterial, {
            emissiveIntensity: 0,
            duration: 0.3,
            ease: 'power2.out'
        });
    }

    // Reset seat glow
    floor.children.forEach(child => {
        if (child.name === 'seat' && child.material) {
            gsap.to(child.material, {
                emissiveIntensity: 0.1,
                duration: 0.3
            });
        }
    });

    // Reset mini-map highlight
    updateMiniMapHighlight(-1);
}

// ===========================================
// MINI-MAP
// ===========================================

function createMiniMap() {
    // Create mini-map container
    const miniMapContainer = document.createElement('div');
    miniMapContainer.id = 'miniMap';
    miniMapContainer.innerHTML = `
        <div class="mini-map-header">
            <span class="mini-map-title">FLOOR NAVIGATOR</span>
        </div>
        <div class="mini-map-floors" id="miniMapFloors"></div>
        <div class="mini-map-legend">
            <span class="legend-item"><span class="legend-dot available"></span>Available</span>
            <span class="legend-item"><span class="legend-dot premium"></span>Premium</span>
            <span class="legend-item"><span class="legend-dot reserved"></span>Reserved</span>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #miniMap {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid rgba(193, 127, 89, 0.3);
            border-radius: 12px;
            padding: 15px;
            z-index: 100;
            min-width: 140px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .mini-map-header {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(193, 127, 89, 0.2);
        }

        .mini-map-title {
            font-size: 10px;
            font-weight: 600;
            color: #c17f59;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .mini-map-floors {
            display: flex;
            flex-direction: column-reverse;
            gap: 4px;
            max-height: 280px;
            overflow-y: auto;
        }

        .mini-map-floor {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        .mini-map-floor:hover {
            background: rgba(193, 127, 89, 0.1);
            border-color: rgba(193, 127, 89, 0.3);
        }

        .mini-map-floor.active {
            background: rgba(193, 127, 89, 0.2);
            border-color: #c17f59;
        }

        .mini-map-floor.highlight {
            animation: pulse 1s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(193, 127, 89, 0.4); }
            50% { box-shadow: 0 0 0 4px rgba(193, 127, 89, 0); }
        }

        .mini-map-floor-number {
            font-weight: 600;
            font-size: 12px;
            color: #fff;
        }

        .mini-map-floor-status {
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .mini-map-floor-status.available {
            background: rgba(78, 205, 196, 0.2);
            color: #4ecdc4;
        }

        .mini-map-floor-status.premium {
            background: rgba(193, 127, 89, 0.2);
            color: #e8a87c;
        }

        .mini-map-floor-status.reserved {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
        }

        .mini-map-floor-status.lobby {
            background: rgba(136, 204, 255, 0.2);
            color: #88ccff;
        }

        .mini-map-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid rgba(193, 127, 89, 0.2);
            font-size: 9px;
            color: #666;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .legend-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }

        .legend-dot.available { background: #4ecdc4; }
        .legend-dot.premium { background: #e8a87c; }
        .legend-dot.reserved { background: #ff6b6b; }
    `;

    document.head.appendChild(style);
    document.body.appendChild(miniMapContainer);

    // Generate floor buttons
    const floorsContainer = document.getElementById('miniMapFloors');

    floorData.slice().reverse().forEach(floor => {
        const floorEl = document.createElement('div');
        floorEl.className = 'mini-map-floor';
        floorEl.dataset.floor = floor.id;
        floorEl.innerHTML = `
            <span class="mini-map-floor-number">${floor.name}</span>
            <span class="mini-map-floor-status ${floor.status}">${floor.status === 'lobby' ? 'Lobby' : floor.status}</span>
        `;

        floorEl.addEventListener('click', () => {
            if (!isTransitioning) {
                jumpToFloor(floor.id);
            }
        });

        floorsContainer.appendChild(floorEl);
    });
}

function updateMiniMapHighlight(floorIndex) {
    document.querySelectorAll('.mini-map-floor').forEach(el => {
        el.classList.remove('highlight');
        if (parseInt(el.dataset.floor) === floorIndex) {
            el.classList.add('highlight');
        }
    });
}

function updateMiniMapActive(floorIndex) {
    document.querySelectorAll('.mini-map-floor').forEach(el => {
        el.classList.remove('active');
        if (parseInt(el.dataset.floor) === floorIndex) {
            el.classList.add('active');
        }
    });
}

// ===========================================
// KEYBOARD SHORTCUTS
// ===========================================

function setupKeyboardShortcuts() {
    // Add keyboard shortcut hint to the UI
    const hint = document.createElement('div');
    hint.id = 'keyboardHints';
    hint.innerHTML = `
        <div class="keyboard-hint">
            <span class="key">0-9</span> Jump to floor
            <span class="key">R</span> Reset view
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        #keyboardHints {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 100;
            opacity: 0.6;
            transition: opacity 0.3s;
        }

        #keyboardHints:hover {
            opacity: 1;
        }

        .keyboard-hint {
            font-size: 11px;
            color: #888;
            background: rgba(10, 10, 10, 0.8);
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .key {
            background: rgba(193, 127, 89, 0.2);
            color: #c17f59;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 10px;
            margin: 0 2px;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(hint);

    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyboardInput);
}

function handleKeyboardInput(event) {
    if (isTransitioning) return;

    const key = event.key;

    // Number keys 0-9 to jump to floors
    if (key >= '0' && key <= '9') {
        const floorIndex = parseInt(key);
        jumpToFloor(floorIndex);
    }

    // R key to reset view
    if (key === 'r' || key === 'R') {
        resetView();
    }

    // Escape to close modal
    if (key === 'Escape') {
        closeFloorModal();
    }
}

function jumpToFloor(floorIndex) {
    if (floorIndex < 0 || floorIndex >= floors.length) return;

    isTransitioning = true;
    currentFloor = floorIndex;

    // Update mini-map active state
    updateMiniMapActive(floorIndex);

    // Smooth camera transition to the floor
    const targetY = floorIndex * 4 + 5;

    // Animate camera position
    gsap.to(camera.position, {
        x: 20,
        y: targetY + 3,
        z: 25,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
            isTransitioning = false;
        }
    });

    // Animate controls target
    gsap.to(controls.target, {
        x: 0,
        y: targetY,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut'
    });

    // Show floor info toast
    showFloorToast(floorIndex);
}

function showFloorToast(floorIndex) {
    // Remove existing toast
    const existingToast = document.getElementById('floorToast');
    if (existingToast) {
        existingToast.remove();
    }

    const data = floorData[floorIndex];
    const toast = document.createElement('div');
    toast.id = 'floorToast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-floor">${data.name}</span>
            <span class="toast-desc">${data.description}</span>
            <span class="toast-price">${data.pricing}</span>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        #floorToast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 200;
            pointer-events: none;
            animation: toastIn 0.4s ease, toastOut 0.4s ease 2s forwards;
        }

        @keyframes toastIn {
            from { opacity: 0; transform: translate(-50%, -40%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }

        @keyframes toastOut {
            from { opacity: 1; transform: translate(-50%, -50%); }
            to { opacity: 0; transform: translate(-50%, -60%); }
        }

        .toast-content {
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid rgba(193, 127, 89, 0.5);
            border-radius: 12px;
            padding: 20px 30px;
            text-align: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .toast-floor {
            display: block;
            font-size: 18px;
            font-weight: 700;
            color: #c17f59;
            margin-bottom: 5px;
        }

        .toast-desc {
            display: block;
            font-size: 12px;
            color: #888;
            margin-bottom: 8px;
        }

        .toast-price {
            display: block;
            font-size: 14px;
            font-weight: 600;
            color: #4ecdc4;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Auto-remove after animation
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

function resetView() {
    isTransitioning = true;
    currentFloor = null;

    // Update mini-map
    updateMiniMapActive(-1);

    // Animate back to overview
    gsap.to(camera.position, {
        x: 40,
        y: 35,
        z: 40,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
            isTransitioning = false;
        }
    });

    gsap.to(controls.target, {
        x: 0,
        y: 10,
        z: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    });
}

// ===========================================
// ENHANCED FLOOR MODAL
// ===========================================

function setupEventListeners() {
    // Mouse move for raycasting
    window.addEventListener('mousemove', onMouseMove);

    // Click for floor selection
    window.addEventListener('click', onMouseClick);

    // Resize
    window.addEventListener('resize', onWindowResize);

    // Navigation buttons
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            navigateToSection(section);
        });
    });

    // Tour button
    const tourBtn = document.getElementById('tourBtn');
    if (tourBtn) {
        tourBtn.addEventListener('click', startTour);
    }

    // Guide close button
    const guideClose = document.getElementById('guideClose');
    if (guideClose) {
        guideClose.addEventListener('click', () => {
            document.getElementById('exploreGuide').style.display = 'none';
        });
    }

    // Modal close
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeFloorModal);
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Handle hover effects
    handleFloorHover();
}

function onMouseClick(event) {
    if (isTourActive || isTransitioning) return;

    raycaster.setFromCamera(mouse, camera);

    const floorObjects = floors.map(f => f.children).flat();
    const intersects = raycaster.intersectObjects(floorObjects, true);

    if (intersects.length > 0) {
        // Find which floor was clicked
        let clickedFloor = null;
        for (const floor of floors) {
            if (intersects.some(i => floor.children.includes(i.object) ||
                i.object.parent === floor || i.object.parent?.parent === floor)) {
                clickedFloor = floor;
                break;
            }
        }

        if (clickedFloor && clickedFloor.userData.floorIndex > 0) {
            showFloorModal(clickedFloor.userData.floorIndex);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showFloorModal(floorIndex) {
    const data = floorData[floorIndex];
    if (!data) return;

    const modal = document.getElementById('floorModal');

    // Update modal content
    document.getElementById('modalTitle').textContent = data.name;
    document.getElementById('modalBadge').textContent = data.status.toUpperCase();
    document.getElementById('modalDesc').textContent = data.description;

    // Add enhanced details
    const modalGrid = document.getElementById('modalGrid');
    if (modalGrid) {
        modalGrid.innerHTML = `
            <div class="modal-detail">
                <span class="modal-detail-label">Seats</span>
                <span class="modal-detail-value">${data.seats}</span>
            </div>
            <div class="modal-detail">
                <span class="modal-detail-label">Area</span>
                <span class="modal-detail-value">${data.sqft?.toLocaleString() || 'N/A'} sqft</span>
            </div>
            <div class="modal-detail">
                <span class="modal-detail-label">Pricing</span>
                <span class="modal-detail-value highlight">${data.pricing}</span>
            </div>
        `;
    }

    // Add amenities list
    let amenitiesContainer = document.getElementById('modalAmenities');
    if (!amenitiesContainer) {
        amenitiesContainer = document.createElement('div');
        amenitiesContainer.id = 'modalAmenities';
        amenitiesContainer.className = 'modal-amenities';
        modalGrid?.after(amenitiesContainer);
    }

    if (data.amenities && data.amenities.length > 0) {
        amenitiesContainer.innerHTML = `
            <div class="amenities-title">Amenities & Features</div>
            <div class="amenities-list">
                ${data.amenities.map(amenity => `
                    <span class="amenity-tag">${amenity}</span>
                `).join('')}
            </div>
        `;
    }

    // Add modal styles if not already present
    addModalStyles();

    // Show modal
    modal.classList.remove('hidden');

    // Animate camera to focus on floor
    animateCameraToFloor(floorIndex);
}

function addModalStyles() {
    if (document.getElementById('modalEnhancedStyles')) return;

    const style = document.createElement('style');
    style.id = 'modalEnhancedStyles';
    style.textContent = `
        .floor-modal-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
        }

        .modal-detail {
            text-align: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }

        .modal-detail-label {
            display: block;
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .modal-detail-value {
            display: block;
            font-size: 16px;
            font-weight: 600;
            color: #fff;
        }

        .modal-detail-value.highlight {
            color: #4ecdc4;
        }

        .modal-amenities {
            margin-top: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
        }

        .amenities-title {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }

        .amenities-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .amenity-tag {
            font-size: 11px;
            padding: 6px 10px;
            background: rgba(193, 127, 89, 0.15);
            border: 1px solid rgba(193, 127, 89, 0.3);
            border-radius: 20px;
            color: #e8a87c;
        }

        .floor-modal-desc {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
    `;

    document.head.appendChild(style);
}

function closeFloorModal() {
    document.getElementById('floorModal').classList.add('hidden');
}

function animateCameraToFloor(floorIndex) {
    const targetY = floorIndex * 4 + 5;

    gsap.to(camera.position, {
        x: 20,
        y: targetY + 3,
        z: 25,
        duration: 1.2,
        ease: 'power2.inOut'
    });

    gsap.to(controls.target, {
        x: 0,
        y: targetY,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut'
    });
}

function navigateToSection(section) {
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Hide panels
    const pricingPanel = document.getElementById('pricingPanel');
    const contactPanel = document.getElementById('contactPanel');

    if (pricingPanel) pricingPanel.classList.add('hidden');
    if (contactPanel) contactPanel.classList.add('hidden');

    // Show relevant panel or camera position
    switch (section) {
        case 'overview':
            resetView();
            break;
        case 'floors':
            jumpToFloor(3);
            break;
        case 'spaces':
            jumpToFloor(5);
            break;
        case 'pricing':
            if (pricingPanel) pricingPanel.classList.remove('hidden');
            jumpToFloor(0);
            break;
        case 'contact':
            if (contactPanel) contactPanel.classList.remove('hidden');
            jumpToFloor(0);
            break;
    }
}

function startTour() {
    if (isTourActive || isTransitioning) return;
    isTourActive = true;

    const tourBtn = document.getElementById('tourBtn');
    if (tourBtn) {
        tourBtn.textContent = 'Tour Active...';
        tourBtn.disabled = true;
    }

    // Tour sequence
    const timeline = gsap.timeline({
        onComplete: () => {
            isTourActive = false;
            if (tourBtn) {
                tourBtn.textContent = 'Guided Tour';
                tourBtn.disabled = false;
            }
        }
    });

    // Overview
    timeline.to(camera.position, {
        x: 50, y: 40, z: 50,
        duration: 2,
        ease: 'power2.inOut'
    });

    // Ground floor
    timeline.to(camera.position, {
        x: 20, y: 5, z: 25,
        duration: 2,
        ease: 'power2.inOut'
    });
    timeline.to(controls.target, {
        y: 2, duration: 2
    }, '<');

    // Floor 1
    timeline.to(camera.position, {
        x: 0, y: 8, z: 20,
        duration: 2,
        ease: 'power2.inOut'
    });
    timeline.to(controls.target, {
        y: 4, duration: 2
    }, '<');

    // Floor 4 (Premium)
    timeline.to(camera.position, {
        x: -15, y: 20, z: 15,
        duration: 2,
        ease: 'power2.inOut'
    });
    timeline.to(controls.target, {
        y: 16, duration: 2
    }, '<');

    // Roof view
    timeline.to(camera.position, {
        x: 30, y: 50, z: 30,
        duration: 2,
        ease: 'power2.inOut'
    });
    timeline.to(controls.target, {
        y: 20, duration: 2
    }, '<');

    // Return to overview
    timeline.to(camera.position, {
        x: 40, y: 35, z: 40,
        duration: 2,
        ease: 'power2.inOut'
    });
    timeline.to(controls.target, {
        y: 10, duration: 2
    }, '<');
}

function simulateLoading() {
    const loaderBar = document.getElementById('loaderBar');
    const loaderPct = document.getElementById('loaderPct');
    const loader = document.getElementById('loader');

    if (!loaderBar || !loader) return;

    const interval = setInterval(() => {
        loadedCount++;
        const progress = (loadedCount / totalAssets) * 100;
        loaderBar.style.width = progress + '%';
        if (loaderPct) {
            loaderPct.textContent = `Loading 3D Experience... ${Math.round(progress)}%`;
        }

        if (loadedCount >= totalAssets) {
            clearInterval(interval);
            setTimeout(() => {
                loader.classList.add('done');
                animateCounters();
            }, 500);
        }
    }, 150);
}

function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        gsap.fromTo(el,
            { textContent: 0 },
            {
                textContent: target,
                duration: 2,
                snap: { textContent: 1 },
                ease: 'power2.out'
            }
        );
    });
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    // Subtle floating animation for the building
    const time = Date.now() * 0.001;
    floors.forEach((floor, i) => {
        if (!isTransitioning) {
            floor.position.y = i * 4 + 2 + Math.sin(time + i * 0.5) * 0.05;
        }
    });

    renderer.render(scene, camera);
}
