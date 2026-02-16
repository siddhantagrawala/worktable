import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import './ThreeDLanding.css';

// Floor data with interior details
const floorData = [
    {
        id: 0,
        name: 'Ground Floor',
        status: 'lobby',
        seats: 0,
        pricing: 'N/A',
        description: 'Reception & Lobby',
        amenities: ['Reception Desk', 'Waiting Area', 'Security', 'Lift Lobby']
    },
    {
        id: 1,
        name: 'Floor 1',
        status: 'available',
        seats: 80,
        pricing: '₹1,500/slot',
        description: 'Open Desks + Meeting Rooms',
        amenities: ['Open Desks (20)', 'Meeting Room A', 'Meeting Room B', 'Pantry']
    },
    {
        id: 2,
        name: 'Floor 2',
        status: 'available',
        seats: 80,
        pricing: '₹1,500/slot',
        description: 'Open Desks + Private Cabins',
        amenities: ['Open Desks (20)', 'Private Cabins (6)', 'Manager Cabins', 'Server Room']
    },
    {
        id: 3,
        name: 'Floor 3',
        status: 'available',
        seats: 80,
        pricing: '₹1,500/slot',
        description: 'Manager Cabins + Open Area',
        amenities: ['Manager Cabins (9)', 'Open Desks', 'Discussion Area', 'Print Station']
    },
    {
        id: 4,
        name: 'Floor 4',
        status: 'premium',
        seats: 80,
        pricing: '₹2,000/slot',
        description: 'Premium Open Seating',
        amenities: ['Premium Desks', 'Lounge Area', 'Focus Zones', 'Wellness Room']
    },
    {
        id: 5,
        name: 'Floor 5',
        status: 'premium',
        seats: 80,
        pricing: '₹2,500/slot',
        description: 'Premium Private Cabins',
        amenities: ['Premium Cabins', 'Executive Lounge', 'Board Room', 'Private Pantry']
    },
    {
        id: 6,
        name: 'Floor 6',
        status: 'available',
        seats: 80,
        pricing: '₹1,800/slot',
        description: 'Enterprise Solutions',
        amenities: ['Enterprise Desks', 'Training Room', 'Event Space', 'Client Suite']
    },
];

// Generate workspaces for a floor (80 total per floor)
const generateWorkspaces = (floorId) => {
    const workspaces = [];
    const occupiedCount = Math.floor(Math.random() * 30) + 15; // 15-45 occupied

    for (let i = 0; i < 80; i++) {
        workspaces.push({
            id: i + 1,
            name: `WS-${String(i + 1).padStart(2, '0')}`,
            status: i < occupiedCount ? 'occupied' : 'available',
            type: i < 60 ? 'desk' : (i < 70 ? 'standing' : 'booth'),
            price: floorId >= 4 ? 2000 : 1500
        });
    }
    return workspaces;
};

