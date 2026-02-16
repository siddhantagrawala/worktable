import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, DoorOpen, Crown, Users, Presentation, Filter, Grid3X3, List, Info, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getFloorById, getFloorStats, SEAT_TYPES, SEAT_TYPE_INFO } from '../data/floors';
import './SeatMap.css';

// Status filters for seat filtering
const STATUS_FILTERS = [
    { id: 'all', label: 'All Seats' },
    { id: 'available', label: 'Available Only' },
    { id: 'booked', label: 'Booked Only' },
];

export default function SeatMap() {
    const { id } = useParams();
    const navigate = useNavigate();
    const floor = getFloorById(id);
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [hoveredSeat, setHoveredSeat] = useState(null);

    if (!floor) {
        return (
            <div className="page flex-center" style={{ flexDirection: 'column', gap: 16 }}>
                <h2>Floor not found</h2>
                <Link to="/floors" className="btn btn-primary">Back to Floors</Link>
            </div>
        );
    }

    const stats = getFloorStats(floor);
    const typeIcons = {
        [SEAT_TYPES.OPEN]: Monitor,
        [SEAT_TYPES.CABIN]: DoorOpen,
        [SEAT_TYPES.MANAGER]: Crown,
        [SEAT_TYPES.MEETING]: Users,
        [SEAT_TYPES.CONFERENCE]: Presentation,
    };

    // Filter seats based on both type and status filters
    const filteredSeats = useMemo(() => {
        let seats = floor.seats;

        // Filter by type
        if (typeFilter !== 'all') {
            seats = seats.filter(s => s.type === typeFilter);
        }

        // Filter by status
        if (statusFilter === 'available') {
            seats = seats.filter(s => s.status === 'available');
        } else if (statusFilter === 'booked') {
            seats = seats.filter(s => s.status === 'booked');
        }

        return seats;
    }, [floor.seats, typeFilter, statusFilter]);

    // Get available seats count for each type
    const getAvailableCount = (type) => {
        return floor.seats.filter(s => s.type === type && s.status === 'available').length;
    };

    // Handle seat selection
    const handleSeatClick = (seat) => {
        if (seat.status === 'booked') return;
        setSelectedSeat(seat.id === selectedSeat?.id ? null : seat);
    };

    const handleBookSeat = () => {
        if (selectedSeat) {
            navigate(`/booking/${floor.id}/${selectedSeat.id}`);
        }
    };

    // Generate tooltip content
    const getTooltipContent = (seat) => {
        const info = SEAT_TYPE_INFO[seat.type];
        return `
            ${info.label} - ${seat.label}
            Status: ${seat.status === 'available' ? 'Available' : 'Booked'}
            Capacity: ${info.capacity}
            ${seat.status === 'available' && info.pricePerMonth ? `Price: Rs. ${info.pricePerMonth.toLocaleString()}/mo` : ''}
            ${seat.status === 'available' && info.pricePerHour ? `Price: Rs. ${info.pricePerHour.toLocaleString()}/hr` : ''}
        `.trim();
    };

    return (
        <div className="page seat-map">
            <div className="container">
                {/* Header */}
                <div className="seat-map__header animate-fade-in-up">
                    <Link to="/floors" className="seat-map__back">
                        <ArrowLeft size={18} />
                        All Floors
                    </Link>

                    <div className="seat-map__title-row">
                        <div>
                            <h1>{floor.name}</h1>
                            <p className="seat-map__subtitle">{floor.subtitle}</p>
                        </div>
                        <div className="seat-map__stats-mini">
                            <div className="seat-map__stat-pill badge-available">
                                <span className="seat-map__stat-val">{stats.available}</span> Available
                            </div>
                            <div className="seat-map__stat-pill badge-booked">
                                <span className="seat-map__stat-val">{stats.booked}</span> Booked
                            </div>
                            <div className="seat-map__stat-pill" style={{ background: 'var(--copper-subtle)', color: 'var(--copper-light)' }}>
                                {stats.occupancy}% Occupied
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="seat-map__controls animate-fade-in-up stagger-1">
                    <div className="seat-map__filters">
                        {/* Type Filters */}
                        <button
                            className={`seat-map__filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setTypeFilter('all')}
                        >
                            <Grid3X3 size={14} /> All ({floor.seats.length})
                        </button>
                        {Object.entries(SEAT_TYPE_INFO).map(([key, info]) => {
                            const count = floor.seats.filter(s => s.type === key).length;
                            const availableCount = getAvailableCount(key);
                            const Icon = typeIcons[key];
                            return (
                                <button
                                    key={key}
                                    className={`seat-map__filter-btn ${typeFilter === key ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(key)}
                                    title={`${availableCount} available`}
                                >
                                    <Icon size={14} /> {info.label} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="seat-map__view-controls">
                        {/* Status Filter */}
                        <div className="status-filter">
                            {STATUS_FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    className={`status-filter-btn ${statusFilter === filter.id ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(filter.id)}
                                >
                                    {filter.id === 'available' && <CheckCircle size={14} />}
                                    {filter.id === 'booked' && <XCircle size={14} />}
                                    {filter.id === 'all' && <Filter size={14} />}
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="seat-map__view-toggle">
                            <button
                                className={viewMode === 'grid' ? 'active' : ''}
                                onClick={() => setViewMode('grid')}
                                title="Grid view"
                            >
                                <Grid3X3 size={16} />
                            </button>
                            <button
                                className={viewMode === 'list' ? 'active' : ''}
                                onClick={() => setViewMode('list')}
                                title="List view"
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="seat-map__legend animate-fade-in-up stagger-2">
                    <div className="legend-item">
                        <div className="legend-dot legend-dot--available" />
                        <span>Available</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot legend-dot--booked" />
                        <span>Booked</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot legend-dot--selected" />
                        <span>Selected</span>
                    </div>
                    <div className="legend-divider" />
                    {/* Type Legend */}
                    {Object.entries(SEAT_TYPE_INFO).map(([key, info]) => (
                        <div key={key} className="legend-item legend-item--type">
                            <div className="legend-dot" style={{ background: info.color }} />
                            <span>{info.label}</span>
                        </div>
                    ))}
                </div>

                {/* No results message */}
                {filteredSeats.length === 0 && (
                    <div className="no-seats-message animate-fade-in-up">
                        <Filter size={48} />
                        <h3>No seats match your filters</h3>
                        <p>Try adjusting your filter settings to see more seats.</p>
                        <button className="btn btn-secondary mt-md" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); }}>
                            Clear Filters
                        </button>
                    </div>
                )}

                <div className="seat-map__layout">
                    {/* Seat Grid */}
                    {filteredSeats.length > 0 && (
                        <div className={`seat-grid ${viewMode === 'list' ? 'seat-grid--list' : ''} animate-fade-in-up stagger-3`}>
                            {filteredSeats.map((seat) => {
                                const info = SEAT_TYPE_INFO[seat.type];
                                const Icon = typeIcons[seat.type];
                                const isSelected = selectedSeat?.id === seat.id;
                                const isBooked = seat.status === 'booked';
                                const isHovered = hoveredSeat?.id === seat.id;

                                return (
                                    <button
                                        key={seat.id}
                                        className={`seat-tile ${isBooked ? 'seat-tile--booked' : 'seat-tile--available'} ${isSelected ? 'seat-tile--selected' : ''} ${isHovered ? 'seat-tile--hovered' : ''}`}
                                        onClick={() => handleSeatClick(seat)}
                                        disabled={isBooked}
                                        onMouseEnter={() => setHoveredSeat(seat)}
                                        onMouseLeave={() => setHoveredSeat(null)}
                                    >
                                        {/* Tooltip */}
                                        {isHovered && !isBooked && (
                                            <div className="seat-tooltip">
                                                <div className="seat-tooltip__header">
                                                    <span className="seat-tooltip__title">{seat.label}</span>
                                                    <span className={`seat-tooltip__status ${seat.status}`}>
                                                        {seat.status === 'available' ? 'Available' : 'Booked'}
                                                    </span>
                                                </div>
                                                <div className="seat-tooltip__body">
                                                    <span>{info.label}</span>
                                                    <span>Capacity: {info.capacity}</span>
                                                    {info.pricePerMonth && (
                                                        <span className="seat-tooltip__price">
                                                            Rs. {info.pricePerMonth.toLocaleString()}/month
                                                        </span>
                                                    )}
                                                    {info.pricePerHour && (
                                                        <span className="seat-tooltip__price">
                                                            Rs. {info.pricePerHour.toLocaleString()}/hour
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="seat-tile__icon" style={{ color: isSelected ? '#fff' : info.color }}>
                                            <Icon size={viewMode === 'list' ? 16 : 20} />
                                        </div>
                                        <div className="seat-tile__info">
                                            <span className="seat-tile__label">{seat.label}</span>
                                            <span className="seat-tile__type">{info.label}</span>
                                        </div>
                                        {viewMode === 'list' && (
                                            <div className="seat-tile__list-meta">
                                                <span className="seat-tile__capacity">{info.capacity}</span>
                                                <span className={`badge ${isBooked ? 'badge-booked' : 'badge-available'}`}>
                                                    {isBooked ? 'Booked' : 'Available'}
                                                </span>
                                                {info.pricePerMonth && <span className="seat-tile__price">Rs. {info.pricePerMonth.toLocaleString()}/mo</span>}
                                                {info.pricePerHour && <span className="seat-tile__price">Rs. {info.pricePerHour.toLocaleString()}/hr</span>}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Selection Panel */}
                    {selectedSeat && (
                        <div className="selection-panel animate-slide-in">
                            <div className="selection-panel__header">
                                <h3>Seat Selected</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSeat(null)}>X</button>
                            </div>

                            <div className="selection-panel__details">
                                <div className="selection-panel__seat-info">
                                    <div className="selection-panel__icon" style={{ color: SEAT_TYPE_INFO[selectedSeat.type].color }}>
                                        {(() => { const Icon = typeIcons[selectedSeat.type]; return <Icon size={32} />; })()}
                                    </div>
                                    <div>
                                        <h4>{selectedSeat.label}</h4>
                                        <p>{SEAT_TYPE_INFO[selectedSeat.type].label}</p>
                                    </div>
                                </div>

                                <div className="selection-panel__meta">
                                    <div className="selection-panel__row">
                                        <span className="text-muted">Floor</span>
                                        <span>{floor.name}</span>
                                    </div>
                                    <div className="selection-panel__row">
                                        <span className="text-muted">Capacity</span>
                                        <span>{SEAT_TYPE_INFO[selectedSeat.type].capacity}</span>
                                    </div>
                                    {selectedSeat.cluster && (
                                        <div className="selection-panel__row">
                                            <span className="text-muted">Cluster</span>
                                            <span>{selectedSeat.cluster}</span>
                                        </div>
                                    )}
                                    <div className="selection-panel__row">
                                        <span className="text-muted">Price</span>
                                        <span className="text-copper fw-600">
                                            {SEAT_TYPE_INFO[selectedSeat.type].pricePerMonth
                                                ? `Rs. ${SEAT_TYPE_INFO[selectedSeat.type].pricePerMonth.toLocaleString()}/mo`
                                                : `Rs. ${SEAT_TYPE_INFO[selectedSeat.type].pricePerHour.toLocaleString()}/hr`
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className="selection-panel__features">
                                    <h5>Features</h5>
                                    <ul>
                                        <li>{SEAT_TYPE_INFO[selectedSeat.type].description}</li>
                                    </ul>
                                </div>

                                <div className="selection-panel__hold-info">
                                    <Clock size={14} />
                                    <span>Your booking will be held for 2 hours</span>
                                </div>

                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleBookSeat}>
                                    Book This Seat
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
