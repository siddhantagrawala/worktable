import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, DoorOpen, Crown, Monitor, Presentation, ArrowRight, MapPin, Wifi, Coffee, Zap, Filter, Star, CheckCircle } from 'lucide-react';
import { floors, getFloorStats, SEAT_TYPES } from '../data/floors';
import './FloorSelector.css';

// Floor images mapping
const floorImages = {
    1: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop',
    2: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop',
    3: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=250&fit=crop',
    4: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=250&fit=crop',
    5: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=250&fit=crop',
    6: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop',
};

const amenityIcons = {
    'Reception': MapPin,
    'Pantry': Coffee,
    'Lounge': Users,
    'High-Speed WiFi': Wifi,
    'Breakout Area': Zap,
    'Whiteboard Walls': Presentation,
    'Silent Zone': Monitor,
    'Phone Booths': DoorOpen,
    'Executive Lounge': Crown,
    'Concierge': Users,
    'Event Space': Presentation,
    'Pitch Room': Zap,
    'Terrace Access': Building2,
    'Sky Lounge': Crown,
};

// Floor status categories
const FLOOR_FILTERS = [
    { id: 'all', label: 'All Floors', icon: Building2 },
    { id: 'available', label: 'Available Today', icon: CheckCircle },
    { id: 'premium', label: 'Premium Floors', icon: Star },
    { id: 'quiet', label: 'Quiet Zone', icon: Zap },
];

