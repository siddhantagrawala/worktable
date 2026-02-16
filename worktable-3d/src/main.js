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

// Day/Night mode state
let isNightMode = true;
let lights = {};
let skyElements = {};
let environmentObjects = {};
let transitionDuration = 1.5;

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
        sqft: 2500,
        type: 'lobby'
    },
    {
        id: 1,
        name: 'Floor 1',
        seats: 80,
        status: 'available',
        description: 'Open Desks + Meeting Rooms',
        amenities: ['Open Desks (20)', 'Meeting Room A (8-seater)', 'Meeting Room B (8-seater)', 'Pantry', 'Phone Booths'],
        pricing: '₹1,500/slot',
        sqft: 14023,
        type: 'open-plan'
    },
    {
        id: 2,
        name: 'Floor 2',
        seats: 80,
        status: 'available',
        description: 'Open Desks + Private Cabins',
        amenities: ['Open Desks (20)', 'Private Cabins (6)', 'Manager Cabins (4)', 'Server Room', 'Pantry'],
        pricing: '₹1,500/slot',
        sqft: 14023,
        type: 'mixed'
    },
    {
        id: 3,
        name: 'Floor 3',
        seats: 80,
        status: 'available',
        description: 'Manager Cabins + Open Area',
        amenities: ['Manager Cabins (9)', 'Open Desks (15)', 'Discussion Area', 'Print Station', 'Pantry'],
        pricing: '₹1,500/slot',
        sqft: 14023,
        type: 'cabins'
    },
    {
        id: 4,
        name: 'Floor 4',
        seats: 80,
        status: 'premium',
        description: 'Premium Open Seating',
        amenities: ['Premium Desks', 'Lounge Area', 'Focus Zones', 'Wellness Room', 'Premium Pantry'],
        pricing: '₹2,000/slot',
        sqft: 14023,
        type: 'premium-open'
    },
    {
        id: 5,
        name: 'Floor 5',
        seats: 80,
        status: 'premium',
        description: 'Premium Private Cabins',
        amenities: ['Premium Cabins (10)', 'Executive Lounge', 'Board Room (12-seater)', 'Private Pantry'],
        pricing: '₹2,500/slot',
        sqft: 14023,
        type: 'premium-cabins'
    },
    {
        id: 6,
        name: 'Floor 6',
        seats: 80,
        status: 'available',
        description: 'Enterprise Solutions',
        amenities: ['Enterprise Desks', 'Training Room', 'Event Space', 'Client Meeting Suite'],
        pricing: '₹1,800/slot',
        sqft: 14023,
        type: 'enterprise'
    },
    {
        id: 7,
        name: 'Floor 7',
        seats: 112,
        status: 'reserved',
        description: 'Corporate Leasing',
        amenities: ['Dedicated Floor Access', 'Private Meeting Rooms', 'Custom Furnishing', '24/7 Access'],
        pricing: '₹80/sqft',
        sqft: 14023,
        type: 'corporate'
    },
    {
        id: 8,
        name: 'Floor 8',
        seats: 112,
        status: 'reserved',
        description: 'Corporate Leasing',
        amenities: ['Dedicated Floor Access', 'Reception', 'Conference Facility', 'Server Room'],
        pricing: '₹80/sqft',
        sqft: 14023,
        type: 'corporate'
    },
    {
        id: 9,
        name: 'Floor 9',
        seats: 112,
        status: 'reserved',
        description: 'Executive Floor',
        amenities: ['Executive Suite', 'Board Room', 'Secretarial Support', 'VIP Lounge', 'Terrace Access'],
        pricing: '₹100/sqft',
        sqft: 14023,
        type: 'executive'
    }
];

// Glow effect materials cache
const glowMaterials = new Map();

// Initialize everything
init();
animate();
setupKeyboardShortcuts();
createMiniMap();
createDayNightToggle();

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
    const data = floorData[index] || { status: 'available', type: 'open-plan' };

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

    // Add floor-specific interior details based on floor type
    addFloorInteriors(group, width, depth, height, index, data);

    // Add ceiling lights for each floor
    addCeilingLights(group, width, depth, height);

    // Add floor number indicator on exterior
    addFloorNumberIndicator(group, width, depth, height, index);

    // Add pathways between clusters
    addPathways(group, width, depth, height, index, data);

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

// ===========================================
// FLOOR INTERIOR FUNCTIONS
// ===========================================

function addFloorInteriors(floorGroup, width, depth, height, floorIndex, data) {
    switch (data.type) {
        case 'lobby':
            addGroundFloorDetails(floorGroup, width, depth, height);
            break;
        case 'open-plan':
            addOpenPlanLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'mixed':
            addMixedLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'cabins':
            addCabinsLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'premium-open':
            addPremiumOpenLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'premium-cabins':
            addPremiumCabinsLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'enterprise':
            addEnterpriseLayout(floorGroup, width, depth, height, floorIndex);
            break;
        case 'corporate':
        case 'executive':
            addCorporateLayout(floorGroup, width, depth, height, floorIndex);
            break;
        default:
            addOpenPlanLayout(floorGroup, width, depth, height, floorIndex);
    }
}

function addGroundFloorDetails(floorGroup, width, depth, height) {
    // Reception desk
    const receptionDesk = createDesk(4, 0.8, 1.2, 0x2a2a2a);
    receptionDesk.position.set(0, -height / 2 + 0.4, -5);
    floorGroup.add(receptionDesk);

    // Reception chairs (waiting area)
    for (let i = 0; i < 3; i++) {
        const chair = createChair(0xc17f59);
        chair.position.set(-3 + i * 3, -height / 2 + 0.3, -2);
        chair.rotation.y = Math.PI;
        floorGroup.add(chair);
    }

    // Security cabin
    const securityCabin = createCabin(2, 2, 2, 0x1a3a1a);
    securityCabin.position.set(6, -height / 2 + 1, 6);
    floorGroup.add(securityCabin);

    // Lift lobby area markers
    const liftMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d3d3d,
        roughness: 0.7,
        metalness: 0.2
    });
    const liftGeometry = new THREE.BoxGeometry(2, 0.05, 2);
    for (let i = 0; i < 2; i++) {
        const lift = new THREE.Mesh(liftGeometry, liftMaterial);
        lift.position.set(-3 + i * 6, -height / 2 + 0.22, 5);
        floorGroup.add(lift);
    }

    // Pantry area marker
    const pantryMarker = createPantryMarker();
    pantryMarker.position.set(-7, -height / 2 + 0.1, 0);
    floorGroup.add(pantryMarker);
}

function addOpenPlanLayout(floorGroup, width, depth, height, floorIndex) {
    // Add desk clusters with chairs
    const deskColors = [0x8b4513, 0x654321, 0x5c4033, 0x4a3728];
    const chairColors = [0xc17f59, 0xd4916a, 0xb87c52, 0xe8a87c];

    // Create 4 clusters of desks (2x2 layout)
    const clusterPositions = [
        { x: -4, z: -3 },
        { x: 4, z: -3 },
        { x: -4, z: 3 },
        { x: 4, z: 3 }
    ];

    clusterPositions.forEach((pos, clusterIdx) => {
        // Each cluster has 4 desks
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                const desk = createDesk(1.2, 0.7, 0.6, deskColors[(clusterIdx + i + j) % deskColors.length]);
                desk.position.set(
                    pos.x + i * 1.8 - 0.9,
                    -height / 2 + 0.35,
                    pos.z + j * 1.8 - 0.9
                );
                floorGroup.add(desk);

                // Add chair behind desk
                const chair = createChair(chairColors[(clusterIdx + i + j) % chairColors.length]);
                chair.position.set(
                    pos.x + i * 1.8 - 0.9,
                    -height / 2 + 0.3,
                    pos.z + j * 1.8 - 0.9 + 0.8
                );
                floorGroup.add(chair);
            }
        }
    });

    // Add meeting room on this floor
    const meetingRoom = createMeetingRoom(5, 3, 4, 0x2a3a4a);
    meetingRoom.position.set(5, -height / 2 + 1.5, 0);
    floorGroup.add(meetingRoom);

    // Add oval table inside meeting room
    const meetingTable = createOvalTable(3, 0.7, 1.5, 0x4a3d2d);
    meetingTable.position.set(5, -height / 2 + 0.35, 0);
    floorGroup.add(meetingTable);

    // Add chairs around meeting table
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const chair = createChair(0x4ecdc4);
        chair.position.set(
            5 + Math.sin(angle) * 1.2,
            -height / 2 + 0.3,
            Math.cos(angle) * 0.8
        );
        chair.rotation.y = -angle;
        floorGroup.add(chair);
    }

    // Add pantry area
    const pantry = createPantryArea();
    pantry.position.set(-7, -height / 2 + 0.1, 0);
    floorGroup.add(pantry);

    // Add phone booths
    for (let i = 0; i < 2; i++) {
        const booth = createPhoneBooth();
        booth.position.set(-5 + i * 2, -height / 2 + 0.75, -6);
        floorGroup.add(booth);
    }
}

