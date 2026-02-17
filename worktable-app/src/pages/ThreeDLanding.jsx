import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
        description: 'Startup Zone',
        amenities: ['Hot Desks', 'Meeting Room', 'Pantry', 'Phone Booths']
    },
    {
        id: 2,
        name: 'Floor 2',
        status: 'available',
        seats: 80,
        pricing: '₹1,500/slot',
        description: 'Creative Studio',
        amenities: ['Dedicated Desks', 'Focus Pods', 'Event Space', 'Coffee Bar']
    },
    {
        id: 3,
        name: 'Floor 3',
        status: 'available',
        seats: 80,
        pricing: '₹1,500/slot',
        description: 'Tech Hub',
        amenities: ['Standing Desks', 'Private Cabins', 'Training Room', 'Gaming Area']
    },
    {
        id: 4,
        name: 'Floor 4',
        status: 'available',
        seats: 80,
        pricing: '₹2,000/slot',
        description: 'Enterprise Floor',
        amenities: ['Premium Desks', 'Board Room', 'Server Access', 'VIP Lounge']
    },
    {
        id: 5,
        name: 'Floor 5',
        status: 'available',
        seats: 80,
        pricing: '₹2,000/slot',
        description: 'Executive Suites',
        amenities: ['Private Offices', 'Conference Suite', 'Rooftop Access', 'Catering']
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
    const occupiedCount = Math.floor(Math.random() * 30) + 15;

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
    const [threeError, setThreeError] = useState(null);

    useEffect(() => {
        setWorkspaces(generateWorkspaces(currentInteriorFloor));
        setSelectedWorkspace(null);
    }, [currentInteriorFloor]);

    useEffect(() => {
        if (!containerRef.current) return;

        try {

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a12);
        scene.fog = new THREE.FogExp2(0x0a0a12, 0.008);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(40, 30, 40);

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

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 100;
        controls.maxPolarAngle = Math.PI / 2.05;
        controls.target.set(0, 10, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;

        let isInsideMode = false;
        let interiorFloor = 1;
        const floorHeight = 4;
        const floorWidth = 18;
        const floorDepth = 14;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        scene.add(ambientLight);

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

        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
        fillLight.position.set(-20, 20, -20);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffaa77, 0.6);
        rimLight.position.set(-30, 40, 30);
        scene.add(rimLight);

        const interiorLights = [];
        for (let i = 1; i <= 6; i++) {
            const light = new THREE.PointLight(0xfff5e6, 0, 20, 2);
            light.position.set(0, i * floorHeight + 1, 0);
            scene.add(light);
            interiorLights.push(light);
        }

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

        // Environment
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

        const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.9 });
        for (let i = -5; i <= 5; i++) {
            const lineH = new THREE.Mesh(new THREE.BoxGeometry(100, 0.02, 0.15), lineMat);
            lineH.position.set(0, 0.01, i * 10);
            scene.add(lineH);

            const lineV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.02, 100), lineMat);
            lineV.position.set(i * 10, 0.01, 0);
            scene.add(lineV);
        }

        const parkingMat = new THREE.MeshStandardMaterial({ color: 0x252530, roughness: 0.75 });
        const parkingLineMat = new THREE.MeshStandardMaterial({ color: 0x4a4a55, roughness: 0.5 });
        for (let i = -3; i <= 3; i++) {
            const parking = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 5.2), parkingMat);
            parking.position.set(i * 4.5, 0.05, 22);
            parking.receiveShadow = true;
            scene.add(parking);

            const pLine = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 4.5), parkingLineMat);
            pLine.position.set(i * 4.5 + 1.5, 0.06, 22);
            scene.add(pLine);
        }

        const pathMat = new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7 });
        const pathway = new THREE.Mesh(new THREE.BoxGeometry(6, 0.08, 15), pathMat);
        pathway.position.set(0, 0.04, 12);
        pathway.receiveShadow = true;
        scene.add(pathway);

        const plantMat = new THREE.MeshStandardMaterial({ color: 0x2d5a3d, roughness: 0.8 });
        const potMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6, metalness: 0.2 });

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
            const radius = 12;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.6, 0.5, 1, 8),
                potMat
            );
            pot.position.set(x, 0.5, z);
            pot.castShadow = true;
            scene.add(pot);

            const plant = new THREE.Mesh(
                new THREE.SphereGeometry(0.8, 8, 6),
                plantMat
            );
            plant.position.set(x, 1.4, z);
            plant.scale.y = 1.3;
            plant.castShadow = true;
            scene.add(plant);
        }

        // Building
        const floors = [];
        const floorGroups = [];
        let accentColor = 0xc17f59;

        for (let i = 0; i < 7; i++) {
            const group = new THREE.Group();
            group.userData = { floorIndex: i, data: floorData[i] };

            let floorColor = 0x2d4a3d;
            if (i === 0) {
                floorColor = 0x3d3d5a;
                accentColor = 0x4ecdc4;
            } else if (i >= 4) {
                floorColor = 0x4a3d2d;
                accentColor = 0xe8a87c;
            } else {
                accentColor = 0xc17f59;
            }

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

            if (i > 0) {
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

                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 5; col++) {
                        const xPos = -4.5 + col * 2.2;
                        const zPos = -4 + row * 2.4;

                        const desk = new THREE.Mesh(
                            new THREE.BoxGeometry(1.85, 0.06, 0.9),
                            deskMat.clone()
                        );
                        desk.position.set(xPos, -1.55, zPos);
                        desk.castShadow = true;
                        desk.receiveShadow = true;
                        group.add(desk);

                        const drawer = new THREE.Mesh(
                            new THREE.BoxGeometry(0.4, 0.35, 0.5),
                            grayMat
                        );
                        drawer.position.set(xPos + 0.6, -1.65, zPos + 0.1);
                        drawer.castShadow = true;
                        group.add(drawer);

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

                        const cpu = new THREE.Mesh(
                            new THREE.BoxGeometry(0.18, 0.35, 0.4),
                            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.3 })
                        );
                        cpu.position.set(xPos - 0.75, -2.15, zPos + 0.3);
                        cpu.castShadow = true;
                        group.add(cpu);

                        const monitor = new THREE.Mesh(
                            new THREE.BoxGeometry(0.55, 0.38, 0.04),
                            monitorMat
                        );
                        monitor.position.set(xPos, -1.22, zPos - 0.28);
                        group.add(monitor);

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

                        [-0.22, 0.22].forEach(xOff => {
                            const armrest = new THREE.Mesh(
                                new THREE.BoxGeometry(0.05, 0.25, 0.25),
                                new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                            );
                            armrest.position.set(xPos + xOff, -1.65, zPos - 0.55);
                            group.add(armrest);
                        });

                        const keyboard = new THREE.Mesh(
                            new THREE.BoxGeometry(0.42, 0.015, 0.12),
                            new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 })
                        );
                        keyboard.position.set(xPos, -1.51, zPos - 0.12);
                        group.add(keyboard);

                        const mousepad = new THREE.Mesh(
                            new THREE.BoxGeometry(0.18, 0.01, 0.15),
                            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
                        );
                        mousepad.position.set(xPos + 0.35, -1.51, zPos - 0.12);
                        group.add(mousepad);

                        const mug = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.035, 0.03, 0.06, 12),
                            new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.4 })
                        );
                        mug.position.set(xPos - 0.65, -1.51, zPos + 0.2);
                        group.add(mug);

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

                // Phone booths
                const boothPositions = [
                    { x: -7, z: 5 },
                    { x: 7, z: 5 },
                    { x: -7, z: -5.5 },
                    { x: 7, z: -5.5 }
                ];

                boothPositions.forEach(bp => {
                    const boothMat = new THREE.MeshStandardMaterial({
                        color: 0x3a3a3a,
                        roughness: 0.4,
                        metalness: 0.5
                    });

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

                    const boothCeiling = new THREE.Mesh(
                        new THREE.BoxGeometry(1.7, 0.08, 1.9),
                        boothMat
                    );
                    boothCeiling.position.set(bp.x, 0.2, bp.z);
                    group.add(boothCeiling);

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

                    const bDesk = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8, 0.04, 0.4),
                        deskMat.clone()
                    );
                    bDesk.position.set(bp.x, -1.5, bp.z + 0.3);
                    group.add(bDesk);

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

                // Pantry
                const pantryX = 5;
                const pantryZ = 4;

                const counterMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.4 });
                const counter = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 0.9, 0.6),
                    counterMat
                );
                counter.position.set(pantryX, -1.55, pantryZ);
                counter.castShadow = true;
                group.add(counter);

                const counterTop = new THREE.Mesh(
                    new THREE.BoxGeometry(3.1, 0.05, 0.7),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.2, metalness: 0.6 })
                );
                counterTop.position.set(pantryX, -1.07, pantryZ);
                group.add(counterTop);

                const coffeeMachine = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.35, 0.25),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.7 })
                );
                coffeeMachine.position.set(pantryX - 0.8, -0.82, pantryZ);
                group.add(coffeeMachine);

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

                const sink = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.12, 0.3),
                    new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 })
                );
                sink.position.set(pantryX - 0.2, -1.0, pantryZ);
                group.add(sink);

                const fridge = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 1.5, 0.6),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.3, metalness: 0.5 })
                );
                fridge.position.set(pantryX + 1, -0.75, pantryZ);
                fridge.castShadow = true;
                group.add(fridge);

                const microwave = new THREE.Mesh(
                    new THREE.BoxGeometry(0.45, 0.28, 0.35),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.4 })
                );
                microwave.position.set(pantryX + 0.4, -0.9, pantryZ);
                group.add(microwave);

                const waterDispenser = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 1.1, 0.3),
                    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.3 })
                );
                waterDispenser.position.set(pantryX - 1.2, -0.95, pantryZ);
                group.add(waterDispenser);

                // Meeting room
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

                const frameMat = new THREE.MeshStandardMaterial({
                    color: 0x4a4a4a,
                    roughness: 0.3,
                    metalness: 0.7
                });
                const frameGeo = new THREE.BoxGeometry(4.55, 0.06, 3.55);
                const frameTop = new THREE.Mesh(frameGeo, frameMat);
                frameTop.position.set(4.5, 0.8, -4.5);
                group.add(frameTop);

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

                // TV
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

                const whiteboard = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 1, 0.05),
                    whiteMat
                );
                whiteboard.position.set(6.7, -0.3, -4.5);
                group.add(whiteboard);

                // Plants
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

            // Ground floor lobby
            if (i === 0) {
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

                const counterTop = new THREE.Mesh(
                    new THREE.BoxGeometry(7.2, 0.08, 1.4),
                    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.2, metalness: 0.5 })
                );
                counterTop.position.set(0, -0.88, -5.5);
                group.add(counterTop);

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

                // Sofa
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

                // Lift
                const liftDoor = new THREE.Mesh(
                    new THREE.BoxGeometry(1.5, 2.5, 0.1),
                    new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.3, metalness: 0.6 })
                );
                liftDoor.position.set(5, -0.25, -5);
                group.add(liftDoor);

                // Kiosk
                const kiosk = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 1.5, 0.4),
                    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3, metalness: 0.5 })
                );
                kiosk.position.set(3, -1.25, 0);
                kiosk.castShadow = true;
                group.add(kiosk);

                const kioskScreen = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.7, 0.02),
                    new THREE.MeshStandardMaterial({
                        color: 0x111133,
                        emissive: 0x111155,
                        emissiveIntensity: 0.5
                    })
                );
                kioskScreen.position.set(3, -0.8, 0.21);
                group.add(kioskScreen);
            }

            // Ceiling lights
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

                const lightHousing = new THREE.Mesh(
                    new THREE.BoxGeometry(1.6, 0.12, 0.4),
                    new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.5 })
                );
                lightHousing.position.set(-5 + l * 3.5, floorHeight / 2 - 0.05, 0);
                group.add(lightHousing);
            }

            group.position.y = i * floorHeight + floorHeight / 2;
            floors.push(group);
            floorGroups.push(group);
            scene.add(group);
        }

        // Building exterior
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

        const frontWall = new THREE.Mesh(
            new THREE.BoxGeometry(floorWidth + 0.5, 26, 0.12),
            glassMat
        );
        frontWall.position.set(0, 13, floorDepth / 2);
        scene.add(frontWall);

        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(floorWidth + 0.5, 26, 0.12),
            glassMat
        );
        backWall.position.set(0, 13, -floorDepth / 2);
        scene.add(backWall);

        const sideWallGeo = new THREE.BoxGeometry(0.12, 26, floorDepth + 0.5);
        const leftWall = new THREE.Mesh(sideWallGeo, glassMat);
        leftWall.position.set(-floorWidth / 2, 13, 0);
        scene.add(leftWall);

        const rightWall = new THREE.Mesh(sideWallGeo, glassMat);
        rightWall.position.set(floorWidth / 2, 13, 0);
        scene.add(rightWall);

        const columnMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a40,
            roughness: 0.4,
            metalness: 0.3
        });

        for (let c = 0; c < 5; c++) {
            const column = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 26, 0.4),
                columnMat
            );
            column.position.set(-7.5 + c * 3.75, 13, floorDepth / 2 + 0.15);
            column.castShadow = true;
            scene.add(column);
        }

        // Roof
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

        // HVAC
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

        // Signage
        const signMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.5 });
        const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 2.5, 0.4), signMat);
        sign.position.set(0, 3.5, 8.5);
        sign.castShadow = true;
        scene.add(sign);

        const signGlowMat = new THREE.MeshStandardMaterial({
            color: accentColor,
            emissive: accentColor,
            emissiveIntensity: 1.2,
            roughness: 0.2
        });
        const signGlow = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 0.05), signGlowMat);
        signGlow.position.set(0, 3.7, 8.7);
        scene.add(signGlow);

        // Canopy
        const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.5, metalness: 0.4 });
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, 3), canopyMat);
        canopy.position.set(0, 2.3, 6.5);
        canopy.castShadow = true;
        scene.add(canopy);

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

        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const onClick = (e) => {
            if (isInsideMode) return;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(floors);

            if (intersects.length > 0) {
                const floorIndex = intersects[0].object.parent.userData.floorIndex;
                if (floorIndex !== undefined && floorIndex > 0) {
                    setSelectedFloor(floorData[floorIndex]);
                }
            } else {
                setSelectedFloor(null);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        window.enterBuilding = () => {
            isInsideMode = true;
            setIsInside(true);
            setCurrentInteriorFloor(1);
            controls.autoRotate = false;

            interiorLights.forEach(l => {
                gsap.to(l, { intensity: 2, duration: 1 });
            });

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

        window.exitBuilding = () => {
            isInsideMode = false;
            setIsInside(false);
            controls.autoRotate = true;

            interiorLights.forEach(l => {
                gsap.to(l, { intensity: 0, duration: 0.5 });
            });

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

        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.016;
            controls.update();

            floors.forEach((floor, i) => {
                if (!isInsideMode) {
                    floor.position.y = i * floorHeight + floorHeight / 2 + Math.sin(time * 0.5 + i * 0.3) * 0.025;
                }
            });

            stars.rotation.y += 0.00008;

            if (Math.floor(time * 2) % 2 === 0) {
                antennaLight.material.emissiveIntensity = 1;
            } else {
                antennaLight.material.emissiveIntensity = 0.3;
            }

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
        } catch (error) {
            console.error('Three.js initialization error:', error);
            setThreeError(error.message || 'Failed to initialize 3D scene');
        }
    }, []);

    const handleEnter = () => {
        setShowEnterPrompt(false);
        if (window.enterBuilding) {
            window.enterBuilding();
        }
    };

    const handleExit = () => {
        if (window.exitBuilding) {
            window.exitBuilding();
        }
    };

    const handleFloorSelect = (floor) => {
        if (window.goToFloor) {
            window.goToFloor(floor);
        }
    };

    return (
        <div className="three-d-landing">
            {threeError && (
                <div className="three-error">
                    <h2>Unable to load 3D view</h2>
                    <p>{threeError}</p>
                    <button onClick={() => navigate('/floors')}>View Floors Instead</button>
                </div>
            )}
            {!threeError && <div className="three-d-canvas" ref={containerRef}></div>}

            {/* Top Navigation */}
            <div className="top-nav">
                <div className="nav-brand">WORK <span>TABLE</span></div>
                <div className="nav-links">
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-cta" onClick={handleEnter}>Enter Building</button>
                </div>
            </div>

            {/* Hero Content - Outside only */}
            {!isInside && showEnterPrompt && (
                <div className="hero-content">
                    <h1 className="hero-title">WORK <span className="accent">TABLE</span></h1>
                    <p className="hero-subtitle">Coworking Community</p>
                    <p className="hero-tagline">Experience the future of workspace</p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={handleEnter}>Enter Building</button>
                        <button className="btn-secondary" onClick={() => navigate('/floors')}>View Floors</button>
                    </div>
                </div>
            )}

            {/* Interior Navigation */}
            {isInside && (
                <div className="interior-nav">
                    <div className="interior-header">
                        <h2>Floor {currentInteriorFloor}</h2>
                        <button className="btn-exit" onClick={handleExit}>Exit</button>
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
                            <span className="stat-label">Price</span>
                        </div>
                    </div>
                    <button className="btn-book" onClick={handleEnter}>
                        Enter Building
                    </button>
                </div>
            )}

            {/* Controls Hint */}
            {!isInside && (
                <div className="controls-hint">
                    <span>🖱️ Drag to rotate • Scroll to zoom • Click floor for info</span>
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
