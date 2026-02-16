import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';
import './ThreeDLanding.css';

// Floor data
const floorData = [
    { id: 0, name: 'Ground Floor', status: 'lobby', seats: 0, pricing: 'N/A', description: 'Reception & Lobby' },
    { id: 1, name: 'Floor 1', status: 'available', seats: 80, pricing: '₹1,500/slot', description: 'Open Desks + Meeting Rooms' },
    { id: 2, name: 'Floor 2', status: 'available', seats: 80, pricing: '₹1,500/slot', description: 'Open Desks + Private Cabins' },
    { id: 3, name: 'Floor 3', status: 'available', seats: 80, pricing: '₹1,500/slot', description: 'Manager Cabins + Open Area' },
    { id: 4, name: 'Floor 4', status: 'premium', seats: 80, pricing: '₹2,000/slot', description: 'Premium Open Seating' },
    { id: 5, name: 'Floor 5', status: 'premium', seats: 80, pricing: '₹2,500/slot', description: 'Premium Private Cabins' },
    { id: 6, name: 'Floor 6', status: 'available', seats: 80, pricing: '₹1,800/slot', description: 'Enterprise Solutions' },
];

export default function ThreeDLanding() {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [isNightMode, setIsNightMode] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        scene.fog = new THREE.Fog(0x0a0a0f, 30, 150);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(35, 30, 35);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        containerRef.current.appendChild(renderer.domElement);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 15;
        controls.maxDistance = 80;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.target.set(0, 8, 0);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(25, 40, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        scene.add(sunLight);

        // Copper accent lights
        const copperSpot1 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
        copperSpot1.position.set(-15, 35, 15);
        scene.add(copperSpot1);
        scene.add(copperSpot1.target);

        const copperSpot2 = new THREE.SpotLight(0xc17f59, 50, 50, Math.PI / 6, 0.5);
        copperSpot2.position.set(15, 35, -15);
        scene.add(copperSpot2);
        scene.add(copperSpot2.target);

        // Ground
        const groundGeo = new THREE.BoxGeometry(40, 0.5, 40);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.y = -0.25;
        ground.receiveShadow = true;
        scene.add(ground);

        // Create building floors
        const floors = [];
        const floorHeight = 4;
        const floorWidth = 18;
        const floorDepth = 14;

        for (let i = 0; i < 7; i++) {
            const group = new THREE.Group();

            // Floor slab
            const slabGeo = new THREE.BoxGeometry(floorWidth, 0.3, floorDepth);
            const slabMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.7 });
            const slab = new THREE.Mesh(slabGeo, slabMat);
            slab.position.y = -floorHeight / 2;
            slab.receiveShadow = true;
            group.add(slab);

            // Floor surface
            let floorColor = 0x2d4a3d;
            if (i === 0) floorColor = 0x3d3d4a;
            else if (i >= 4) floorColor = 0x4a3d2d;

            const surfaceGeo = new THREE.BoxGeometry(floorWidth - 0.5, 0.15, floorDepth - 0.5);
            const surfaceMat = new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.5 });
            const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
            surface.position.y = -floorHeight / 2 + 0.2;
            surface.receiveShadow = true;
            group.add(surface);

            // Add seats visualization
            if (i > 0) {
                const seatSize = 0.7;
                const seatMat = new THREE.MeshStandardMaterial({
                    color: 0xc17f59, roughness: 0.4, metalness: 0.6, emissive: 0xc17f59, emissiveIntensity: 0.15
                });

                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 6; col++) {
                        const seat = new THREE.Mesh(
                            new THREE.BoxGeometry(seatSize, seatSize * 0.8, seatSize),
                            seatMat.clone()
                        );
                        seat.position.set(-5 + col * 2, -1.5, -3 + row * 2.5);
                        seat.castShadow = true;
                        group.add(seat);
                    }
                }
            }

            group.position.y = i * floorHeight + floorHeight / 2;
            group.userData = { floorIndex: i, data: floorData[i] };
            floors.push(group);
            scene.add(group);
        }

        // Glass walls
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff, metalness: 0.1, roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.2
        });

        const wallGeo = new THREE.BoxGeometry(floorWidth + 0.2, 24, 0.1);
        const frontWall = new THREE.Mesh(wallGeo, glassMat);
        frontWall.position.set(0, 12, floorDepth / 2);
        scene.add(frontWall);

        const backWall = new THREE.Mesh(wallGeo, glassMat);
        backWall.position.set(0, 12, -floorDepth / 2);
        scene.add(backWall);

        // Stars
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 300;
        const posArray = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 200;
            posArray[i + 1] = Math.random() * 80 + 20;
            posArray[i + 2] = (Math.random() - 0.5) * 200;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        // Raycaster for interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Mouse move handler
        const onMouseMove = (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const allObjects = floors.flatMap(f => f.children);
            const intersects = raycaster.intersectObjects(allObjects, true);

            let foundFloor = null;
            for (const floor of floors) {
                if (intersects.some(i => floor.children.includes(i.object) || i.object.parent === floor)) {
                    foundFloor = floor;
                    break;
                }
            }

            if (foundFloor && foundFloor.userData.floorIndex > 0) {
                setSelectedFloor(foundFloor.userData.data);
                document.body.style.cursor = 'pointer';
            } else {
                setSelectedFloor(null);
                document.body.style.cursor = 'default';
            }
        };

        // Click handler
        const onClick = () => {
            if (selectedFloor && selectedFloor.id > 0) {
                navigate(`/floor/${selectedFloor.id}`);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onClick);

        // Resize handler
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            // Subtle float
            const time = Date.now() * 0.001;
            floors.forEach((floor, i) => {
                floor.position.y = i * floorHeight + floorHeight / 2 + Math.sin(time + i * 0.5) * 0.03;
            });

            // Twinkle stars
            stars.rotation.y += 0.0002;

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [navigate]);

    const handleExplore = () => {
        navigate('/floors');
    };

    return (
        <div className="three-d-landing">
            <div ref={containerRef} className="three-d-canvas" />

            {/* Hero Content */}
            <div className="hero-content">
                <h1 className="hero-title">
                    WORK <span className="accent">TABLE</span>
                </h1>
                <p className="hero-subtitle">A Coworking Community</p>
                <p className="hero-tagline">
                    Explore our premium workspace in 3D • 816 seats across 7 floors
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={handleExplore}>
                        Explore & Book Now
                    </button>
                </div>
            </div>

            {/* Floor Info Panel */}
            {selectedFloor && (
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
            <div className="controls-hint">
                <span>🖱️ Drag to rotate • Scroll to zoom • Click floor to book</span>
            </div>

            {/* Navigation */}
            <nav className="top-nav">
                <div className="nav-brand">WORK <span>TABLE</span></div>
                <div className="nav-links">
                    <button onClick={() => navigate('/')}>3D Tour</button>
                    <button onClick={() => navigate('/floors')}>Floors</button>
                    <button onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button onClick={() => navigate('/login')} className="nav-cta">Login</button>
                </div>
            </nav>
        </div>
    );
}