function addMixedLayout(floorGroup, width, depth, height, floorIndex) {
    // Open desks area
    const deskColors = [0x8b4513, 0x654321, 0x5c4033];

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const desk = createDesk(1.2, 0.7, 0.6, deskColors[(row + col) % deskColors.length]);
            desk.position.set(
                -3.5 + col * 2,
                -height / 2 + 0.35,
                -4 + row * 2
            );
            floorGroup.add(desk);

            const chair = createChair(0xc17f59);
            chair.position.set(
                -3.5 + col * 2,
                -height / 2 + 0.3,
                -4 + row * 2 + 0.8
            );
            floorGroup.add(chair);
        }
    }

    // Private cabins (glass-walled rooms)
    const cabinPositions = [
        { x: -5, z: 3 },
        { x: 0, z: 3 },
        { x: 5, z: 3 }
    ];

    cabinPositions.forEach((pos, idx) => {
        const cabin = createCabin(3, 2.5, 3, 0x1a2a3a);
        cabin.position.set(pos.x, -height / 2 + 1.25, pos.z);
        floorGroup.add(cabin);

        // Desk inside cabin
        const cabinDesk = createDesk(1, 0.7, 0.5, 0x3d2d1a);
        cabinDesk.position.set(pos.x, -height / 2 + 0.35, pos.z + 0.5);
        floorGroup.add(cabinDesk);

        const cabinChair = createChair(0xe8a87c);
        cabinChair.position.set(pos.x, -height / 2 + 0.3, pos.z + 1);
        floorGroup.add(cabinChair);
    });

    // Server room
    const serverRoom = createServerRoom();
    serverRoom.position.set(7, -height / 2 + 0.5, -5);
    floorGroup.add(serverRoom);
}

function addCabinsLayout(floorGroup, width, depth, height, floorIndex) {
    // Manager cabins along the sides
    const cabinPositions = [
        { x: -6, z: -4, color: 0x2a3a4a },
        { x: -6, z: 0, color: 0x2a3a4a },
        { x: -6, z: 4, color: 0x2a3a4a },
        { x: 6, z: -4, color: 0x3a2a3a },
        { x: 6, z: 0, color: 0x3a2a3a },
        { x: 6, z: 4, color: 0x3a2a3a }
    ];

    cabinPositions.forEach((pos, idx) => {
        const cabin = createCabin(2.5, 2.2, 2.5, pos.color);
        cabin.position.set(pos.x, -height / 2 + 1.1, pos.z);
        floorGroup.add(cabin);

        // Desk inside cabin
        const desk = createDesk(1, 0.7, 0.5, 0x4a3d2d);
        desk.position.set(pos.x, -height / 2 + 0.35, pos.z + 0.5);
        floorGroup.add(desk);

        const chair = createChair(0xc17f59);
        chair.position.set(pos.x, -height / 2 + 0.3, pos.z + 1);
        floorGroup.add(chair);
    });

    // Open area in center with desks
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
            const desk = createDesk(1.2, 0.7, 0.6, 0x5c4033);
            desk.position.set(-3 + col * 2, -height / 2 + 0.35, -1 + row * 2);
            floorGroup.add(desk);

            const chair = createChair(0xd4916a);
            chair.position.set(-3 + col * 2, -height / 2 + 0.3, -1 + row * 2 + 0.8);
            floorGroup.add(chair);
        }
    }

    // Discussion area
    const discussionTable = createRoundTable(1.5, 0.7, 0x3d4a3d);
    discussionTable.position.set(0, -height / 2 + 0.35, -5);
    floorGroup.add(discussionTable);

    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const chair = createChair(0x4ecdc4);
        chair.position.set(
            Math.sin(angle) * 1,
            -height / 2 + 0.3,
            -5 + Math.cos(angle) * 1
        );
        chair.rotation.y = -angle;
        floorGroup.add(chair);
    }

    // Print station
    const printStation = createPrintStation();
    printStation.position.set(7, -height / 2 + 0.5, 5);
    floorGroup.add(printStation);
}

function addPremiumOpenLayout(floorGroup, width, depth, height, floorIndex) {
    // Premium ergonomic desks with modern chairs
    const premiumColors = [0x2a2a2a, 0x333333, 0x404040];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const desk = createPremiumDesk(1.3, 0.75, 0.7, premiumColors[(row + col) % premiumColors.length]);
            desk.position.set(
                -4.5 + col * 3,
                -height / 2 + 0.375,
                -4.5 + row * 3
            );
            floorGroup.add(desk);

            const chair = createPremiumChair(0xe8a87c);
            chair.position.set(
                -4.5 + col * 3,
                -height / 2 + 0.3,
                -4.5 + row * 3 + 0.9
            );
            floorGroup.add(chair);
        }
    }

    // Lounge area
    const loungeSofa = createLoungeSofa();
    loungeSofa.position.set(6, -height / 2 + 0.25, 0);
    floorGroup.add(loungeSofa);

    // Focus zones (enclosed pods)
    for (let i = 0; i < 2; i++) {
        const focusPod = createFocusPod();
        focusPod.position.set(-6 + i * 4, -height / 2 + 0.5, 5);
        floorGroup.add(focusPod);
    }

    // Wellness room
    const wellnessRoom = createWellnessRoom();
    wellnessRoom.position.set(7, -height / 2 + 0.5, 5);
    floorGroup.add(wellnessRoom);

    // Premium pantry
    const premiumPantry = createPremiumPantry();
    premiumPantry.position.set(-7, -height / 2 + 0.1, -5);
    floorGroup.add(premiumPantry);
}

function addPremiumCabinsLayout(floorGroup, width, depth, height, floorIndex) {
    // Premium private cabins
    const cabinPositions = [
        { x: -5, z: -5, color: 0x2d3a3a },
        { x: 0, z: -5, color: 0x2d3a3a },
        { x: 5, z: -5, color: 0x2d3a3a },
        { x: -5, z: 0, color: 0x3a2d3a },
        { x: 0, z: 0, color: 0x3a2d3a },
        { x: 5, z: 0, color: 0x3a2d3a },
        { x: -5, z: 5, color: 0x3a3a2d },
        { x: 0, z: 5, color: 0x3a3a2d },
        { x: 5, z: 5, color: 0x3a3a2d }
    ];

    cabinPositions.forEach((pos, idx) => {
        const cabin = createPremiumCabin(2.5, 2.5, 2.5, pos.color);
        cabin.position.set(pos.x, -height / 2 + 1.25, pos.z);
        floorGroup.add(cabin);

        const desk = createPremiumDesk(1.1, 0.75, 0.55, 0x1a1a1a);
        desk.position.set(pos.x, -height / 2 + 0.375, pos.z + 0.5);
        floorGroup.add(desk);

        const chair = createExecutiveChair(0xc17f59);
        chair.position.set(pos.x, -height / 2 + 0.3, pos.z + 1);
        floorGroup.add(chair);
    });

    // Executive lounge
    const execLounge = createExecutiveLounge();
    execLounge.position.set(7, -height / 2 + 0.25, 0);
    floorGroup.add(execLounge);

    // Board room
    const boardRoom = createBoardRoom();
    boardRoom.position.set(-7, -height / 2 + 0.5, 0);
    floorGroup.add(boardRoom);

    // Board table
    const boardTable = createOvalTable(5, 0.75, 2, 0x1a1a1a);
    boardTable.position.set(-7, -height / 2 + 0.375, 0);
    floorGroup.add(boardTable);

    // Executive chairs around board table
    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const chair = createExecutiveChair(0x4ecdc4);
        chair.position.set(
            -7 + Math.sin(angle) * 1.8,
            -height / 2 + 0.3,
            Math.cos(angle) * 1
        );
        chair.rotation.y = -angle + Math.PI;
        floorGroup.add(chair);
    }
}

function addEnterpriseLayout(floorGroup, width, depth, height, floorIndex) {
    // Enterprise desks
    const enterpriseColors = [0x3d3d3d, 0x454545, 0x4d4d4d];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
            const desk = createEnterpriseDesk(1.2, 0.72, 0.6, enterpriseColors[(row + col) % enterpriseColors.length]);
            desk.position.set(
                -5 + col * 2.5,
                -height / 2 + 0.36,
                -4 + row * 2.5
            );
            floorGroup.add(desk);

            const chair = createChair(0xc17f59);
            chair.position.set(
                -5 + col * 2.5,
                -height / 2 + 0.3,
                -4 + row * 2.5 + 0.8
            );
            floorGroup.add(chair);
        }
    }

    // Training room
    const trainingRoom = createTrainingRoom();
    trainingRoom.position.set(5, -height / 2 + 0.5, -5);
    floorGroup.add(trainingRoom);

    // Training tables
    for (let i = 0; i < 3; i++) {
        const table = createTrainingTable(2, 0.72, 1, 0x3a3a3a);
        table.position.set(5, -height / 2 + 0.36, -4 + i * 2);
        floorGroup.add(table);

        // Chairs around training tables
        for (let j = 0; j < 3; j++) {
            const chair = createChair(0x4ecdc4);
            chair.position.set(
                4 + j * 0.8,
                -height / 2 + 0.3,
                -4 + i * 2 + 0.7
            );
            floorGroup.add(chair);
        }
    }

    // Event space
    const eventSpace = createEventSpace();
    eventSpace.position.set(-6, -height / 2 + 0.25, 5);
    floorGroup.add(eventSpace);

    // Client meeting suite
    const clientMeeting = createClientMeetingSuite();
    clientMeeting.position.set(6, -height / 2 + 0.5, 5);
    floorGroup.add(clientMeeting);
}