export default function FloorSelector() {
    const [statusFilter, setStatusFilter] = useState('all');

    // Filter floors based on selection
    const filteredFloors = useMemo(() => {
        return floors.filter(floor => {
            const stats = getFloorStats(floor);

            switch (statusFilter) {
                case 'available':
                    // Floors with more than 50% availability
                    return stats.available > (stats.total * 0.5);
                case 'premium':
                    // Floor 4 (Enterprise Suite) and Floor 6 (Skyline Level)
                    return floor.id === 4 || floor.id === 6;
                case 'quiet':
                    // Floor 3 (Focus Zone)
                    return floor.id === 3;
                default:
                    return true;
            }
        });
    }, [statusFilter]);

    // Get count for each filter
    const getFilterCount = (filterId) => {
        switch (filterId) {
            case 'all':
                return floors.length;
            case 'available':
                return floors.filter(f => getFloorStats(f).available > getFloorStats(f).total * 0.5).length;
            case 'premium':
                return 2; // Floors 4 and 6
            case 'quiet':
                return 1; // Floor 3
            default:
                return 0;
        }
    };

    return (
        <div className="page floor-selector">
            <div className="container">
                <div className="floor-selector__header animate-fade-in-up">
                    <span className="label">Choose Your Floor</span>
                    <h1 className="mt-sm">Explore Our <span className="text-copper">6 Floors</span></h1>
                    <div className="divider mt-md" />
                    <p className="mt-md" style={{ maxWidth: 520 }}>
                        Each floor offers a unique atmosphere — from collaborative hubs to quiet focus zones.
                        Pick a floor to view live seat availability.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="floor-filters animate-fade-in-up stagger-1">
                    {FLOOR_FILTERS.map(filter => {
                        const Icon = filter.icon;
                        const count = getFilterCount(filter.id);
                        return (
                            <button
                                key={filter.id}
                                className={`floor-filter-btn ${statusFilter === filter.id ? 'active' : ''}`}
                                onClick={() => setStatusFilter(filter.id)}
                            >
                                <Icon size={16} />
                                <span>{filter.label}</span>
                                <span className="floor-filter-count">{count}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="floor-grid mt-2xl">
                    {filteredFloors.length === 0 ? (
                        <div className="no-floors-message">
                            <Building2 size={48} />
                            <h3>No floors match your filter</h3>
                            <p>Try selecting a different filter to see available floors.</p>
                        </div>
                    ) : (
                        filteredFloors.map((floor, i) => {
                            const stats = getFloorStats(floor);
                            const availableOpen = floor.seats.filter(s => s.type === SEAT_TYPES.OPEN && s.status === 'available').length;
                            const availableCabins = floor.seats.filter(s => s.type === SEAT_TYPES.CABIN && s.status === 'available').length;
                            const availableManager = floor.seats.filter(s => s.type === SEAT_TYPES.MANAGER && s.status === 'available').length;
                            const isPremium = floor.id === 4 || floor.id === 6;
                            const isQuiet = floor.id === 3;
                            const hasAvailability = stats.available > stats.total * 0.5;

                            return (
                                <Link
                                    to={`/floor/${floor.id}`}
                                    key={floor.id}
                                    className={`floor-card animate-fade-in-up stagger-${(i % 6) + 1} ${isPremium ? 'floor-card--premium' : ''} ${isQuiet ? 'floor-card--quiet' : ''}`}
                                >
                                    {/* Floor Image */}
                                    <div className="floor-card__image">
                                        <img
                                            src={floorImages[floor.id]}
                                            alt={floor.name}
                                            onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop';
                                            }}
                                        />
                                        <div className="floor-card__badges">
                                            {isPremium && (
                                                <span className="floor-card__badge floor-card__badge--premium">
                                                    <Star size={12} /> Premium
                                                </span>
                                            )}
                                            {isQuiet && (
                                                <span className="floor-card__badge floor-card__badge--quiet">
                                                    <Zap size={12} /> Quiet Zone
                                                </span>
                                            )}
                                            {hasAvailability && (
                                                <span className="floor-card__badge floor-card__badge--available">
                                                    <CheckCircle size={12} /> Available
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="floor-card__top">
                                        <div className="floor-card__number">
                                            <span className="floor-card__number-value">{floor.id}</span>
                                            <span className="floor-card__number-label">Floor</span>
                                        </div>
                                        <div className="floor-card__occupancy">
                                            <div className="floor-card__occupancy-ring">
                                                <svg viewBox="0 0 60 60">
                                                    <circle cx="30" cy="30" r="26" fill="none" stroke="var(--bg-elevated)" strokeWidth="4" />
                                                    <circle
                                                        cx="30" cy="30" r="26"
                                                        fill="none"
                                                        stroke="var(--copper)"
                                                        strokeWidth="4"
                                                        strokeDasharray={`${stats.occupancy * 1.63} 163`}
                                                        strokeDashoffset="0"
                                                        strokeLinecap="round"
                                                        transform="rotate(-90 30 30)"
                                                        style={{ transition: 'stroke-dasharray 1s ease' }}
                                                    />
                                                </svg>
                                                <span className="floor-card__occupancy-value">{stats.occupancy}%</span>
                                            </div>
                                            <span className="floor-card__occupancy-label">Occupied</span>
                                        </div>
                                    </div>

                                    <div className="floor-card__info">
                                        <h3>{floor.name}</h3>
                                        <p className="floor-card__subtitle">{floor.subtitle}</p>
                                    </div>

                                    <div className="floor-card__availability">
                                        <div className="floor-card__avail-item">
                                            <Monitor size={14} />
                                            <span>{availableOpen} open seats</span>
                                            <span className={`badge ${availableOpen > 0 ? 'badge-available' : 'badge-booked'}`}>
                                                {availableOpen > 0 ? 'Available' : 'Full'}
                                            </span>
                                        </div>
                                        <div className="floor-card__avail-item">
                                            <DoorOpen size={14} />
                                            <span>{availableCabins} cabins</span>
                                            <span className={`badge ${availableCabins > 0 ? 'badge-available' : 'badge-booked'}`}>
                                                {availableCabins > 0 ? 'Available' : 'Full'}
                                            </span>
                                        </div>
                                        <div className="floor-card__avail-item">
                                            <Crown size={14} />
                                            <span>{availableManager} manager</span>
                                            <span className={`badge ${availableManager > 0 ? 'badge-available' : 'badge-booked'}`}>
                                                {availableManager > 0 ? 'Available' : 'Full'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="floor-card__amenities">
                                        {floor.amenities.map((a, j) => {
                                            const Icon = amenityIcons[a] || Zap;
                                            return (
                                                <div key={j} className="floor-card__amenity" title={a}>
                                                    <Icon size={12} />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="floor-card__action">
                                        <span>View Floor Map</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