export default function ThreeDLanding() {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [isInside, setIsInside] = useState(false);
    const [currentInteriorFloor, setCurrentInteriorFloor] = useState(1);
    const [showEnterPrompt, setShowEnterPrompt] = useState(true);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState(generateWorkspaces(1));

    // Update workspaces when floor changes
    useEffect(() => {
        setWorkspaces(generateWorkspaces(currentInteriorFloor));
        setSelectedWorkspace(null);
    }, [currentInteriorFloor]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a12);
        scene.fog = new THREE.FogExp2(0x0a0a12, 0.008);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(40, 30, 40);

        // Renderer with enhanced settings
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2.05;
        controls.target.set(0, 10, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;

        // State
        let isInsideMode = false;
        let interiorFloor = 1;
        const floorHeight = 4;
        const floorWidth = 18;
        const floorDepth = 14;

        // ============= ENHANCED LIGHTING =============
        // Ambient
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        scene.add(ambientLight);

        // Main sun light with soft shadows
        const sunLight = new THREE.DirectionalLight(0xffeedd, 1.5);
        sunLight.position.set(30, 50, 25);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 3072;
        sunLight.shadow.mapSize.height = 3072;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 150;
        sunLight.shadow.camera.left = -40;
        sunLight.shadow.camera.right = 40;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -20;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.normalBias = 0.02;
        scene.add(sunLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
        fillLight.position.set(-20, 20, -20);
        scene.add(fillLight);

        // Rim light for dramatic effect
        const rimLight = new THREE.DirectionalLight(0xffaa77, 0.6);
        rimLight.position.set(-30, 40, 30);
        scene.add(rimLight);

        // Interior lights (for each floor)
        const interiorLights = [];
        for (let i = 1; i <= 6; i++) {
            const light = new THREE.PointLight(0xfff5e6, 0, 20, 2);
            light.position.set(0, i * floorHeight + 1, 0);
            scene.add(light);
            interiorLights.push(light);
        }

        // Accent spotlights on building
        const accentSpot1 = new THREE.SpotLight(0xc17f59, 150, 80, Math.PI / 6, 0.4, 1);
        accentSpot1.position.set(-15, 35, 15);
        accentSpot1.target.position.set(0, 10, 0);
        scene.add(accentSpot1);
        scene.add(accentSpot1.target);

        const accentSpot2 = new THREE.SpotLight(0x4ecdc4, 100, 80, Math.PI / 6, 0.4, 1);
        accentSpot2.position.set(15, 35, -15);
        accentSpot2.target.position.set(0, 10, 0);
        scene.add(accentSpot2);
        scene.add(accentSpot2.target);

        // ============= ENVIRONMENT =============
        // Enhanced ground with texture
        const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1f,
            roughness: 0.85,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        scene.add(ground);

        // Decorative ground lines
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.9 });
        for (let i = -5; i <= 5; i++) {
            const lineH = new THREE.Mesh(new THREE.BoxGeometry(100, 0.02, 0.15), lineMat);
            lineH.position.set(0, 0.01, i * 10);
            scene.add(lineH);

            const lineV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 100), lineMat);
            lineV.position.set(i * 10, 0.01, 0);
            scene.add(lineV);
        }

        // Parking lot with better detail
        const parkingMat = new THREE.MeshStandardMaterial({ color: 0x252530, roughness: 0.75 });
        const parkingLineMat = new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.5 });
        for (let i = -3; i <= 3; i++) {
            const parking = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 5.2), parkingMat);
            parking.position.set(i * 4.5, 0.05, 22);
            parking.receiveShadow = true;
            scene.add(parking);

            // Parking lines
            const pLine = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 4.5), parkingLineMat);
            pLine.position.set(i * 4.5 + 1.5, 0.06, 22);
            scene.add(pLine);
        }

        // Pathway to entrance
        const pathMat = new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7 });
        const pathway = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 15), pathMat);
        pathway.position.set(0, 0.04, 12);
        pathway.receiveShadow = true;
        scene.add(pathway);

        // Landscaping - decorative plants around building
        const plantMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.8 });
        const potMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.2 });

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const radius = 12;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Pot
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.5, 1, 8),
                potMat
            );
            pot.position.set(x, 0.5, z);
            pot.castShadow = true;
            scene.add(pot);

            // Plant
            const plant = new THREE.Mesh(
                new THREE.SphereGeometry(0.8, 8, 6),
                plantMat
            );
            plant.position.set(x, 1.4, z);
            plant.scale.y = 1.3;
            plant.castShadow = true;
            scene.add(plant);
        }

        // ============= BUILDING =============
        const floors = [];
        const floorGroups = [];

        // Building materials
        const concreteMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a30,
            roughness: 0.85,
            metalness: 0.05
        });

        const floorSurfaceMat = new THREE.MeshStandardMaterial({
            color: 0x3a4a40,
            roughness: 0.4,
            metalness: 0.15
        });

        for (let i = 0; i < 7; i++) {
            const group = new THREE.Group();
            group.userData = { floorIndex: i, data: floorData[i] };

            // Floor colors - premium feel
            let floorColor = 0x2d4a3d;
            let accentColor = 0xc17f59;
            if (i === 0) {
                floorColor = 0x3d3d5a;
                accentColor = 0x4ecdc4;
            } else if (i >= 4) {
                floorColor = 0x4a3d2d;
                accentColor = 0xe8a87c;
            }

            // === ENHANCED FLOOR SLAB ===
            // Main slab
            const slabGeo = new THREE.BoxGeometry(floorWidth, 0.35, floorDepth);
            const slabMat = new THREE.MeshStandardMaterial({
                color: 0x252530,
                roughness: 0.7,
                metalness: 0.1
            });
            const slab = new THREE.Mesh(slabGeo, slabMat);
            slab.position.y = -floorHeight / 2;
            slab.receiveShadow = true;
            slab.castShadow = true;
            group.add(slab);

            // Floor surface with carpet/tile look
            const surfaceGeo = new THREE.BoxGeometry(floorWidth - 0.8, 0.12, floorDepth - 0.8);
            const surfaceMat = new THREE.MeshStandardMaterial({
                color: floorColor,
                roughness: 0.45,
                metalness: 0.1
            });
            const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
            surface.position.y = -floorHeight / 2 + 0.23;
            surface.receiveShadow = true;
            group.add(surface);

            // === FLOOR EDGE DETAIL ===
            const edgeMat = new THREE.MeshStandardMaterial({
                color: accentColor,
                roughness: 0.3,
                metalness: 0.4,
                emissive: accentColor,
                emissiveIntensity: 0.15
            });
            const edgeGeo = new THREE.BoxGeometry(floorWidth + 0.2, 0.08, 0.08);
            const edgeFront = new THREE.Mesh(edgeGeo, edgeMat);
            edgeFront.position.set(0, -floorHeight / 2 + 0.3, floorDepth / 2 - 0.3);
            group.add(edgeFront);
            const edgeBack = new THREE.Mesh(edgeGeo, edgeMat);
            edgeBack.position.set(0, -floorHeight / 2 + 0.3, -floorDepth / 2 + 0.3);
            group.add(edgeBack);

            // === ENHANCED INTERIOR ===
            if (i > 0) {
                // Desk materials - modern wood + metal
                const deskMat = new THREE.MeshStandardMaterial({
                    color: 0x5a4a3a,
                    roughness: 0.4,
                    metalness: 0.1
                });
                const deskLegMat = new THREE.MeshStandardMaterial({
                    color: 0x3a3a3a,
                    roughness: 0.3,
                    metalness: 0.6
                });
                const chairMat = new THREE.MeshStandardMaterial({
                    color: accentColor,
                    roughness: 0.5,
                    metalness: 0.2
                });
                const accentMat = new THREE.MeshStandardMaterial({
                    color: 0x4ecdc4,
                    roughness: 0.3,
                    metalness: 0.5,
                    emissive: 0x4ecdc4,
                    emissiveIntensity: 0.15
                });
                const monitorMat = new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
                const grayMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });

                // === REGULAR DESKS (60 desks) ===
                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 5; col++) {
                        const xPos = -4.5 + col * 2.2;
                        const zPos = -4 + row * 2.4;

                        // Desk top with rounded edge simulation
                        const desk = new THREE.Mesh(
                            new THREE.BoxGeometry(1.85, 0.06, 0.9),
                            deskMat.clone()
                        );
                        desk.position.set(xPos, -1.55, zPos);
                        desk.castShadow = true;
                        desk.receiveShadow = true;
                        group.add(desk);

                        // Desk drawer unit
                        const drawer = new THREE.Mesh(
                            new THREE.BoxGeometry(0.4, 0.35, 0.5),
                            grayMat
                        );
                        drawer.position.set(xPos + 0.6, -1.65, zPos + 0.1);
                        drawer.castShadow = true;
                        group.add(drawer);

                        // Desk legs (modern metal)
                        const legGeo = new THREE.BoxGeometry(0.05, 1.5, 0.05);
                        const legPositions = [
                            [xPos - 0.75, zPos - 0.3],
                            [xPos + 0.75, zPos - 0.3],
                            [xPos - 0.75, zPos + 0.3],
                            [xPos + 0.75, zPos + 0.3]
                        ];
                        legPositions.forEach(pos => {
                            const leg = new THREE.Mesh(legGeo, deskLegMat);
                            leg.position.set(pos[0], -2.3, pos[1]);
                            leg.castShadow = true;
                            group.add(leg);
                        });

                        // CPU holder
                        const cpu = new THREE.Mesh(
                            new THREE.BoxGeometry(0.18, 0.35, 0.4),
                            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.3 })
                        );
                        cpu.position.set(xPos - 0.75, -2.15, zPos + 0.3);
                        cpu.castShadow = true;
                        group.add(cpu);

                        // Monitor on desk
                        const monitor = new THREE.Mesh(
                            new THREE.BoxGeometry(0.55, 0.38, 0.04),
                            monitorMat
                        );
                        monitor.position.set(xPos, -1.22, zPos - 0.28);
                        group.add(monitor);

                        // Monitor stand
                        const stand = new THREE.Mesh(
                            new THREE.BoxGeometry(0.06, 0.12, 0.06),
                            monitorMat
                        );
                        stand.position.set(xPos, -1.36, zPos - 0.28);
                        group.add(stand);

                        const standBase = new THREE.Mesh(
                            new THREE.BoxGeometry(0.2, 0.02, 0.15),
                            monitorMat
                        );
                        standBase.position.set(xPos, -1.52, zPos - 0.28);
                        group.add(standBase);

                        // LED lamp on desk
                        const lampBase = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.06, 0.08, 0.03, 12),
                            new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 })
                        );
                        lampBase.position.set(xPos + 0.7, -1.51, zPos - 0.25);
                        group.add(lampBase);

                        const lampPole = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
                            new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.7 })
                        );
                        lampPole.position.set(xPos + 0.7, -1.38, zPos - 0.25);
                        group.add(lampPole);

                        const lampHead = new THREE.Mesh(
                            new THREE.BoxGeometry(0.12, 0.04, 0.08),
                            new THREE.MeshStandardMaterial({
                                color: 0xffffff,
                                emissive: 0xfff5e6,
                                emissiveIntensity: 0.8
                            })
                        );
                        lampHead.position.set(xPos + 0.7, -1.24, zPos - 0.25);
                        group.add(lampHead);

                        // Chair with better design
                        const seat = new THREE.Mesh(
                            new THREE.BoxGeometry(0.52, 0.07, 0.48),
                            chairMat.clone()
                        );
                        seat.position.set(xPos, -1.8, zPos - 0.7);
                        seat.castShadow = true;
                        group.add(seat);

                        const backrest = new THREE.Mesh(
                            new THREE.BoxGeometry(0.48, 0.42, 0.05),
                            chairMat.clone()
                        );
                        backrest.position.set(xPos, -2.02, zPos - 0.92);
                        group.add(backrest);

                        // Chair armrests
                        [-0.22, 0.22].forEach(xOff => {
                            const armrest = new THREE.Mesh(
                                new THREE.BoxGeometry(0.05, 0.25, 0.25),
                                new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                            );
                            armrest.position.set(xPos + xOff, -1.65, zPos - 0.55);
                            group.add(armrest);
                        });

                        // Keyboard on desk
                        const keyboard = new THREE.Mesh(
                            new THREE.BoxGeometry(0.42, 0.015, 0.12),
                            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
                        );
                        keyboard.position.set(xPos, -1.51, zPos - 0.12);
                        group.add(keyboard);

                        // Mousepad
                        const mousepad = new THREE.Mesh(
                            new THREE.BoxGeometry(0.18, 0.01, 0.15),
                            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
                        );
                        mousepad.position.set(xPos + 0.35, -1.51, zPos - 0.12);
                        group.add(mousepad);

                        // Coffee mug on desk
                        const mug = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.035, 0.03, 0.06, 12),
                            new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.4 })
                        );
                        mug.position.set(xPos - 0.65, -1.51, zPos + 0.2);
                        group.add(mug);

                        // Desk plant (small)
                        const smallPot = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.04, 0.035, 0.06, 8),
                            new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.5 })
                        );
                        smallPot.position.set(xPos + 0.65, -1.51, zPos + 0.25);
                        group.add(smallPot);

                        const smallPlant = new THREE.Mesh(
                            new THREE.SphereGeometry(0.04, 6, 4),
                            new THREE.MeshStandardMaterial({ color: 0x3d6a4d, roughness: 0.7 })
                        );
                        smallPlant.position.set(xPos + 0.65, -1.47, zPos + 0.25);
                        group.add(smallPlant);
                    }
                }

                // === STANDING DESKS (10 desks) - along side walls ===
                for (let s = 0; s < 5; s++) {
                    // Left side standing desks
                    const sxPos = -8.2;
                    const szPos = -4 + s * 2.2;

                    const sDesk = new THREE.Mesh(
                        new THREE.BoxGeometry(1.2, 0.05, 0.7),
                        deskMat.clone()
                    );
                    sDesk.position.set(sxPos, -0.8, szPos);
                    sDesk.castShadow = true;
                    group.add(sDesk);

                    // Standing desk legs
                    const sLeg1 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.04, 0.8, 0.04),
                        deskLegMat
                    );
                    sLeg1.position.set(sxPos - 0.5, -1.2, szPos);
                    group.add(sLeg1);

                    const sLeg2 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.04, 0.8, 0.04),
                        deskLegMat
                    );
                    sLeg2.position.set(sxPos + 0.5, -1.2, szPos);
                    group.add(sLeg2);

                    // Monitor on standing desk
                    const sMonitor = new THREE.Mesh(
                        new THREE.BoxGeometry(0.45, 0.3, 0.04),
                        monitorMat
                    );
                    sMonitor.position.set(sxPos, -0.5, szPos - 0.2);
                    group.add(sMonitor);

                    // Monitor arm
                    const sArm = new THREE.Mesh(
                        new THREE.BoxGeometry(0.03, 0.25, 0.03),
                        deskLegMat
                    );
                    sArm.position.set(sxPos, -0.65, szPos - 0.2);
                    group.add(sArm);

                    // Right side standing desks
                    const sxPos2 = 8.2;
                    const szPos2 = -4 + s * 2.2;

                    const sDesk2 = new THREE.Mesh(
                        new THREE.BoxGeometry(1.2, 0.05, 0.7),
                        deskMat.clone()
                    );
                    sDesk2.position.set(sxPos2, -0.8, szPos2);
                    sDesk2.castShadow = true;
                    group.add(sDesk2);

                    const sLeg3 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.04, 0.8, 0.04),
                        deskLegMat
                    );
                    sLeg3.position.set(sxPos2 - 0.5, -1.2, szPos2);
                    group.add(sLeg3);

                    const sLeg4 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.04, 0.8, 0.04),
                        deskLegMat
                    );
                    sLeg4.position.set(sxPos2 + 0.5, -1.2, szPos2);
                    group.add(sLeg4);

                    const sMonitor2 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.45, 0.3, 0.04),
                        monitorMat
                    );
                    sMonitor2.position.set(sxPos2, -0.5, szPos2 - 0.2);
                    group.add(sMonitor2);
                }

                // === PHONE BOOTHS (4 booths) ===
                const boothPositions = [
                    { x: -7, z: 5 },
                    { x: 7, z: 5 },
                    { x: -7, z: -5.5 },
                    { x: 7, z: -5.5 }
                ];

                boothPositions.forEach(bp => {
                    // Phone booth frame
                    const boothMat = new THREE.MeshStandardMaterial({
                        color: 0x3a3a3a,
                        roughness: 0.4,
                        metalness: 0.5
                    });

                    // Booth walls (partial enclosure)
                    const boothWall1 = new THREE.Mesh(
                        new THREE.BoxGeometry(0.08, 2.2, 1.8),
                        boothMat
                    );
                    boothWall1.position.set(bp.x - 0.8, -0.9, bp.z);
                    boothWall1.castShadow = true;
                    group.add(boothWall1);

                    const boothWall2 = new THREE.Mesh(
                        new THREE.BoxGeometry(1.6, 2.2, 0.08),
                        boothMat
                    );
                    boothWall2.position.set(bp.x, -0.9, bp.z - 0.9);
                    boothWall2.castShadow = true;
                    group.add(boothWall2);

                    // Booth ceiling
                    const boothCeiling = new THREE.Mesh(
                        new THREE.BoxGeometry(1.7, 0.08, 1.9),
                        boothMat
                    );
                    boothCeiling.position.set(bp.x, 0.2, bp.z);
                    group.add(boothCeiling);

                    // Sound-absorbing panels inside
                    const panelMat = new THREE.MeshStandardMaterial({
                        color: 0x2d4a3d,
                        roughness: 0.9
                    });
                    const panel = new THREE.Mesh(
                        new THREE.BoxGeometry(1.4, 1.8, 0.05),
                        panelMat
                    );
                    panel.position.set(bp.x, -0.9, bp.z + 0.85);
                    group.add(panel);

                    // Small desk in booth
                    const bDesk = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.04, 0.4),
                        deskMat.clone()
                    );
                    bDesk.position.set(bp.x, -1.5, bp.z + 0.3);
                    group.add(bDesk);

                    // Bar stool in booth
                    const stoolSeat = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.18, 0.15, 0.04, 12),
                        chairMat.clone()
                    );
                    stoolSeat.position.set(bp.x, -1.7, bp.z + 0.7);
                    group.add(stoolSeat);

                    const stoolLeg = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8),
                        deskLegMat
                    );
                    stoolLeg.position.set(bp.x, -2.05, bp.z + 0.7);
                    group.add(stoolLeg);

                    const stoolBase = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12),
                        deskLegMat
                    );
                    stoolBase.position.set(bp.x, -2.38, bp.z + 0.7);
                    group.add(stoolBase);
                });

                // === PANTRY AREA ===
                const pantryX = 5;
                const pantryZ = 4;

                // Pantry counter
                const counterMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.4 });
                const counter = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.9, 0.6),
                    counterMat
                );
                counter.position.set(pantryX, -1.55, pantryZ);
                counter.castShadow = true;
                group.add(counter);

                // Counter top
                const counterTop = new THREE.Mesh(
                    new THREE.BoxGeometry(3.1, 0.05, 0.7),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.2, metalness: 0.6 })
                );
                counterTop.position.set(pantryX, -1.07, pantryZ);
                group.add(counterTop);

                // Coffee machine
                const coffeeMachine = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.35, 0.25),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.7 })
                );
                coffeeMachine.position.set(pantryX - 0.8, -0.82, pantryZ);
                group.add(coffeeMachine);

                // Coffee machine display
                const coffeeDisplay = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.08, 0.02),
                    new THREE.MeshStandardMaterial({
                        color: 0x00ff00,
                        emissive: 0x00ff00,
                        emissiveIntensity: 0.5
                    })
                );
                coffeeDisplay.position.set(pantryX - 0.8, -0.72, pantryZ + 0.13);
                group.add(coffeeDisplay);

                // Sink
                const sink = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.12, 0.3),
                    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 })
                );
                sink.position.set(pantryX - 0.2, -1.0, pantryZ);
                group.add(sink);

                // Fridge
                const fridge = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 1.5, 0.6),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.3, metalness: 0.5 })
                );
                fridge.position.set(pantryX + 1, -0.75, pantryZ);
                fridge.castShadow = true;
                group.add(fridge);

                // Microwave
                const microwave = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45, 0.28, 0.35),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.4 })
                );
                microwave.position.set(pantryX + 0.4, -0.9, pantryZ);
                group.add(microwave);

                // Water dispenser
                const waterDispenser = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 1.1, 0.3),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.3 })
                );
                waterDispenser.position.set(pantryX - 1.2, -0.95, pantryZ);
                group.add(waterDispenser);

                // Pantry shelves
                for (let sh = 0; sh < 3; sh++) {
                    const shelf = new THREE.Mesh(
                        new THREE.BoxGeometry(1.5, 0.03, 0.3),
                        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.3 })
                    );
                    shelf.position.set(pantryX + 1, -0.2 + sh * 0.5, pantryZ - 0.35);
                    group.add(shelf);
                }

                // === FOCUS PODS (2 pods) ===
                const podPositions = [
                    { x: -5, z: -5 },
                    { x: 0, z: -5 }
                ];

                podPositions.forEach(pp => {
                    // Oval pod
                    const podMat = new THREE.MeshStandardMaterial({
                        color: 0x4a3d2d,
                        roughness: 0.6,
                        metalness: 0.2
                    });

                    const podBase = new THREE.Mesh(
                        new THREE.CylinderGeometry(1, 1, 0.15, 16),
                        podMat
                    );
                    podBase.position.set(pp.x, -1.93, pp.z);
                    podBase.castShadow = true;
                    group.add(podBase);

                    // Pod seat
                    const podSeat = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.3, 0.6),
                        chairMat.clone()
                    );
                    podSeat.position.set(pp.x, -1.65, pp.z);
                    group.add(podSeat);

                    // Pod back
                    const podBack = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.8, 0.1),
                        podMat
                    );
                    podBack.position.set(pp.x, -1.35, pp.z - 0.3);
                    group.add(podBack);

                    // Small table in front
                    const podTable = new THREE.Mesh(
                        new THREE.BoxGeometry(0.5, 0.35, 0.35),
                        deskMat.clone()
                    );
                    podTable.position.set(pp.x, -1.63, pp.z + 0.6);
                    group.add(podTable);
                });

                // === PRINT STATION ===
                const printX = -7;
                const printZ = 2;

                // Printer table
                const printTable = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.75, 0.5),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.3 })
                );
                printTable.position.set(printX, -1.63, printZ);
                printTable.castShadow = true;
                group.add(printTable);

                // Printer
                const printer = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.2, 0.35),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.4 })
                );
                printer.position.set(printX, -1.1, printZ);
                group.add(printer);

                // Printer paper output
                const paperStack = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.02, 0.25),
                    whiteMat
                );
                paperStack.position.set(printX, -1.18, printZ + 0.15);
                group.add(paperStack);

                // Bulletin board above print station
                const board = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 0.6, 0.03),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 })
                );
                board.position.set(printX, 0.3, printZ - 0.27);
                group.add(board);

                // Notices on board (colorful papers)
                for (let n = 0; n < 3; n++) {
                    const notice = new THREE.Mesh(
                        new THREE.BoxGeometry(0.15, 0.18, 0.01),
                        new THREE.MeshStandardMaterial({
                            color: n === 0 ? 0xffeeaa : (n === 1 ? 0xaaffaa : 0xaaaaff),
                            roughness: 0.9
                        })
                    );
                    notice.position.set(printX - 0.2 + n * 0.2, 0.3, printZ - 0.24);
                    group.add(notice);
                }

                // === IMPROVED MEETING ROOM ===
                const roomGeo = new THREE.BoxGeometry(4.5, 2.8, 3.5);
                const roomMat = new THREE.MeshPhysicalMaterial({
                    color: 0xaaddff,
                    metalness: 0.05,
                    roughness: 0.05,
                    transmission: 0.7,
                    transparent: true,
                    opacity: 0.2,
                    thickness: 0.1
                });
                const meetingRoom = new THREE.Mesh(roomGeo, roomMat);
                meetingRoom.position.set(4.5, -0.6, -4.5);
                group.add(meetingRoom);

                // Meeting room frame
                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0x4a4a4a,
                    roughness: 0.3,
                    metalness: 0.7
                });
                const frameGeo = new THREE.BoxGeometry(4.55, 0.06, 3.55);
                const frameTop = new THREE.Mesh(frameGeo, frameMat);
                frameTop.position.set(4.5, 0.8, -4.5);
                group.add(frameTop);

                // Meeting room floor mat
                const roomMat2 = new THREE.MeshStandardMaterial({
                    color: 0x2a3530,
                    roughness: 0.7
                });
                const roomFloor = new THREE.Mesh(
                    new THREE.BoxGeometry(4.3, 0.02, 3.3),
                    roomMat2
                );
                roomFloor.position.set(4.5, -1.89, -4.5);
                group.add(roomFloor);

                // Meeting table - oval shape approximation
                const tableGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.08, 24);
                const tableMat = new THREE.MeshStandardMaterial({
                    color: 0x3a3a3a,
                    roughness: 0.3,
                    metalness: 0.4
                });
                const table = new THREE.Mesh(tableGeo, tableMat);
                table.position.set(4.5, -1.2, -4.5);
                table.castShadow = true;
                group.add(table);

                // Table legs
                for (let t = 0; t < 4; t++) {
                    const angle = (t / 4) * Math.PI * 2;
                    const leg = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
                        frameMat
                    );
                    leg.position.set(
                        4.5 + Math.cos(angle) * 0.9,
                        -1.8,
                        -4.5 + Math.sin(angle) * 0.9
                    );
                    group.add(leg);
                }

                // Meeting chairs around table
                for (let c = 0; c < 8; c++) {
                    const angle = (c / 8) * Math.PI * 2;
                    const mChair = new THREE.Mesh(
                        new THREE.BoxGeometry(0.45, 0.08, 0.45),
                        accentMat.clone()
                    );
                    mChair.position.set(
                        4.5 + Math.cos(angle) * 1.5,
                        -1.65,
                        -4.5 + Math.sin(angle) * 1.5
                    );
                    mChair.rotation.y = -angle;
                    group.add(mChair);

                    const mBack = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.5, 0.05),
                        accentMat.clone()
                    );
                    mBack.position.set(
                        4.5 + Math.cos(angle) * 1.5,
                        -1.9,
                        -4.5 + Math.sin(angle) * 1.5 + Math.cos(angle) * 0.25
                    );
                    mBack.rotation.y = -angle;
                    group.add(mBack);
                }

                // === MEETING ROOM WALL MOUNTED ITEMS ===
                // TV Screen on wall
                const tvFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(1.8, 1.1, 0.08),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.5 })
                );
                tvFrame.position.set(4.5, -0.3, -6.19);
                group.add(tvFrame);

                const tvScreen = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.95, 0.02),
                    new THREE.MeshStandardMaterial({
                        color: 0x111122,
                        roughness: 0.1,
                        metalness: 0.8,
                        emissive: 0x111133,
                        emissiveIntensity: 0.3
                    })
                );
                tvScreen.position.set(4.5, -0.3, -6.14);
                group.add(tvScreen);

                // TV mount
                const tvMount = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.6, 0.15),
                    frameMat
                );
                tvMount.position.set(4.5, -0.85, -6.22);
                group.add(tvMount);

                // Whiteboard
                const whiteboard = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 1, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
                );
                whiteboard.position.set(6.7, -0.3, -4.5);
                group.add(whiteboard);

                // Whiteboard frame
                const wbFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(1.55, 1.05, 0.02),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                );
                wbFrame.position.set(6.7, -0.3, -4.47);
                group.add(wbFrame);

                // Whiteboard markers tray
                const wbTray = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.03, 0.08),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                );
                wbTray.position.set(6.7, -0.82, -4.47);
                group.add(wbTray);

                // Markers on tray
                const markerColors = [0xff0000, 0x0000ff, 0x00ff00, 0x000000];
                for (let m = 0; m < 4; m++) {
                    const marker = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8),
                        new THREE.MeshStandardMaterial({ color: markerColors[m], roughness: 0.5 })
                    );
                    marker.rotation.z = Math.PI / 2;
                    marker.position.set(6.7 - 0.4 + m * 0.25, -0.78, -4.45);
                    group.add(marker);
                }

                // Conference phone on table
                const confPhone = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 0.04, 16),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 })
                );
                confPhone.position.set(4.5, -1.14, -4.5);
                group.add(confPhone);

                // Phone buttons (small circles)
                for (let pb = 0; pb < 5; pb++) {
                    const btn = new THREE.Mesh(
                        new THREE.CircleGeometry(0.015, 8),
                        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 })
                    );
                    btn.position.set(4.5 + Math.cos(pb * 0.8 - 0.4) * 0.05, -1.12, -4.5 + Math.sin(pb * 0.8 - 0.4) * 0.05);
                    group.add(btn);
                }

                // === SECOND MEETING ROOM (smaller) ===
                const room2X = -5;
                const room2Z = -5;

                // Small meeting room glass
                const room2Mat = new THREE.MeshPhysicalMaterial({
                    color: 0xaaddff,
                    metalness: 0.05,
                    roughness: 0.05,
                    transmission: 0.7,
                    transparent: true,
                    opacity: 0.2
                });
                const meetingRoom2 = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 2.4, 2.5),
                    room2Mat
                );
                meetingRoom2.position.set(room2X, -0.8, room2Z);
                group.add(meetingRoom2);

                // Small room table
                const smallTable = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.6, 0.6, 0.06, 16),
                    tableMat
                );
                smallTable.position.set(room2X, -1.35, room2Z);
                smallTable.castShadow = true;
                group.add(smallTable);

                // Small table leg
                const smallLeg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.06, 1.3, 8),
                    frameMat
                );
                smallLeg.position.set(room2X, -2, room2Z);
                group.add(smallLeg);

                // Small room chairs (4)
                for (let sc = 0; sc < 4; sc++) {
                    const sAngle = (sc / 4) * Math.PI * 2;
                    const sChair = new THREE.Mesh(
                        new THREE.BoxGeometry(0.4, 0.07, 0.4),
                        chairMat.clone()
                    );
                    sChair.position.set(
                        room2X + Math.cos(sAngle) * 0.9,
                        -1.75,
                        room2Z + Math.sin(sAngle) * 0.9
                    );
                    sChair.rotation.y = -sAngle;
                    group.add(sChair);
                }

                // TV in small room
                const smallTv = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 0.6, 0.05),
                    new THREE.MeshStandardMaterial({
                        color: 0x111111,
                        roughness: 0.1,
                        emissive: 0x111122,
                        emissiveIntensity: 0.2
                    })
                );
                smallTv.position.set(room2X + 1.55, -0.5, room2Z);
                group.add(smallTv);

                // === PRIVATE CABINS ===
                const cabinPositions = [
                    { x: -6, z: 4.5 },
                    { x: -1.5, z: 4.5 },
                    { x: 3, z: 4.5 },
                    { x: -6, z: 0 },
                    { x: -1.5, z: 0 },
                    { x: 3, z: 0 }
                ];

                cabinPositions.forEach((pos, idx) => {
                    // Cabin glass walls
                    const cabinGeo = new THREE.BoxGeometry(3.8, 2.5, 3.2);
                    const cabinMat = new THREE.MeshPhysicalMaterial({
                        color: 0xccffee,
                        metalness: 0.1,
                        roughness: 0.15,
                        transmission: 0.6,
                        transparent: true,
                        opacity: 0.2
                    });
                    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
                    cabin.position.set(pos.x, -0.75, pos.z);
                    group.add(cabin);

                    // Cabin frame
                    const cabinFrame = new THREE.Mesh(
                        new THREE.BoxGeometry(3.85, 2.55, 0.08),
                        frameMat
                    );
                    cabinFrame.position.set(pos.x, -0.72, pos.z + 1.6);
                    group.add(cabinFrame);

                    // Cabin desk
                    const cDesk = new THREE.Mesh(
                        new THREE.BoxGeometry(1.6, 0.06, 0.75),
                        deskMat.clone()
                    );
                    cDesk.position.set(pos.x, -1.45, pos.z);
                    cDesk.castShadow = true;
                    group.add(cDesk);

                    // Cabin chair
                    const cChair = new THREE.Mesh(
                        new THREE.BoxGeometry(0.55, 0.08, 0.5),
                        chairMat.clone()
                    );
                    cChair.position.set(pos.x, -1.7, pos.z - 0.65);
                    group.add(cChair);

                    // Cabin monitor
                    const cMonitor = new THREE.Mesh(
                        new THREE.BoxGeometry(0.5, 0.35, 0.04),
                        monitorMat
                    );
                    cMonitor.position.set(pos.x, -1.15, pos.z - 0.25);
                    group.add(cMonitor);
                });

                // === PLANTS IN OFFICE ===
                const officePlantMat = new THREE.MeshStandardMaterial({ color: 0x3d6a4d, roughness: 0.7 });
                const officePotMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.5, metalness: 0.3 });
                const plantPositions = [
                    { x: -8, z: 5.5 },
                    { x: 7.5, z: 5.5 },
                    { x: -8, z: -5 },
                    { x: 7.5, z: -5 }
                ];
                plantPositions.forEach(p => {
                    const pot = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.35, 0.3, 0.5, 12),
                        officePotMat
                    );
                    pot.position.set(p.x, -1.75, p.z);
                    pot.castShadow = true;
                    group.add(pot);

                    const plant = new THREE.Mesh(
                        new THREE.ConeGeometry(0.5, 1, 6),
                        officePlantMat
                    );
                    plant.position.set(p.x, -1.2, p.z);
                    plant.castShadow = true;
                    group.add(plant);
                });
            }

            // === GROUND FLOOR LOBBY ===
            if (i === 0) {
                // Reception desk - modern curved design
                const receptionMat = new THREE.MeshStandardMaterial({
                    color: 0x1a1a1a,
                    roughness: 0.25,
                    metalness: 0.6
                });
                const reception = new THREE.Mesh(
                    new THREE.BoxGeometry(7, 1.1, 1.2),
                    receptionMat
                );
                reception.position.set(0, -1.45, -5.5);
                reception.castShadow = true;
                group.add(reception);

                // Reception counter top
                const counterTop = new THREE.Mesh(
                    new THREE.BoxGeometry(7.2, 0.08, 1.4),
                    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.2, metalness: 0.5 })
                );
                counterTop.position.set(0, -0.88, -5.5);
                group.add(counterTop);

                // Reception computer
                const receptionMonitor = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.35, 0.04),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.8 })
                );
                receptionMonitor.position.set(-1.5, -0.5, -4.9);
                group.add(receptionMonitor);

                const receptionKeyboard = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.02, 0.12),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
                );
                receptionKeyboard.position.set(-1.5, -0.82, -4.8);
                group.add(receptionKeyboard);

                // Logo area with glow
                const logoMat = new THREE.MeshStandardMaterial({
                    color: accentColor,
                    emissive: accentColor,
                    emissiveIntensity: 0.8,
                    roughness: 0.3
                });
                const logo = new THREE.Mesh(
                    new THREE.BoxGeometry(4, 1.2, 0.1),
                    logoMat
                );
                logo.position.set(0, 0.2, -6.8);
                group.add(logo);

                // Back wall accent
                const backWall = new THREE.Mesh(
                    new THREE.BoxGeometry(16, 3, 0.2),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.8 })
                );
                backWall.position.set(0, -0.5, -6.9);
                group.add(backWall);

                // Wall art pieces
                const artColors = [0xc17f59, 0x4ecdc4, 0xe8a87c];
                for (let a = 0; a < 3; a++) {
                    const artFrame = new THREE.Mesh(
                        new THREE.BoxGeometry(1.2 + a * 0.3, 0.9 + a * 0.2, 0.05),
                        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5 })
                    );
                    artFrame.position.set(-4 + a * 4, 0.5, -6.85);
                    group.add(artFrame);

                    const artCanvas = new THREE.Mesh(
                        new THREE.BoxGeometry(1 + a * 0.25, 0.7 + a * 0.15, 0.02),
                        new THREE.MeshStandardMaterial({
                            color: artColors[a],
                            roughness: 0.9
                        })
                    );
                    artCanvas.position.set(-4 + a * 4, 0.5, -6.82);
                    group.add(artCanvas);
                }

                // Waiting area sofas (L-shaped)
                const sofaMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.7 });
                const sofaBase = new THREE.Mesh(
                    new THREE.BoxGeometry(2.5, 0.35, 0.9),
                    sofaMat
                );
                sofaBase.position.set(-2.5, -1.63, -2);
                sofaBase.castShadow = true;
                group.add(sofaBase);

                const sofaBack = new THREE.Mesh(
                    new THREE.BoxGeometry(2.5, 0.6, 0.15),
                    sofaMat
                );
                sofaBack.position.set(-2.5, -1.35, -2.38);
                group.add(sofaBack);

                // L-shaped extension
                const sofaExt = new THREE.Mesh(
                    new THREE.BoxGeometry(0.9, 0.35, 1.5),
                    sofaMat
                );
                sofaExt.position.set(-3.55, -1.63, -2.8);
                sofaExt.castShadow = true;
                group.add(sofaExt);

                // Sofa cushions
                for (let c = 0; c < 3; c++) {
                    const cushion = new THREE.Mesh(
                        new THREE.BoxGeometry(0.7, 0.12, 0.5),
                        new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.8 })
                    );
                    cushion.position.set(-2.5 + c * 0.8, -1.32, -2);
                    group.add(cushion);
                }

                // Coffee table
                const coffeeTable = new THREE.Mesh(
                    new THREE.BoxGeometry(1.2, 0.4, 0.6),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.3 })
                );
                coffeeTable.position.set(-2.5, -1.6, -1);
                coffeeTable.castShadow = true;
                group.add(coffeeTable);

                // Magazines on table
                for (let g = 0; g < 3; g++) {
                    const magazine = new THREE.Mesh(
                        new THREE.BoxGeometry(0.2, 0.02, 0.28),
                        new THREE.MeshStandardMaterial({
                            color: g === 0 ? 0xcc3333 : (g === 1 ? 0x3333cc : 0x33cc33),
                            roughness: 0.9
                        })
                    );
                    magazine.position.set(-2.6 + g * 0.15, -1.38, -1 + g * 0.08);
                    magazine.rotation.y = g * 0.2;
                    group.add(magazine);
                }

                // Side tables
                const sideTableMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.5 });
                [-0.5, 0.5].forEach(offset => {
                    const sideTable = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.25, 0.3, 0.5, 16),
                        sideTableMat
                    );
                    sideTable.position.set(-2.5 + offset * 2, -1.55, -2.8);
                    sideTable.castShadow = true;
                    group.add(sideTable);

                    // Table lamp
                    const lampBase = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.06, 0.08, 0.03, 12),
                        sideTableMat
                    );
                    lampBase.position.set(-2.5 + offset * 2, -1.28, -2.8);
                    group.add(lampBase);

                    const lampPole = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8),
                        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.7 })
                    );
                    lampPole.position.set(-2.5 + offset * 2, -1.18, -2.8);
                    group.add(lampPole);

                    const lampShade = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.08, 0.12, 0.15, 12, 1, true),
                        new THREE.MeshStandardMaterial({
                            color: 0xfff5e6,
                            emissive: 0xfff5e6,
                            emissiveIntensity: 0.3,
                            transparent: true,
                            opacity: 0.9,
                            side: THREE.DoubleSide
                        })
                    );
                    lampShade.position.set(-2.5 + offset * 2, -1.08, -2.8);
                    group.add(lampShade);
                });

                // === LIFT/ELEVATOR AREA ===
                const liftX = 5;
                const liftZ = -5;

                // Lift doors
                const liftDoor = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 2.5, 0.1),
                    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 })
                );
                liftDoor.position.set(liftX, -0.25, liftZ);
                group.add(liftDoor);

                // Lift frame
                const liftFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(1.7, 2.7, 0.08),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                );
                liftFrame.position.set(liftX, -0.25, liftZ - 0.06);
                group.add(liftFrame);

                // Lift button panel
                const liftPanel = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.6, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.7 })
                );
                liftPanel.position.set(liftX - 0.6, -0.5, liftZ - 0.08);
                group.add(liftPanel);

                // Lift buttons
                for (let lb = 0; lb < 6; lb++) {
                    const btn = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12),
                        new THREE.MeshStandardMaterial({
                            color: lb === 0 ? 0x00ff00 : 0x666666,
                            emissive: lb === 0 ? 0x00ff00 : 0x000000,
                            emissiveIntensity: 0.3
                        })
                    );
                    btn.rotation.x = Math.PI / 2;
                    btn.position.set(liftX - 0.6, -0.2 + lb * 0.08, liftZ - 0.05);
                    group.add(btn);
                }

                // === INFO KIOSK ===
                const kioskX = 3;
                const kioskZ = 0;

                const kiosk = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 1.5, 0.4),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.5 })
                );
                kiosk.position.set(kioskX, -1.25, kioskZ);
                kiosk.castShadow = true;
                group.add(kiosk);

                // Kiosk screen
                const kioskScreen = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.7, 0.02),
                    new THREE.MeshStandardMaterial({
                        color: 0x111133,
                        emissive: 0x111155,
                        emissiveIntensity: 0.5
                    })
                );
                kioskScreen.position.set(kioskX, -0.8, kioskZ + 0.21);
                group.add(kioskScreen);

                // === SECURITY GATE ===
                const gateX = 0;
                const gateZ = 2;

                // Gate frame
                const gateFrame = new THREE.Mesh(
                    new THREE.BoxGeometry(4, 2.8, 0.15),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.5, metalness: 0.4 })
                );
                gateFrame.position.set(gateX, -0.6, gateZ);
                group.add(gateFrame);

                // Gate barriers
                const gateMat = new THREE.MeshStandardMaterial({ color: 0x5a5a60, roughness: 0.4, metalness: 0.5 });
                for (let gb = 0; gb < 8; gb++) {
                    const gateBar = new THREE.Mesh(
                        new THREE.BoxGeometry(0.03, 2.5, 0.03),
                        gateMat
                    );
                    gateBar.position.set(gateX - 1.5 + gb * 0.43, -0.65, gateZ);
                    group.add(gateBar);
                }

                // Floor carpet in lobby
                const carpetMat = new THREE.MeshStandardMaterial({ color: 0x4a3d2d, roughness: 0.9 });
                const carpet = new THREE.Mesh(
                    new THREE.BoxGeometry(10, 0.02, 8),
                    carpetMat
                );
                carpet.position.set(0, -1.89, -1);
                group.add(carpet);

                // Large potted plants in lobby
                const lobbyPlantPot = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.5, 0.4, 0.8, 12),
                    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.6 })
                );
                lobbyPlantPot.position.set(-6, -1.6, 2);
                lobbyPlantPot.castShadow = true;
                group.add(lobbyPlantPot);

                const lobbyPlant = new THREE.Mesh(
                    new THREE.ConeGeometry(0.6, 1.5, 8),
                    new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.7 })
                );
                lobbyPlant.position.set(-6, -0.9, 2);
                lobbyPlant.castShadow = true;
                group.add(lobbyPlant);

                const lobbyPlantPot2 = lobbyPlantPot.clone();
                lobbyPlantPot2.position.set(6, -1.6, 2);
                group.add(lobbyPlantPot2);

                const lobbyPlant2 = lobbyPlant.clone();
                lobbyPlant2.position.set(6, -0.9, 2);
                group.add(lobbyPlant2);
            }

            // === CEILING LIGHTING ===
            // Main linear lights
            const lightGeo = new THREE.BoxGeometry(1.5, 0.08, 0.3);
            const lightMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xfff5e6,
                emissiveIntensity: 1
            });
            for (let l = 0; l < 4; l++) {
                const ceilingLight = new THREE.Mesh(lightGeo, lightMat.clone());
                ceilingLight.position.set(-5 + l * 3.5, floorHeight / 2 - 0.1, 0);
                group.add(ceilingLight);

                // Light housing
                const lightHousing = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.12, 0.4),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                );
                lightHousing.position.set(-5 + l * 3.5, floorHeight / 2 - 0.05, 0);
                group.add(lightHousing);
            }

            // === WALL SCONCES ===
            const sconceMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 });
            const sconcePositions = [
                { x: -8.3, z: 0 },
                { x: 8.3, z: 0 }
            ];
            sconcePositions.forEach(sp => {
                const sconce = new THREE.Mesh(
                    new THREE.BoxGeometry(0.15, 0.4, 0.2),
                    sconceMat
                );
                sconce.position.set(sp.x, 0.5, sp.z);
                group.add(sconce);

                const sconceLight = new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.25, 0.05),
                    new THREE.MeshStandardMaterial({
                        color: 0xfff5e6,
                        emissive: 0xfff5e6,
                        emissiveIntensity: 0.8
                    })
                );
                sconceLight.position.set(sp.x + (sp.x > 0 ? -0.08 : 0.08), 0.5, sp.z);
                group.add(sconceLight);
            });

            // === AIR VENTS ===
            const ventMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.5, metalness: 0.3 });
            const ventPositions = [
                { x: -7, z: 5 },
                { x: 7, z: 5 },
                { x: -7, z: -5 },
                { x: 7, z: -5 }
            ];
            ventPositions.forEach(vp => {
                const vent = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.08, 0.4),
                    ventMat
                );
                vent.position.set(vp.x, floorHeight / 2 - 0.1, vp.z);
                group.add(vent);

                // Vent slats
                for (let slat = 0; slat < 5; slat++) {
                    const slatMesh = new THREE.Mesh(
                        new THREE.BoxGeometry(0.7, 0.015, 0.02),
                        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.4 })
                    );
                    slatMesh.position.set(vp.x, floorHeight / 2 - 0.12, vp.z - 0.15 + slat * 0.08);
                    group.add(slatMesh);
                }
            });

            group.position.y = i * floorHeight + floorHeight / 2;
            floors.push(group);
            floorGroups.push(group);
            scene.add(group);
        }

        // ============= BUILDING EXTERIOR DETAILS =============
        // Glass facade with improved material
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0xaaddff,
            metalness: 0.08,
            roughness: 0.02,
            transmission: 0.88,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            envMapIntensity: 1
        });

        // Front glass wall
        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(floorWidth + 0.5, 26, 0.12),
            glassMat
        );
        frontWall.position.set(0, 13, floorDepth / 2);
        scene.add(frontWall);

        // Back glass wall
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(floorWidth + 0.5, 26, 0.12),
            glassMat
        );
        backWall.position.set(0, 13, -floorDepth / 2);
        scene.add(backWall);

        // Side walls
        const sideWallGeo = new THREE.BoxGeometry(0.12, 26, floorDepth + 0.5);
        const leftWall = new THREE.Mesh(sideWallGeo, glassMat);
        leftWall.position.set(-floorWidth / 2, 13, 0);
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeo, glassMat);
        rightWall.position.set(floorWidth / 2, 13, 0);
        scene.add(rightWall);

        // === BUILDING COLUMNS ===
        const columnMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.4,
            metalness: 0.3
        });

        // Front columns
        for (let c = 0; c < 5; c++) {
            const column = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 26, 0.4),
                columnMat
            );
            column.position.set(-7.5 + c * 3.75, 13, floorDepth / 2 + 0.15);
            column.castShadow = true;
            scene.add(column);
        }

        // === ROOF DETAILS ===
        const roofGeo = new THREE.BoxGeometry(floorWidth + 1.2, 0.6, floorDepth + 1.2);
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1f,
            roughness: 0.75,
            metalness: 0.1
        });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 28.3;
        roof.castShadow = true;
        roof.receiveShadow = true;
        scene.add(roof);

        // Rooftop elements
        const hvacMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.3 });
        const hvac1 = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), hvacMat);
        hvac1.position.set(-5, 29.1, 2);
        hvac1.castShadow = true;
        scene.add(hvac1);

        const hvac2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1.5), hvacMat);
        hvac2.position.set(4, 28.9, -2);
        hvac2.castShadow = true;
        scene.add(hvac2);

        // Antenna
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.4, metalness: 0.6 });
        const antenna = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.1, 4, 8),
            antennaMat
        );
        antenna.position.set(0, 30.5, 0);
        scene.add(antenna);

        // Antenna light
        const antennaLight = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 8, 8),
            new THREE.MeshStandardMaterial({
                color: 0xff3333,
                emissive: 0xff3333,
                emissiveIntensity: 1
            })
        );
        antennaLight.position.set(0, 32.5, 0);
        scene.add(antennaLight);

        // === ENTRANCE SIGNAGE ===
        const signMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.5 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 0.4), signMat);
        sign.position.set(0, 3.5, 8.5);
        sign.castShadow = true;
        scene.add(sign);

        // Sign glow panel
        const signGlowMat = new THREE.MeshStandardMaterial({
            color: accentColor,
            emissive: accentColor,
            emissiveIntensity: 1.2,
            roughness: 0.2
        });
        const signGlow = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 0.05), signGlowMat);
        signGlow.position.set(0, 3.7, 8.7);
        scene.add(signGlow);

        // Entrance canopy
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5, metalness: 0.4 });
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 3), canopyMat);
        canopy.position.set(0, 2.3, 6.5);
        canopy.castShadow = true;
        scene.add(canopy);

        // Canopy supports
        const supportMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 });
        [-3.5, 3.5].forEach(x => {
            const support = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.1, 2.3, 8),
                supportMat
            );
            support.position.set(x, 1.15, 6.5);
            support.castShadow = true;
            scene.add(support);
        });

        // === SKY ENVIRONMENT ===
        // Stars
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 600;
        const posArray = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 250;
            posArray[i + 1] = Math.random() * 80 + 40;
            posArray[i + 2] = (Math.random() - 0.5) * 250;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        // Moon
        const moonGeo = new THREE.SphereGeometry(3, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            emissive: 0xffffee,
            emissiveIntensity: 0.3,
            roughness: 0.9
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(-60, 70, -80);
        scene.add(moon);

        // Moon glow
        const moonGlowGeo = new THREE.SphereGeometry(4, 32, 32);
        const moonGlowMat = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.15
        });
        const moonGlow = new THREE.Mesh(moonGlowGeo, moonGlowMat);
        moonGlow.position.copy(moon.position);
        scene.add(moonGlow);

        // Raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Mouse move
        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            if (!isInsideMode) {
                raycaster.setFromCamera(mouse, camera);
                const allObjects = floors.flatMap(f => f.children);
                const intersects = raycaster.intersectObjects(allObjects, true);

                let found = null;
                for (const floor of floors) {
                    if (intersects.some(i => floor.children.includes(i.object) || i.object.parent === floor)) {
                        found = floor;
                        break;
                    }
                }

                if (found && found.userData.floorIndex > 0) {
                    setSelectedFloor(found.userData.data);
                    document.body.style.cursor = 'pointer';
                } else {
                    setSelectedFloor(null);
                    document.body.style.cursor = 'default';
                }
            }
        };

        // Click handler
        const onClick = () => {
            if (!isInsideMode && selectedFloor && selectedFloor.id > 0) {
                navigate(`/floor/${selectedFloor.id}`);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        // Resize
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        // Enter building function
        window.enterBuilding = () => {
            isInsideMode = true;
            setIsInside(true);
            setCurrentInteriorFloor(1);
            controls.autoRotate = false;

            // Turn on interior lights
            interiorLights.forEach(l => {
                gsap.to(l, { intensity: 2, duration: 1 });
            });

            // Move camera inside
            gsap.to(camera.position, {
                x: 0, y: 6, z: 7,
                duration: 2,
                ease: 'power2.inOut'
            });
            gsap.to(controls.target, {
                x: 0, y: 5, z: 0,
                duration: 2,
                ease: 'power2.inOut'
            });

            controls.minDistance = 1;
            controls.maxDistance = 12;
        };

        // Exit building function
        window.exitBuilding = () => {
            isInsideMode = false;
            setIsInside(false);
            controls.autoRotate = true;

            // Turn off interior lights
            interiorLights.forEach(l => {
                gsap.to(l, { intensity: 0, duration: 0.5 });
            });

            // Move camera outside
            gsap.to(camera.position, {
                x: 40, y: 30, z: 40,
                duration: 2,
                ease: 'power2.inOut'
            });
            gsap.to(controls.target, {
                x: 0, y: 10, z: 0,
                duration: 2,
                ease: 'power2.inOut'
            });

            controls.minDistance = 5;
            controls.maxDistance = 100;
        };

        // Navigate to floor inside
        window.goToFloor = (floorNum) => {
            interiorFloor = floorNum;
            setCurrentInteriorFloor(floorNum);

            const targetY = floorNum * floorHeight + 1;

            gsap.to(camera.position, {
                y: targetY,
                duration: 1.5,
                ease: 'power2.inOut'
            });
            gsap.to(controls.target, {
                y: targetY - 1,
                duration: 1.5,
                ease: 'power2.inOut'
            });
        };

        // Animation
        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.016;
            controls.update();

            // Subtle building float
            floors.forEach((floor, i) => {
                if (!isInsideMode) {
                    floor.position.y = i * floorHeight + floorHeight / 2 + Math.sin(time * 0.5 + i * 0.3) * 0.025;
                }
            });

            // Rotate stars slowly
            stars.rotation.y += 0.00008;

            // Antenna light blink
            if (Math.floor(time * 2) % 2 === 0) {
                antennaLight.material.emissiveIntensity = 1;
            } else {
                antennaLight.material.emissiveIntensity = 0.3;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
            delete window.enterBuilding;
            delete window.exitBuilding;
            delete window.goToFloor;
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [navigate]);

    const handleEnter = () => {
        if (window.enterBuilding) {
            window.enterBuilding();
            setShowEnterPrompt(false);
        }
    };

    const handleExit = () => {
        if (window.exitBuilding) {
            window.exitBuilding();
            setShowEnterPrompt(true);
        }
    };

    const handleFloorSelect = (floorNum) => {
        if (window.goToFloor) {
            window.goToFloor(floorNum);
        }
    };

    return (
        <div className="three-d-landing">
            <div ref={containerRef} className="three-d-canvas" />

            {/* Hero Content - Only show when outside */}
            {!isInside && (
                <div className="hero-content">
                    <h1 className="hero-title">
                        WORK <span className="accent">TABLE</span>
                    </h1>
                    <p className="hero-subtitle">A Coworking Community</p>
                    <p className="hero-tagline">
                        816 seats across 7 floors • Sector-135, Noida
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={handleEnter}>
                            Enter Building
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/floors')}>
                            Browse Floors
                        </button>
                    </div>
                </div>
            )}

            {/* Interior Navigation */}
            {isInside && (
                <div className="interior-nav">
                    <div className="interior-header">
                        <h2>Floor {currentInteriorFloor}</h2>
                        <button className="btn-exit" onClick={handleExit}>
                            Exit
                        </button>
                    </div>
                    <div className="floor-selector">
                        {[1, 2, 3, 4, 5, 6].map(floor => (
                            <button
                                key={floor}
                                className={`floor-btn ${currentInteriorFloor === floor ? 'active' : ''}`}
                                onClick={() => handleFloorSelect(floor)}
                            >
                                {floor}
                            </button>
                        ))}
                    </div>
                    <div className="floor-info">
                        <h3>{floorData[currentInteriorFloor]?.name}</h3>
                        <p>{floorData[currentInteriorFloor]?.description}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            {floorData[currentInteriorFloor]?.amenities?.slice(0, 3).map((a, i) => (
                                <span key={i} style={{ background: 'rgba(193,127,89,0.2)', color: '#c17f59', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Workspace Panel */}
            {isInside && (
                <div className="workspace-panel">
                    <h4>Select Workspace (80 spaces)</h4>
                    <div className="workspace-grid">
                        {workspaces.slice(0, 80).map((ws) => (
                            <div
                                key={ws.id}
                                className={`workspace-dot ${ws.status} ${selectedWorkspace?.id === ws.id ? 'selected' : ''}`}
                                onClick={() => ws.status === 'available' && setSelectedWorkspace(ws)}
                                title={`${ws.name} - ${ws.status === 'available' ? `₹${ws.price}/day` : 'Occupied'}`}
                            >
                                {ws.id}
                            </div>
                        ))}
                    </div>
                    <div className="workspace-legend">
                        <div className="legend-item">
                            <div className="legend-dot available"></div>
                            <span>Available ({workspaces.filter(w => w.status === 'available').length})</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot occupied"></div>
                            <span>Occupied ({workspaces.filter(w => w.status === 'occupied').length})</span>
                        </div>
                    </div>
                    {selectedWorkspace && (
                        <button
                            className="btn-book-floor"
                            style={{ marginTop: '1rem' }}
                            onClick={() => navigate(`/booking/${currentInteriorFloor}/${selectedWorkspace.id}`)}
                        >
                            Book {selectedWorkspace.name} - ₹{selectedWorkspace.price}/day
                        </button>
                    )}
                </div>
            )}

            {/* Floor Info Panel - Outside only */}
            {selectedFloor && !isInside && (
                <div className="floor-info-panel">
                    <div className="floor-info-header">
                        <span className={`status-badge ${selectedFloor.status}`}>
                            {selectedFloor.status}
                        </span>
                    </div>
                    <h3>{selectedFloor.name}</h3>
                    <p className="floor-desc">{selectedFloor.description}</p>
                    <div className="floor-stats">
                        <div className="stat">
                            <span className="stat-value">{selectedFloor.seats}</span>
                            <span className="stat-label">Seats</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{selectedFloor.pricing}</span>
                            <span className="stat-label">From</span>
                        </div>
                    </div>
                    <button className="btn-book" onClick={() => navigate(`/floor/${selectedFloor.id}`)}>
                        Book This Floor
                    </button>
                </div>
            )}

            {/* Controls Hint */}
            {!isInside && (
                <div className="controls-hint">
                    <span>🖱️ Drag to rotate • Scroll to zoom • Click floor to book</span>
                </div>
            )}

            {isInside && (
                <div className="controls-hint interior">
                    <span>🖱️ Drag to look • Scroll to zoom • Use buttons to change floors</span>
                </div>
            )}
        </div>
    );
}