function addCorporateLayout(floorGroup, width, depth, height, floorIndex) {
    // Fully furnished corporate layout
    // Custom desks with branding
    const corporateColors = [0x2a2a2a, 0x333340, 0x2a332a];

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
            const desk = createCorporateDesk(1.3, 0.7, 0.65, corporateColors[(row + col) % corporateColors.length]);
            desk.position.set(
                -4 + col * 2.8,
                -height / 2 + 0.35,
                -5 + row * 2.5
            );
            floorGroup.add(desk);

            const chair = createExecutiveChair(0xc17f59);
            chair.position.set(
                -4 + col * 2.8,
                -height / 2 + 0.3,
                -5 + row * 2.5 + 0.85
            );
            floorGroup.add(chair);
        }
    }

    // Private meeting rooms
    for (let i = 0; i < 2; i++) {
        const meetingRoom = createMeetingRoom(4, 2.5, 3, 0x2a3a4a);
        meetingRoom.position.set(-6 + i * 5, -height / 2 + 1.25, 5);
        floorGroup.add(meetingRoom);

        const meetingTable = createOvalTable(2.5, 0.72, 1.2, 0x2a2a2a);
        meetingTable.position.set(-6 + i * 5, -height / 2 + 0.36, 5);
        floorGroup.add(meetingTable);

        for (let j = 0; j < 5; j++) {
            const angle = (j / 5) * Math.PI * 2;
            const chair = createChair(0x4ecdc4);
            chair.position.set(
                -6 + i * 5 + Math.sin(angle) * 1,
                -height / 2 + 0.3,
                5 + Math.cos(angle) * 0.7
            );
            chair.rotation.y = -angle;
            floorGroup.add(chair);
        }
    }

    // Reception for corporate floor
    const corpReception = createCorporateReception();
    corpReception.position.set(0, -height / 2 + 0.4, -6);
    floorGroup.add(corpReception);
}

// ===========================================
// FURNITURE CREATION FUNCTIONS
// ===========================================

function createDesk(width, height, depth, color) {
    const group = new THREE.Group();

    // Desk top
    const topGeometry = new THREE.BoxGeometry(width, 0.08, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.08, height - 0.08, 0.08);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.6,
        metalness: 0.5
    });

    const legPositions = [
        { x: width / 2 - 0.1, z: depth / 2 - 0.1 },
        { x: -width / 2 + 0.1, z: depth / 2 - 0.1 },
        { x: width / 2 - 0.1, z: -depth / 2 + 0.1 },
        { x: -width / 2 + 0.1, z: -depth / 2 + 0.1 }
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, (height - 0.08) / 2, pos.z);
        leg.castShadow = true;
        group.add(leg);
    });

    return group;
}

function createPremiumDesk(width, height, depth, color) {
    const group = new THREE.Group();

    // Premium desk top with rounded edge effect
    const topGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.4
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    group.add(top);

    // Metal legs
    const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, height - 0.1, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.2,
        metalness: 0.8
    });

    const legPositions = [
        { x: width / 2 - 0.15, z: depth / 2 - 0.15 },
        { x: -width / 2 + 0.15, z: depth / 2 - 0.15 },
        { x: width / 2 - 0.15, z: -depth / 2 + 0.15 },
        { x: -width / 2 + 0.15, z: -depth / 2 + 0.15 }
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, (height - 0.1) / 2, pos.z);
        leg.castShadow = true;
        group.add(leg);
    });

    // Monitor stand
    const standGeometry = new THREE.BoxGeometry(0.4, 0.15, 0.25);
    const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.4,
        metalness: 0.6
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(0, height / 2 + 0.1, -depth / 4);
    group.add(stand);

    return group;
}

function createEnterpriseDesk(width, height, depth, color) {
    const group = new THREE.Group();

    // Desk with drawer unit
    const topGeometry = new THREE.BoxGeometry(width, 0.08, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.4
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    group.add(top);

    // Metal frame legs
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.3,
        metalness: 0.7
    });

    // Side panels
    const panelGeometry = new THREE.BoxGeometry(0.05, height - 0.1, depth);
    const leftPanel = new THREE.Mesh(panelGeometry, legMaterial);
    leftPanel.position.set(-width / 2 + 0.05, (height - 0.1) / 2, 0);
    group.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, legMaterial);
    rightPanel.position.set(width / 2 - 0.05, (height - 0.1) / 2, 0);
    group.add(rightPanel);

    // Cross bar
    const crossBarGeometry = new THREE.BoxGeometry(width - 0.1, 0.05, 0.05);
    const crossBar = new THREE.Mesh(crossBarGeometry, legMaterial);
    crossBar.position.set(0, 0.15, depth / 2 - 0.1);
    group.add(crossBar);

    return group;
}

function createCorporateDesk(width, height, depth, color) {
    const group = new THREE.Group();

    // Premium L-shaped desk effect
    const topGeometry = new THREE.BoxGeometry(width, 0.1, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.3,
        metalness: 0.5
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    group.add(top);

    // Metal pedestal legs
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.2,
        metalness: 0.8
    });

    const pedestalGeometry = new THREE.BoxGeometry(0.3, height - 0.1, 0.4);
    const leftPedestal = new THREE.Mesh(pedestalGeometry, legMaterial);
    leftPedestal.position.set(-width / 2 + 0.2, (height - 0.1) / 2, depth / 2 - 0.25);
    group.add(leftPedestal);

    const rightPedestal = new THREE.Mesh(pedestalGeometry, legMaterial);
    rightPedestal.position.set(width / 2 - 0.2, (height - 0.1) / 2, depth / 2 - 0.25);
    group.add(rightPedestal);

    return group;
}

function createChair(color) {
    const group = new THREE.Group();

    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.45, 0.08, 0.45);
    const seatMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.2
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.35;
    seat.castShadow = true;
    group.add(seat);

    // Backrest
    const backGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.06);
    const backMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.6,
        metalness: 0.2
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.55, -0.2);
    back.castShadow = true;
    group.add(back);

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.5,
        metalness: 0.6
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.17;
    group.add(base);

    // Center pole
    const poleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
    const pole = new THREE.Mesh(poleGeometry, baseMaterial);
    pole.position.y = 0.3;
    group.add(pole);

    return group;
}

function createPremiumChair(color) {
    const group = new THREE.Group();

    // Ergonomic seat
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seatMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.42;
    seat.castShadow = true;
    group.add(seat);

    // Curved backrest
    const backGeometry = new THREE.BoxGeometry(0.45, 0.5, 0.08);
    const backMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.65, -0.22);
    back.castShadow = true;
    group.add(back);

    // Chrome base
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.2,
        metalness: 0.8
    });

    const baseGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.04, 16);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.2;
    group.add(base);

    // Star base
    for (let i = 0; i < 5; i++) {
        const armGeometry = new THREE.BoxGeometry(0.25, 0.04, 0.06);
        const arm = new THREE.Mesh(armGeometry, baseMaterial);
        const angle = (i / 5) * Math.PI * 2;
        arm.position.set(Math.sin(angle) * 0.15, 0.2, Math.cos(angle) * 0.15);
        arm.rotation.y = -angle;
        group.add(arm);
    }

    return group;
}

function createExecutiveChair(color) {
    const group = new THREE.Group();

    // Executive seat - thicker cushion
    const seatGeometry = new THREE.BoxGeometry(0.55, 0.12, 0.55);
    const seatMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.35,
        metalness: 0.3
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.y = 0.45;
    seat.castShadow = true;
    group.add(seat);

    // High backrest with padding
    const backGeometry = new THREE.BoxGeometry(0.5, 0.7, 0.1);
    const backMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.35,
        metalness: 0.3
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, 0.8, -0.25);
    back.castShadow = true;
    group.add(back);

    // Armrests
    const armMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.3,
        metalness: 0.7
    });

    const armGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.35);
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.32, 0.52, -0.05);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.32, 0.52, -0.05);
    group.add(rightArm);

    // Premium base
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.2,
        metalness: 0.8
    });

    const baseGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16);
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.22;
    group.add(base);

    return group;
}

function createCabin(width, height, depth, color) {
    const group = new THREE.Group();

    // Glass walls (transparent)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.3
    });

    // Front glass wall
    const frontWallGeometry = new THREE.BoxGeometry(width, height, 0.05);
    const frontWall = new THREE.Mesh(frontWallGeometry, glassMaterial);
    frontWall.position.set(0, height / 2, depth / 2);
    group.add(frontWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.05, height, depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightWall.position.set(width / 2, height / 2, 0);
    group.add(rightWall);

    // Floor marker inside cabin
    const floorGeometry = new THREE.BoxGeometry(width - 0.1, 0.02, depth - 0.1);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.7
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -height / 2 + 0.01;
    group.add(floor);

    return group;
}

function createPremiumCabin(width, height, depth, color) {
    const group = new THREE.Group();

    // Frosted glass walls
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaddff,
        metalness: 0.1,
        roughness: 0.3,
        transmission: 0.6,
        transparent: true,
        opacity: 0.4
    });

    // All walls
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.05), glassMaterial);
    frontWall.position.set(0, height / 2, depth / 2);
    group.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.05), glassMaterial);
    backWall.position.set(0, height / 2, -depth / 2);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), glassMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), glassMaterial);
    rightWall.position.set(width / 2, height / 2, 0);
    group.add(rightWall);

    // Premium floor
    const floorGeometry = new THREE.BoxGeometry(width - 0.1, 0.02, depth - 0.1);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d3d3d,
        roughness: 0.5,
        metalness: 0.3
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -height / 2 + 0.01;
    group.add(floor);

    return group;
}

function createMeetingRoom(width, height, depth, color) {
    const group = new THREE.Group();

    // Glass meeting room
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.35
    });

    // Walls
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.05), glassMaterial);
    frontWall.position.set(0, height / 2, depth / 2);
    group.add(frontWall);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.05), glassMaterial);
    backWall.position.set(0, height / 2, -depth / 2);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), glassMaterial);
    leftWall.position.set(-width / 2, height / 2, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, height, depth), glassMaterial);
    rightWall.position.set(width / 2, height / 2, 0);
    group.add(rightWall);

    // Door opening indicator
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.05);
    const doorMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.3
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1, -depth / 2);
    group.add(door);

    return group;
}

function createOvalTable(width, height, depth, color) {
    const group = new THREE.Group();

    // Table top (using scaled cylinder for oval)
    const topGeometry = new THREE.CylinderGeometry(depth / 2, depth / 2, 0.08, 32);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.scale.set(width / depth, 1, 1);
    top.position.y = height / 2;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Central pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(0.15, 0.2, height - 0.08, 16);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.3,
        metalness: 0.6
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = (height - 0.08) / 2;
    pedestal.castShadow = true;
    group.add(pedestal);

    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 16);
    const base = new THREE.Mesh(baseGeometry, pedestalMaterial);
    base.position.y = 0.025;
    group.add(base);

    return group;
}

function createRoundTable(radius, height, color) {
    const group = new THREE.Group();

    const topGeometry = new THREE.CylinderGeometry(radius, radius, 0.08, 32);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.3
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    group.add(top);

    // Central column
    const columnGeometry = new THREE.CylinderGeometry(0.08, 0.08, height - 0.08, 16);
    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.3,
        metalness: 0.6
    });
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = (height - 0.08) / 2;
    group.add(column);

    // Base
    const baseGeometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.04, 16);
    const base = new THREE.Mesh(baseGeometry, columnMaterial);
    base.position.y = 0.02;
    group.add(base);

    return group;
}

function createPantryArea() {
    const group = new THREE.Group();

    // Counter
    const counterGeometry = new THREE.BoxGeometry(2, 0.9, 0.6);
    const counterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.5,
        metalness: 0.3
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.45, 0);
    counter.castShadow = true;
    group.add(counter);

    // Counter top
    const topGeometry = new THREE.BoxGeometry(2.1, 0.05, 0.7);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.2,
        metalness: 0.5
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(0, 0.92, 0);
    group.add(top);

    // Appliance markers
    const applianceGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.25);
    const applianceMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.4,
        metalness: 0.6
    });

    for (let i = 0; i < 3; i++) {
        const appliance = new THREE.Mesh(applianceGeometry, applianceMaterial);
        appliance.position.set(-0.6 + i * 0.6, 1.05, 0);
        group.add(appliance);
    }

    return group;
}

function createPantryMarker() {
    const group = new THREE.Group();

    // Simple pantry floor marker
    const markerGeometry = new THREE.CircleGeometry(1.5, 32);
    const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0x3d3d4a,
        roughness: 0.8,
        metalness: 0.1
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = 0.01;
    group.add(marker);

    return group;
}

function createPhoneBooth() {
    const group = new THREE.Group();

    // Enclosed booth
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaddff,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.6,
        transparent: true,
        opacity: 0.4
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.05), glassMaterial);
    backWall.position.set(0, 1, -0.5);
    group.add(backWall);

    // Side walls
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2, 1), glassMaterial);
    sideWall.position.set(-0.6, 1, 0);
    group.add(sideWall);

    const sideWall2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2, 1), glassMaterial);
    sideWall2.position.set(0.6, 1, 0);
    group.add(sideWall2);

    // Small desk inside
    const deskGeometry = new THREE.BoxGeometry(0.6, 0.7, 0.4);
    const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 0.4
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 0.35, 0.2);
    group.add(desk);

    return group;
}

function createPrintStation() {
    const group = new THREE.Group();

    // Printer stand
    const standGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.5);
    const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.4
    });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = 0.4;
    stand.castShadow = true;
    group.add(stand);

    // Printer
    const printerGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.35);
    const printerMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.3,
        metalness: 0.6
    });
    const printer = new THREE.Mesh(printerGeometry, printerMaterial);
    printer.position.set(0, 0.9, 0);
    group.add(printer);

    return group;
}

function createServerRoom() {
    const group = new THREE.Group();

    // Server racks
    const rackGeometry = new THREE.BoxGeometry(0.8, 2, 0.6);
    const rackMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.6
    });

    for (let i = 0; i < 2; i++) {
        const rack = new THREE.Mesh(rackGeometry, rackMaterial);
        rack.position.set(-0.5 + i * 1, 1, 0);
        rack.castShadow = true;
        group.add(rack);

        // LED indicators
        const ledGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.4);
        const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(-0.5 + i * 1 + 0.42, 1.5, 0);
        group.add(led);
    }

    return group;
}

function createLoungeSofa() {
    const group = new THREE.Group();

    const sofaMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.7,
        metalness: 0.1
    });

    // Base
    const baseGeometry = new THREE.BoxGeometry(3, 0.3, 1);
    const base = new THREE.Mesh(baseGeometry, sofaMaterial);
    base.position.y = 0.15;
    base.castShadow = true;
    group.add(base);

    // Back
    const backGeometry = new THREE.BoxGeometry(3, 0.5, 0.2);
    const back = new THREE.Mesh(backGeometry, sofaMaterial);
    back.position.set(0, 0.45, -0.4);
    back.castShadow = true;
    group.add(back);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.2, 0.4, 1);
    const leftArm = new THREE.Mesh(armGeometry, sofaMaterial);
    leftArm.position.set(-1.4, 0.35, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, sofaMaterial);
    rightArm.position.set(1.4, 0.35, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    return group;
}

function createFocusPod() {
    const group = new THREE.Group();

    // Soundproof pod
    const podMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.6,
        metalness: 0.2
    });

    // Back and sides
    const backGeometry = new THREE.BoxGeometry(1.5, 2.2, 0.1);
    const back = new THREE.Mesh(backGeometry, podMaterial);
    back.position.set(0, 1.1, -0.6);
    group.add(back);

    const leftGeometry = new THREE.BoxGeometry(0.1, 2.2, 1.2);
    const left = new THREE.Mesh(leftGeometry, podMaterial);
    left.position.set(-0.7, 1.1, 0);
    group.add(left);

    const rightGeometry = new THREE.BoxGeometry(0.1, 2.2, 1.2);
    const right = new THREE.Mesh(rightGeometry, podMaterial);
    right.position.set(0.7, 1.1, 0);
    group.add(right);

    // Desk inside
    const deskGeometry = new THREE.BoxGeometry(1, 0.7, 0.5);
    const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.4,
        metalness: 0.4
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 0.35, 0);
    group.add(desk);

    return group;
}

function createWellnessRoom() {
    const group = new THREE.Group();

    // Private wellness room
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a2a,
        roughness: 0.7,
        metalness: 0.1
    });

    const floorGeometry = new THREE.BoxGeometry(2.5, 0.02, 2.5);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a4a3a,
        roughness: 0.5
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0.01;
    group.add(floor);

    // Wall markers
    const wallGeometry = new THREE.BoxGeometry(2.5, 2, 0.05);
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(0, 1, 1.25);
    group.add(wall);

    return group;
}

function createPremiumPantry() {
    const group = new THREE.Group();

    // Premium kitchen counter
    const counterGeometry = new THREE.BoxGeometry(3, 0.95, 0.7);
    const counterMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.3,
        metalness: 0.4
    });
    const counter = new THREE.Mesh(counterGeometry, counterMaterial);
    counter.position.set(0, 0.475, 0);
    counter.castShadow = true;
    group.add(counter);

    // Marble top
    const topGeometry = new THREE.BoxGeometry(3.1, 0.05, 0.8);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 0.1,
        metalness: 0.2
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(0, 0.975, 0);
    group.add(top);

    // Under-counter appliances
    const applianceGeometry = new THREE.BoxGeometry(0.5, 0.4, 0.5);
    const applianceMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.7
    });

    for (let i = 0; i < 3; i++) {
        const appliance = new THREE.Mesh(applianceGeometry, applianceMaterial);
        appliance.position.set(-1 + i, 0.45, 0);
        group.add(appliance);
    }

    return group;
}

function createExecutiveLounge() {
    const group = new THREE.Group();

    // Multiple seating arrangement
    const sofaMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.2
    });

    // L-shaped sofa
    const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 0.9), sofaMaterial);
    sofa1.position.set(0, 0.2, -0.8);
    sofa1.castShadow = true;
    group.add(sofa1);

    const sofa2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 1.5), sofaMaterial);
    sofa2.position.set(-0.8, 0.2, 0.2);
    sofa2.castShadow = true;
    group.add(sofa2);

    // Coffee table
    const tableGeometry = new THREE.BoxGeometry(1.2, 0.35, 0.6);
    const tableMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.5
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0.3, 0.175, 0.3);
    table.castShadow = true;
    group.add(table);

    return group;
}

function createBoardRoom() {
    const group = new THREE.Group();

    // Large meeting room
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.3
    });

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(6, 2.8, 0.05), glassMaterial);
    frontWall.position.set(0, 1.4, 2);
    group.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 4), glassMaterial);
    leftWall.position.set(-3, 1.4, 0);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 4), glassMaterial);
    rightWall.position.set(3, 1.4, 0);
    group.add(rightWall);

    return group;
}

function createTrainingRoom() {
    const group = new THREE.Group();

    // Training room with rows of tables
    const roomMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a3a4a,
        roughness: 0.6,
        metalness: 0.2,
        transparent: true,
        opacity: 0.4
    });

    const wallGeometry = new THREE.BoxGeometry(5, 2.5, 0.05);
    const wall = new THREE.Mesh(wallGeometry, roomMaterial);
    wall.position.set(0, 1.25, 2);
    group.add(wall);

    return group;
}

function createTrainingTable(width, height, depth, color) {
    const group = new THREE.Group();

    const topGeometry = new THREE.BoxGeometry(width, 0.08, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.4,
        metalness: 0.4
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = height / 2;
    top.castShadow = true;
    group.add(top);

    // Metal legs
    const legGeometry = new THREE.BoxGeometry(0.05, height - 0.08, 0.05);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        roughness: 0.3,
        metalness: 0.7
    });

    const positions = [
        { x: width / 2 - 0.1, z: depth / 2 - 0.1 },
        { x: -width / 2 + 0.1, z: depth / 2 - 0.1 },
        { x: width / 2 - 0.1, z: -depth / 2 + 0.1 },
        { x: -width / 2 + 0.1, z: -depth / 2 + 0.1 }
    ];

    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos.x, (height - 0.08) / 2, pos.z);
        group.add(leg);
    });

    return group;
}

function createEventSpace() {
    const group = new THREE.Group();

    // Open event space with flexible seating
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a4a,
        roughness: 0.5,
        metalness: 0.2
    });
    const floorGeometry = new THREE.BoxGeometry(4, 0.02, 3);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = 0.01;
    group.add(floor);

    // Stage area indicator
    const stageGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const stageMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.3
    });
    const stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.set(0, 0.05, -1);
    group.add(stage);

    return group;
}

function createClientMeetingSuite() {
    const group = new THREE.Group();

    // Premium client meeting room
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.35
    });

    // Enclosed room
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 0.05), glassMaterial);
    frontWall.position.set(0, 1.25, 1.5);
    group.add(frontWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 3), glassMaterial);
    leftWall.position.set(-1.75, 1.25, 0);
    group.add(leftWall);

    // TV screen
    const tvGeometry = new THREE.BoxGeometry(2, 1.2, 0.1);
    const tvMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x222233,
        emissiveIntensity: 0.3
    });
    const tv = new THREE.Mesh(tvGeometry, tvMaterial);
    tv.position.set(0, 1.5, 1.45);
    group.add(tv);

    return group;
}

function createCorporateReception() {
    const group = new THREE.Group();

    // Reception desk - L-shaped
    const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.4,
        metalness: 0.4
    });

    const desk1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 0.6), deskMaterial);
    desk1.position.set(0, 0.5, 0);
    desk1.castShadow = true;
    group.add(desk1);

    const desk2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 1.5), deskMaterial);
    desk2.position.set(-1.2, 0.5, 0.3);
    desk2.castShadow = true;
    group.add(desk2);

    // Desk top
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.2,
        metalness: 0.5
    });
    const top1 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.7), topMaterial);
    top1.position.set(0, 1.025, 0);
    group.add(top1);

    const top2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 1.6), topMaterial);
    top2.position.set(-1.2, 1.025, 0.3);
    group.add(top2);

    // Visitor chairs
    const chairColors = [0x4ecdc4, 0xc17f59, 0x88ccff];
    for (let i = 0; i < 3; i++) {
        const chair = createChair(chairColors[i]);
        chair.position.set(-1 + i, 0.3, 1);
        chair.rotation.y = Math.PI;
        group.add(chair);
    }

    return group;
}

// ===========================================
// CEILING LIGHTS AND WINDOWS
// ===========================================

function addCeilingLights(floorGroup, width, depth, height) {
    // Create ceiling light fixtures
    const lightPositions = [
        { x: -4, z: -3 },
        { x: 4, z: -3 },
        { x: -4, z: 3 },
        { x: 4, z: 3 }
    ];

    lightPositions.forEach(pos => {
        const light = createCeilingLight();
        light.position.set(pos.x, height / 2 - 0.1, pos.z);
        floorGroup.add(light);
    });
}

function createCeilingLight() {
    const group = new THREE.Group();

    // Light fixture
    const fixtureGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.4);
    const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0xffffff,
        emissiveIntensity: 0.3
    });
    const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
    group.add(fixture);

    // Light panel (emissive)
    const panelGeometry = new THREE.BoxGeometry(0.6, 0.02, 0.3);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffee,
        emissive: 0xffffdd,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
    });
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.position.y = -0.06;
    group.add(panel);

    return group;
}

function addFloorNumberIndicator(floorGroup, width, depth, height, floorIndex) {
    // Floor number on exterior wall
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
    ctx.beginPath();
    ctx.roundRect(0, 0, 128, 128, 16);
    ctx.fill();

    // Text
    ctx.fillStyle = '#c17f59';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(floorIndex.toString(), 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 1.5, 1);
    sprite.position.set(width / 2 + 0.5, height / 2 - 0.5, 0);
    floorGroup.add(sprite);
}

function addPathways(floorGroup, width, depth, height, floorIndex, data) {
    // Create subtle pathway markers between clusters
    const pathwayMaterial = new THREE.MeshStandardMaterial({
        color: 0x252525,
        roughness: 0.9,
        metalness: 0.1
    });

    // Central pathway
    const pathGeometry = new THREE.BoxGeometry(1, 0.02, depth - 2);
    const centralPath = new THREE.Mesh(pathGeometry, pathwayMaterial);
    centralPath.position.set(0, -height / 2 + 0.21, 0);
    floorGroup.add(centralPath);

    // Cross pathways
    if (floorIndex > 0 && floorIndex < 7) {
        const crossPathGeometry = new THREE.BoxGeometry(width - 2, 0.02, 0.8);
        const crossPath = new THREE.Mesh(crossPathGeometry, pathwayMaterial);
        crossPath.position.set(0, -height / 2 + 0.21, 0);
        floorGroup.add(crossPath);
    }
}

function createCurtainWalls() {
    // Glass material for windows with transparency
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
        transparent: true,
        opacity: 0.25,
        envMapIntensity: 1
    });

    // Window strip material - slightly more opaque for visibility
    const windowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xaaddff,
        metalness: 0.15,
        roughness: 0.1,
        transmission: 0.7,
        transparent: true,
        opacity: 0.4,
        envMapIntensity: 1.2
    });

    const wallGeometry = new THREE.BoxGeometry(20.2, 36, 0.1);

    // Front and back walls
    const frontWall = new THREE.Mesh(wallGeometry, glassMaterial);
    frontWall.position.set(0, 18, 8);
    scene.add(frontWall);

    const backWall = new THREE.Mesh(wallGeometry, glassMaterial);
    backWall.position.set(0, 18, -8);
    scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.1, 36, 16.2);
    const leftWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftWall.position.set(-10, 18, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightWall.position.set(10, 18, 0);
    scene.add(rightWall);

    // Add window strips on each floor level
    addWindowStrips();
}

function addWindowStrips() {
    const floorHeight = 4;
    const windowHeight = 1.5;
    const windowSpacing = 2.5;

    // Create window strips for each floor
    for (let i = 0; i < 10; i++) {
        const yPos = i * floorHeight + floorHeight / 2;

        // Front and back window strips
        for (let side = 0; side < 2; side++) {
            const zPos = side === 0 ? 7.9 : -7.9;
            const windowStrip = createWindowStrip(18, windowHeight);
            windowStrip.position.set(0, yPos, zPos);
            scene.add(windowStrip);
        }

        // Side window strips
        for (let side = 0; side < 2; side++) {
            const xPos = side === 0 ? -9.9 : 9.9;
            const windowStrip = createWindowStrip(windowHeight, 14);
            windowStrip.rotation.y = Math.PI / 2;
            windowStrip.position.set(xPos, yPos, 0);
            scene.add(windowStrip);
        }
    }
}

function createWindowStrip(width, height) {
    const group = new THREE.Group();

    // Main glass panel
    const glassGeometry = new THREE.BoxGeometry(width, height, 0.05);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcceeff,
        metalness: 0.2,
        roughness: 0.05,
        transmission: 0.8,
        transparent: true,
        opacity: 0.5,
        envMapIntensity: 1.5
    });

    const glass = new THREE.Mesh(glassGeometry, glassMaterial);
    group.add(glass);

    // Frame edges
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.3,
        metalness: 0.7
    });

    // Top frame
    const topFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.08, 0.08),
        frameMaterial
    );
    topFrame.position.y = height / 2;
    group.add(topFrame);

    // Bottom frame
    const bottomFrame = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.08, 0.08),
        frameMaterial
    );
    bottomFrame.position.y = -height / 2;
    group.add(bottomFrame);

    // Vertical dividers
    const dividerCount = Math.floor(width / 3);
    for (let i = 1; i < dividerCount; i++) {
        const divider = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, height - 0.1, 0.05),
            frameMaterial
        );
        divider.position.x = -width / 2 + (width / dividerCount) * i;
        group.add(divider);
    }

    return group;
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

    // Parking area markers (side parking - different from car models location)
    const parkingMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8
    });

    for (let i = -2; i <= 2; i++) {
        const parking = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 5),
            parkingMaterial
        );
        parking.position.set(i * 4 + 20, 0.05, 40);
        parking.receiveShadow = true;
        scene.add(parking);
    }
}

function createLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    lights.ambient = ambient;

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
    lights.sun = sunLight;

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xc17f59, 0.3);
    fillLight.position.set(-20, 20, -10);
    scene.add(fillLight);
    lights.fill = fillLight;

    // Copper accent spotlights (volumetric effect simulation)
    const copperSpot1 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
    copperSpot1.position.set(-15, 40, 15);
    copperSpot1.target.position.set(0, 0, 0);
    scene.add(copperSpot1);
    scene.add(copperSpot1.target);
    lights.copperSpot1 = copperSpot1;

    const copperSpot2 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
    copperSpot2.position.set(15, 40, -15);
    copperSpot2.target.position.set(0, 0, 0);
    scene.add(copperSpot2);
    scene.add(copperSpot2.target);
    lights.copperSpot2 = copperSpot2;

    // Enhanced lighting - Additional ambient occlusion feel through multiple lights
    const aoLight1 = new THREE.DirectionalLight(0x8888ff, 0.15);
    aoLight1.position.set(-30, 20, 10);
    scene.add(aoLight1);
    lights.aoLight1 = aoLight1;

    const aoLight2 = new THREE.DirectionalLight(0xff8888, 0.15);
    aoLight2.position.set(30, 20, -10);
    scene.add(aoLight2);
    lights.aoLight2 = aoLight2;

    // Interior point lights for activity simulation
    createInteriorLights();
}

function createInteriorLights() {
    // Point lights inside the building to show interior activity
    const interiorLightPositions = [
        { x: -5, y: 6, z: 0 },
        { x: 5, y: 10, z: 2 },
        { x: -3, y: 14, z: -2 },
        { x: 4, y: 18, z: 3 },
        { x: -4, y: 22, z: 1 },
        { x: 3, y: 26, z: -1 },
        { x: -2, y: 30, z: 2 }
    ];

    interiorLightPositions.forEach((pos, index) => {
        const light = new THREE.PointLight(0xffddaa, 0.8, 15, 2);
        light.position.set(pos.x, pos.y, pos.z);
        scene.add(light);

        // Add a small glowing sphere to visualize the light
        const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffddaa,
            transparent: true,
            opacity: 0.6
        });
        const glowSphere = new THREE.Mesh(glowGeo, glowMat);
        glowSphere.position.copy(light.position);
        scene.add(glowSphere);

        // Store for animation
        if (!lights.interiorLights) lights.interiorLights = [];
        lights.interiorLights.push({ light, glowSphere, baseIntensity: 0.8 });
    });
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
// DAY/NIGHT TOGGLE BUTTON
// ===========================================

function createDayNightToggle() {
    // Create the toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'dayNightToggle';
    toggleBtn.className = 'day-night-toggle';
    toggleBtn.innerHTML = `
        <span class="toggle-icon">${isNightMode ? '&#9790;' : '&#9728;'}</span>
        <span class="toggle-text">${isNightMode ? 'Night' : 'Day'}</span>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .day-night-toggle {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 100;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: rgba(10, 10, 10, 0.9);
            border: 1px solid rgba(193, 127, 89, 0.4);
            border-radius: 25px;
            color: #c17f59;
            font-family: 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .day-night-toggle:hover {
            background: rgba(193, 127, 89, 0.15);
            border-color: #c17f59;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .toggle-icon {
            font-size: 16px;
        }

        .toggle-text {
            text-transform: uppercase;
            letter-spacing: 1px;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toggleBtn);

    // Add click handler
    toggleBtn.addEventListener('click', toggleDayNight);

    // Create sky elements
    createSkyElements();

    // Create environment details
    createEnvironmentDetails();
}

function toggleDayNight() {
    isNightMode = !isNightMode;

    // Update button appearance
    const toggleBtn = document.getElementById('dayNightToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = `
            <span class="toggle-icon">${isNightMode ? '&#9790;' : '&#9728;'}</span>
            <span class="toggle-text">${isNightMode ? 'Night' : 'Day'}</span>
        `;
    }

    // Animate transition
    animateDayNightTransition();
}

function animateDayNightTransition() {
    const dayColor = new THREE.Color(0x87CEEB);
    const nightColor = new THREE.Color(0x0a0a0f);
    const targetSkyColor = isNightMode ? nightColor : dayColor;
    const targetFogColor = isNightMode ? nightColor : dayColor;

    // Animate sky background
    gsap.to(scene.background, {
        r: targetSkyColor.r,
        g: targetSkyColor.g,
        b: targetSkyColor.b,
        duration: transitionDuration,
        ease: 'power2.inOut'
    });

    // Animate fog
    gsap.to(scene.fog.color, {
        r: targetFogColor.r,
        g: targetFogColor.g,
        b: targetFogColor.b,
        duration: transitionDuration,
        ease: 'power2.inOut'
    });

    // Animate lights
    if (lights.ambient) {
        gsap.to(lights.ambient, {
            intensity: isNightMode ? 0.3 : 0.7,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    if (lights.sun) {
        gsap.to(lights.sun, {
            intensity: isNightMode ? 0.8 : 1.5,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    if (lights.fill) {
        gsap.to(lights.fill, {
            intensity: isNightMode ? 0.3 : 0.15,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    // Animate copper spotlights (more intense at night)
    if (lights.copperSpot1) {
        gsap.to(lights.copperSpot1, {
            intensity: isNightMode ? 80 : 20,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    if (lights.copperSpot2) {
        gsap.to(lights.copperSpot2, {
            intensity: isNightMode ? 80 : 20,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    // Animate AO lights
    if (lights.aoLight1) {
        gsap.to(lights.aoLight1, {
            intensity: isNightMode ? 0.15 : 0.05,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    if (lights.aoLight2) {
        gsap.to(lights.aoLight2, {
            intensity: isNightMode ? 0.15 : 0.05,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    // Animate interior lights (brighter at night)
    if (lights.interiorLights) {
        lights.interiorLights.forEach((item, index) => {
            gsap.to(item.light, {
                intensity: isNightMode ? 1.2 : 0.4,
                duration: transitionDuration,
                ease: 'power2.inOut',
                delay: index * 0.1
            });

            gsap.to(item.glowSphere.material, {
                opacity: isNightMode ? 0.8 : 0.3,
                duration: transitionDuration,
                ease: 'power2.inOut',
                delay: index * 0.1
            });
        });
    }

    // Animate sky elements (stars and clouds)
    animateSkyTransition();

    // Animate renderer tone mapping
    gsap.to(renderer, {
        toneMappingExposure: isNightMode ? 1.0 : 1.4,
        duration: transitionDuration,
        ease: 'power2.inOut'
    });
}

function createSkyElements() {
    // Create stars (visible at night)
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 500;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 200;
        const y = Math.random() * 100 + 20;
        const z = (Math.random() - 0.5) * 200;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    skyElements.stars = stars;

    // Create clouds (visible at day)
    const cloudsGroup = new THREE.Group();
    const cloudCount = 15;

    for (let i = 0; i < cloudCount; i++) {
        const cloud = createCloud();
        cloud.position.set(
            (Math.random() - 0.5) * 150,
            40 + Math.random() * 20,
            (Math.random() - 0.5) * 150
        );
        cloud.scale.setScalar(1 + Math.random() * 2);
        cloud.userData.speed = 0.5 + Math.random() * 1;
        cloud.userData.originalX = cloud.position.x;
        cloudsGroup.add(cloud);
    }

    scene.add(cloudsGroup);
    skyElements.clouds = cloudsGroup;
}

function createCloud() {
    const cloudGroup = new THREE.Group();
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        roughness: 1
    });

    // Create cloud from multiple spheres
    const sphereCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < sphereCount; i++) {
        const size = 2 + Math.random() * 3;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const sphere = new THREE.Mesh(geometry, cloudMaterial);

        sphere.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 4
        );

        cloudGroup.add(sphere);
    }

    return cloudGroup;
}

function animateSkyTransition() {
    // Animate stars visibility
    if (skyElements.stars) {
        gsap.to(skyElements.stars.material, {
            opacity: isNightMode ? 0.8 : 0,
            duration: transitionDuration,
            ease: 'power2.inOut'
        });
    }

    // Animate clouds visibility
    if (skyElements.clouds) {
        skyElements.clouds.children.forEach(cloud => {
            gsap.to(cloud.children, {
                opacity: isNightMode ? 0.1 : 0.6,
                duration: transitionDuration,
                ease: 'power2.inOut'
            });
        });
    }
}

function createEnvironmentDetails() {
    // Create animated flag on roof
    createFlag();

    // Create entrance signage
    createEntranceSignage();

    // Create car models
    createCarModels();
}

function createFlag() {
    const flagGroup = new THREE.Group();

    // Flag pole
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 3;
    pole.castShadow = true;
    flagGroup.add(pole);

    // Flag cloth
    const flagGeometry = new THREE.PlaneGeometry(4, 2.5, 20, 12);
    const flagMaterial = new THREE.MeshStandardMaterial({
        color: 0xc17f59,
        side: THREE.DoubleSide,
        roughness: 0.7
    });
    const flag = new THREE.Mesh(flagGeometry, flagMaterial);
    flag.position.set(2.1, 4.5, 0);
    flag.castShadow = true;
    flag.name = 'flag';

    // Store original positions for animation
    flag.geometry.setAttribute('originalPosition', flag.geometry.attributes.position.clone());

    flagGroup.add(flag);

    // Position on roof
    flagGroup.position.set(8, 40.5, -5);
    scene.add(flagGroup);

    environmentObjects.flag = flag;
}

function createEntranceSignage() {
    const signGroup = new THREE.Group();

    // Sign backing
    const backingGeometry = new THREE.BoxGeometry(8, 2.5, 0.3);
    const backingMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.7
    });
    const backing = new THREE.Mesh(backingGeometry, backingMaterial);
    signGroup.add(backing);

    // Create text canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 512, 160);

    // Text
    ctx.fillStyle = '#c17f59';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WORK TABLE', 256, 60);

    ctx.fillStyle = '#888888';
    ctx.font = '24px Arial';
    ctx.fillText('A Coworking Community', 256, 110);

    const texture = new THREE.CanvasTexture(canvas);
    const textGeometry = new THREE.PlaneGeometry(7.8, 2.3);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = 0.2;
    signGroup.add(textMesh);

    // Position at entrance
    signGroup.position.set(0, 3, 12);
    scene.add(signGroup);

    // Add spotlight for signage
    const signLight = new THREE.SpotLight(0xc17f59, 30, 20, Math.PI / 6, 0.5);
    signLight.position.set(0, 8, 15);
    signLight.target.position.set(0, 3, 12);
    scene.add(signLight);
    scene.add(signLight.target);

    environmentObjects.signage = signGroup;
}

function createCarModels() {
    const carGroup = new THREE.Group();

    // Simple car shape
    const createCar = (color, x, z, rotation) => {
        const car = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 1);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        car.add(body);

        // Car top
        const topGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.9);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.3,
            roughness: 0.5
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(-0.2, 1.1, 0);
        top.castShadow = true;
        car.add(top);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.9
        });

        const wheelPositions = [
            { x: 0.6, z: 0.5 },
            { x: 0.6, z: -0.5 },
            { x: -0.6, z: 0.5 },
            { x: -0.6, z: -0.5 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos.x, 0.25, pos.z);
            car.add(wheel);
        });

        car.position.set(x, 0.1, z);
        car.rotation.y = rotation;

        return car;
    };

    // Add cars to parking area
    const carColors = [0x3366cc, 0xcc3333, 0x33aa66, 0xaaaaaa, 0x222222];
    const carPositions = [
        { x: -8, z: 30, rot: 0 },
        { x: -4, z: 30, rot: 0 },
        { x: 0, z: 30, rot: 0 },
        { x: 4, z: 30, rot: 0 },
        { x: 8, z: 30, rot: 0 },
        { x: -6, z: 35, rot: Math.PI },
        { x: -2, z: 35, rot: Math.PI },
        { x: 2, z: 35, rot: Math.PI }
    ];

    carPositions.forEach((pos, index) => {
        const car = createCar(carColors[index % carColors.length], pos.x, pos.z, pos.rot);
        carGroup.add(car);
    });

    scene.add(carGroup);
    environmentObjects.cars = carGroup;
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
            <span class="key">D</span> Day/Night
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        #keyboardHints {
            position: fixed;
            top: 140px;
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

    // D key for day/night toggle
    if (key === 'd' || key === 'D') {
        toggleDayNight();
    }

    // Escape to close modal/panel
    if (key === 'Escape') {
        closeFloorPanel();
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

        if (clickedFloor) {
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

    // Create floor selection panel if it doesn't exist
    let panel = document.getElementById('floorSelectionPanel');
    if (!panel) {
        panel = createFloorSelectionPanel();
    }

    // Update panel content
    const titleEl = panel.querySelector('.floor-panel-title');
    const statusEl = panel.querySelector('.floor-panel-status');
    const descEl = panel.querySelector('.floor-panel-desc');
    const seatsEl = panel.querySelector('.floor-panel-seats');
    const areaEl = panel.querySelector('.floor-panel-area');
    const pricingEl = panel.querySelector('.floor-panel-pricing');
    const amenitiesList = panel.querySelector('.floor-panel-amenities');

    if (titleEl) titleEl.textContent = data.name;
    if (statusEl) {
        statusEl.textContent = data.status === 'lobby' ? 'LOBBY' : data.status.toUpperCase();
        statusEl.className = `floor-panel-status status-${data.status}`;
    }
    if (descEl) descEl.textContent = data.description;
    if (seatsEl) seatsEl.textContent = data.seats > 0 ? `${data.seats} seats` : 'N/A';
    if (areaEl) areaEl.textContent = data.sqft ? `${data.sqft.toLocaleString()} sqft` : 'N/A';
    if (pricingEl) pricingEl.textContent = data.pricing;

    // Update amenities
    if (amenitiesList && data.amenities) {
        amenitiesList.innerHTML = data.amenities.map(amenity => `
            <div class="amenity-item">
                <span class="amenity-icon">${getAmenityIcon(amenity)}</span>
                <span class="amenity-name">${amenity}</span>
            </div>
        `).join('');
    }

    // Update book button
    const bookBtn = panel.querySelector('.book-floor-btn');
    if (bookBtn) {
        bookBtn.onclick = () => bookFloor(floorIndex, data);
        bookBtn.textContent = data.status === 'reserved' ? 'Inquire Now' : 'Book This Floor';
    }

    // Show panel with animation
    panel.classList.remove('hidden');
    gsap.fromTo(panel,
        { x: 350, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

    // Animate camera to focus on floor
    animateCameraToFloor(floorIndex);
}

function getAmenityIcon(amenity) {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('desk')) return '🖥️';
    if (amenityLower.includes('meeting') || amenityLower.includes('conference')) return '🏢';
    if (amenityLower.includes('cabin')) return '🚪';
    if (amenityLower.includes('pantry') || amenityLower.includes('kitchen')) return '☕';
    if (amenityLower.includes('lounge')) return '🛋️';
    if (amenityLower.includes('room')) return '🚻';
    if (amenityLower.includes('parking')) return '🚗';
    if (amenityLower.includes('lift') || amenityLower.includes('elevator')) return '🛗';
    if (amenityLower.includes('security')) return '🔒';
    if (amenityLower.includes('server')) return '🖧';
    if (amenityLower.includes('print')) return '🖨️';
    if (amenityLower.includes('phone') || amenityLower.includes('booth')) return '📞';
    if (amenityLower.includes('wellness') || amenityLower.includes('health')) return '🧘';
    if (amenityLower.includes('terrace') || amenityLower.includes('roof')) return '🌿';
    if (amenityLower.includes('reception')) return '👋';
    if (amenityLower.includes('parking')) return '🅿️';
    return '✓';
}

function createFloorSelectionPanel() {
    const panel = document.createElement('div');
    panel.id = 'floorSelectionPanel';
    panel.className = 'floor-selection-panel hidden';

    panel.innerHTML = `
        <div class="panel-header">
            <div class="floor-panel-title">Floor Name</div>
            <div class="floor-panel-status status-available">AVAILABLE</div>
        </div>
        <div class="panel-close" onclick="closeFloorPanel()">×</div>

        <div class="panel-content">
            <div class="floor-panel-desc">Description</div>

            <div class="panel-stats">
                <div class="stat-box">
                    <div class="stat-icon">💺</div>
                    <div class="stat-label">Available Seats</div>
                    <div class="stat-value floor-panel-seats">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon">📐</div>
                    <div class="stat-label">Total Area</div>
                    <div class="stat-value floor-panel-area">0 sqft</div>
                </div>
            </div>

            <div class="panel-pricing">
                <div class="pricing-label">Pricing</div>
                <div class="pricing-value floor-panel-pricing">₹0/slot</div>
            </div>

            <div class="panel-amenities-section">
                <div class="amenities-header">Amenities</div>
                <div class="floor-panel-amenities"></div>
            </div>

            <button class="book-floor-btn">Book This Floor</button>

            <div class="panel-footer">
                <span class="floor-type-label">Floor Type:</span>
                <span class="floor-type-value">Open Plan</span>
            </div>
        </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .floor-selection-panel {
            position: fixed;
            top: 80px;
            right: 20px;
            width: 320px;
            max-height: calc(100vh - 100px);
            background: linear-gradient(145deg, rgba(20, 20, 25, 0.98), rgba(15, 15, 20, 0.98));
            border: 1px solid rgba(193, 127, 89, 0.3);
            border-radius: 16px;
            z-index: 150;
            overflow: hidden;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(193, 127, 89, 0.1);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .floor-selection-panel.hidden {
            display: none;
        }

        .panel-header {
            padding: 20px 20px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: linear-gradient(180deg, rgba(193, 127, 89, 0.1), transparent);
        }

        .floor-panel-title {
            font-size: 22px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .floor-panel-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.5px;
        }

        .status-available {
            background: rgba(78, 205, 196, 0.2);
            color: #4ecdc4;
            border: 1px solid rgba(78, 205, 196, 0.4);
        }

        .status-premium {
            background: rgba(193, 127, 89, 0.2);
            color: #e8a87c;
            border: 1px solid rgba(193, 127, 89, 0.4);
        }

        .status-reserved {
            background: rgba(255, 107, 107, 0.2);
            color: #ff6b6b;
            border: 1px solid rgba(255, 107, 107, 0.4);
        }

        .status-lobby {
            background: rgba(136, 204, 255, 0.2);
            color: #88ccff;
            border: 1px solid rgba(136, 204, 255, 0.4);
        }

        .panel-close {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            color: #888;
            font-size: 20px;
            line-height: 28px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .panel-close:hover {
            background: rgba(255, 107, 107, 0.3);
            color: #ff6b6b;
        }

        .panel-content {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(100vh - 220px);
        }

        .floor-panel-desc {
            font-size: 13px;
            color: #888;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .panel-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }

        .stat-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            transition: all 0.3s;
        }

        .stat-box:hover {
            background: rgba(193, 127, 89, 0.08);
            border-color: rgba(193, 127, 89, 0.2);
        }

        .stat-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }

        .stat-label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .stat-value {
            font-size: 18px;
            font-weight: 700;
            color: #fff;
        }

        .panel-pricing {
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05));
            border: 1px solid rgba(78, 205, 196, 0.3);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            margin-bottom: 20px;
        }

        .pricing-label {
            font-size: 10px;
            color: #4ecdc4;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .pricing-value {
            font-size: 24px;
            font-weight: 800;
            color: #4ecdc4;
            letter-spacing: -0.5px;
        }

        .panel-amenities-section {
            margin-bottom: 20px;
        }

        .amenities-header {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .floor-panel-amenities {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .amenity-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 8px;
            transition: all 0.2s;
        }

        .amenity-item:hover {
            background: rgba(193, 127, 89, 0.1);
            transform: translateX(4px);
        }

        .amenity-icon {
            font-size: 16px;
            width: 24px;
            text-align: center;
        }

        .amenity-name {
            font-size: 12px;
            color: #ccc;
            flex: 1;
        }

        .book-floor-btn {
            width: 100%;
            padding: 16px 24px;
            background: linear-gradient(135deg, #c17f59, #d4916a);
            border: none;
            border-radius: 12px;
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 15px rgba(193, 127, 89, 0.4);
        }

        .book-floor-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(193, 127, 89, 0.5);
            background: linear-gradient(135deg, #d4916a, #e8a87c);
        }

        .book-floor-btn:active {
            transform: translateY(0);
        }

        .panel-footer {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            text-align: center;
            font-size: 11px;
            color: #666;
        }

        .floor-type-value {
            color: #c17f59;
            font-weight: 600;
            margin-left: 5px;
        }

        /* Scrollbar styling */
        .panel-content::-webkit-scrollbar {
            width: 4px;
        }

        .panel-content::-webkit-scrollbar-track {
            background: transparent;
        }

        .panel-content::-webkit-scrollbar-thumb {
            background: rgba(193, 127, 89, 0.3);
            border-radius: 2px;
        }

        .panel-content::-webkit-scrollbar-thumb:hover {
            background: rgba(193, 127, 89, 0.5);
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    return panel;
}

function closeFloorPanel() {
    const panel = document.getElementById('floorSelectionPanel');
    if (panel) {
        gsap.to(panel, {
            x: 350,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                panel.classList.add('hidden');
            }
        });
    }
    closeFloorModal();
}

function bookFloor(floorIndex, data) {
    // Show booking confirmation
    const toast = document.createElement('div');
    toast.id = 'bookingToast';
    toast.innerHTML = `
        <div class="booking-toast-content">
            <div class="booking-icon">✓</div>
            <div class="booking-title">Booking Request</div>
            <div class="booking-message">You've requested to book ${data.name}</div>
            <div class="booking-details">${data.seats} seats • ${data.pricing}</div>
            <div class="booking-note">Our team will contact you shortly!</div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        #bookingToast {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 300;
            animation: bookingIn 0.4s ease, bookingOut 0.4s ease 3s forwards;
        }

        @keyframes bookingIn {
            from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes bookingOut {
            from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            to { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
        }

        .booking-toast-content {
            background: linear-gradient(145deg, rgba(20, 20, 25, 0.98), rgba(15, 15, 20, 0.98));
            border: 1px solid rgba(78, 205, 196, 0.4);
            border-radius: 20px;
            padding: 30px 40px;
            text-align: center;
            backdrop-filter: blur(20px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(78, 205, 196, 0.2);
        }

        .booking-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
            color: #fff;
            font-size: 30px;
            line-height: 60px;
            margin: 0 auto 20px;
            box-shadow: 0 4px 20px rgba(78, 205, 196, 0.4);
        }

        .booking-title {
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            margin-bottom: 8px;
        }

        .booking-message {
            font-size: 14px;
            color: #888;
            margin-bottom: 10px;
        }

        .booking-details {
            font-size: 16px;
            font-weight: 600;
            color: #4ecdc4;
            margin-bottom: 15px;
        }

        .booking-note {
            font-size: 12px;
            color: #666;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(toast);

    // Close panel
    closeFloorPanel();

    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3500);
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

    // Animate flag wave
    if (environmentObjects.flag) {
        animateFlag(time);
    }

    // Animate clouds movement
    if (skyElements.clouds) {
        animateClouds(time);
    }

    // Animate interior lights (subtle flickering)
    if (lights.interiorLights) {
        animateInteriorLights(time);
    }

    // Animate stars twinkling at night
    if (skyElements.stars && isNightMode) {
        animateStars(time);
    }

    renderer.render(scene, camera);
}

function animateFlag(time) {
    const flag = environmentObjects.flag;
    if (!flag || !flag.geometry) return;

    const positions = flag.geometry.attributes.position;
    const originalPositions = flag.geometry.attributes.originalPosition;

    // Store original positions if not stored
    if (!originalPositions) {
        flag.geometry.setAttribute('originalPosition', positions.clone());
        return;
    }

    // Wave animation
    for (let i = 0; i < positions.count; i++) {
        const x = originalPositions.getX(i);
        const y = originalPositions.getY(i);

        // Create wave based on x position (further from pole = more movement)
        const wave = Math.sin(time * 3 + x * 0.5) * 0.15 * (x / 2);
        const wave2 = Math.sin(time * 5 + y * 0.3) * 0.05;

        positions.setZ(i, wave + wave2);
    }

    positions.needsUpdate = true;
}

function animateClouds(time) {
    if (!skyElements.clouds) return;

    skyElements.clouds.children.forEach(cloud => {
        // Move clouds slowly
        cloud.position.x += cloud.userData.speed * 0.01;

        // Reset position when out of view
        if (cloud.position.x > 80) {
            cloud.position.x = -80;
        }
    });
}

function animateInteriorLights(time) {
    if (!lights.interiorLights) return;

    lights.interiorLights.forEach((item, index) => {
        // Subtle flickering effect
        const flicker = Math.sin(time * 10 + index * 2) * 0.1;
        item.light.intensity = item.baseIntensity + flicker;
    });
}

function animateStars(time) {
    if (!skyElements.stars) return;

    // Subtle twinkling
    skyElements.stars.rotation.y = time * 0.01;
}
