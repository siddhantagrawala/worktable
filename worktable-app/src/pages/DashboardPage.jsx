import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Monitor, DoorOpen, Crown, Presentation, Users, Plus, QrCode, Bell, Settings, ChevronRight, TrendingUp, Building2, Wallet, Activity, CheckCircle, XCircle, FileText } from 'lucide-react';
import { sampleBookings, SEAT_TYPE_INFO, SEAT_TYPES, floors } from '../data/floors';
import './DashboardPage.css';

const typeIcons = {
    [SEAT_TYPES.OPEN]: Monitor,
    [SEAT_TYPES.CABIN]: DoorOpen,
    [SEAT_TYPES.MANAGER]: Crown,
    [SEAT_TYPES.MEETING]: Users,
    [SEAT_TYPES.CONFERENCE]: Presentation,
};

const statusColors = {
    confirmed: { bg: 'var(--status-available-bg)', color: 'var(--status-available)', label: 'Confirmed' },
    upcoming: { bg: 'var(--copper-subtle)', color: 'var(--copper-light)', label: 'Upcoming' },
    completed: { bg: 'rgba(107, 101, 96, 0.15)', color: 'var(--text-muted)', label: 'Completed' },
    cancelled: { bg: 'var(--status-booked-bg)', color: 'var(--status-booked)', label: 'Cancelled' },
};

// Extended sample bookings with more data
const extendedBookings = [
    ...sampleBookings,
    {
        id: 'BK-004',
        seatId: 'F4-MG-2',
        seatLabel: 'Manager Cabin MG-2',
        floor: 'Floor 4',
        type: SEAT_TYPES.MANAGER,
        date: '2026-02-15',
        startTime: '09:00',
        endTime: '18:00',
        status: 'upcoming',
        amount: 15000,
    },
    {
        id: 'BK-005',
        seatId: 'F1-OS-8',
        seatLabel: 'Open Seat 8',
        floor: 'Floor 1',
        type: SEAT_TYPES.OPEN,
        date: '2026-02-08',
        startTime: '10:00',
        endTime: '17:00',
        status: 'completed',
        amount: 500,
    },
    {
        id: 'BK-006',
        seatId: 'F5-MR-1',
        seatLabel: 'Meeting Room',
        floor: 'Floor 5',
        type: SEAT_TYPES.MEETING,
        date: '2026-02-05',
        startTime: '14:00',
        endTime: '16:00',
        status: 'completed',
        amount: 3000,
    },
];

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('upcoming');

    // Calculate booking statistics
    const stats = useMemo(() => {
        const total = extendedBookings.length;
        const upcoming = extendedBookings.filter(b => b.status === 'upcoming').length;
        const completed = extendedBookings.filter(b => b.status === 'completed').length;
        const totalSpent = extendedBookings.reduce((sum, b) => sum + b.amount, 0);
        const thisMonth = extendedBookings.filter(b => {
            const date = new Date(b.date);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        return { total, upcoming, completed, totalSpent, thisMonth };
    }, []);

    // Get upcoming bookings
    const upcomingBookings = useMemo(() => {
        return extendedBookings
            .filter(b => b.status === 'upcoming' || b.status === 'confirmed')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, []);

    // Get past bookings
    const pastBookings = useMemo(() => {
        return extendedBookings
            .filter(b => b.status === 'completed' || b.status === 'cancelled')
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="page dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard__header animate-fade-in-up">
                    <div className="dashboard__welcome">
                        <span className="label">Dashboard</span>
                        <h1 className="mt-sm">Welcome back, <span className="text-copper">Member</span></h1>
                        <p>Manage your workspace bookings and preferences.</p>
                    </div>
                    <div className="dashboard__header-actions">
                        <button className="btn btn-ghost" title="Notifications">
                            <Bell size={18} />
                        </button>
                        <button className="btn btn-ghost" title="Settings">
                            <Settings size={18} />
                        </button>
                        <Link to="/floors" className="btn btn-primary">
                            <Plus size={16} /> Book New
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="dashboard__stats mt-xl animate-fade-in-up stagger-1">
                    <div className="dash-stat">
                        <div className="dash-stat__icon">
                            <Calendar size={20} />
                        </div>
                        <div className="dash-stat__info">
                            <span className="dash-stat__value">{stats.total}</span>
                            <span className="dash-stat__label">Total Bookings</span>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <div className="dash-stat__icon">
                            <Clock size={20} />
                        </div>
                        <div className="dash-stat__info">
                            <span className="dash-stat__value">{stats.upcoming}</span>
                            <span className="dash-stat__label">Upcoming</span>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <div className="dash-stat__icon" style={{ background: 'rgba(164, 139, 250, 0.12)', color: '#A78BFA' }}>
                            <Wallet size={20} />
                        </div>
                        <div className="dash-stat__info">
                            <span className="dash-stat__value">Rs. {stats.totalSpent.toLocaleString()}</span>
                            <span className="dash-stat__label">Total Spent</span>
                        </div>
                    </div>
                    <div className="dash-stat">
                        <div className="dash-stat__icon" style={{ background: 'rgba(244, 114, 182, 0.12)', color: '#F472B6' }}>
                            <Activity size={20} />
                        </div>
                        <div className="dash-stat__info">
                            <span className="dash-stat__value">{stats.thisMonth}</span>
                            <span className="dash-stat__label">This Month</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard__grid mt-xl">
                    {/* Bookings Section */}
                    <div className="dashboard__section animate-fade-in-up stagger-2">
                        <div className="section-header">
                            <h3>Your Bookings</h3>
                            <div className="tabs">
                                <button
                                    className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('upcoming')}
                                >
                                    Upcoming ({upcomingBookings.length})
                                </button>
                                <button
                                    className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('past')}
                                >
                                    Past ({pastBookings.length})
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Bookings */}
                        {activeTab === 'upcoming' && (
                            <div className="bookings-list mt-md">
                                {upcomingBookings.length === 0 ? (
                                    <div className="empty-state">
                                        <Calendar size={48} />
                                        <h4>No upcoming bookings</h4>
                                        <p>Book a workspace to get started.</p>
                                        <Link to="/floors" className="btn btn-primary mt-md">
                                            Browse Floors
                                        </Link>
                                    </div>
                                ) : (
                                    upcomingBookings.map((booking) => {
                                        const info = SEAT_TYPE_INFO[booking.type];
                                        const Icon = typeIcons[booking.type];
                                        const status = statusColors[booking.status];

                                        return (
                                            <div key={booking.id} className="booking-item">
                                                <div className="booking-item__icon" style={{ color: info.color }}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="booking-item__info">
                                                    <h4>{booking.seatLabel}</h4>
                                                    <div className="booking-item__meta">
                                                        <span><MapPin size={12} /> {booking.floor}</span>
                                                        <span><Calendar size={12} /> {formatDate(booking.date)}</span>
                                                        <span><Clock size={12} /> {booking.startTime}-{booking.endTime}</span>
                                                    </div>
                                                </div>
                                                <div className="booking-item__right">
                                                    <span className="badge" style={{ background: status.bg, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                    <span className="booking-item__amount">Rs. {booking.amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Past Bookings */}
                        {activeTab === 'past' && (
                            <div className="bookings-list mt-md">
                                {pastBookings.length === 0 ? (
                                    <div className="empty-state">
                                        <FileText size={48} />
                                        <h4>No past bookings</h4>
                                        <p>Your booking history will appear here.</p>
                                    </div>
                                ) : (
                                    pastBookings.map((booking) => {
                                        const info = SEAT_TYPE_INFO[booking.type];
                                        const Icon = typeIcons[booking.type];
                                        const status = statusColors[booking.status];

                                        return (
                                            <div key={booking.id} className="booking-item booking-item--past">
                                                <div className="booking-item__icon" style={{ color: info.color, opacity: 0.6 }}>
                                                    <Icon size={22} />
                                                </div>
                                                <div className="booking-item__info">
                                                    <h4>{booking.seatLabel}</h4>
                                                    <div className="booking-item__meta">
                                                        <span><MapPin size={12} /> {booking.floor}</span>
                                                        <span><Calendar size={12} /> {formatDate(booking.date)}</span>
                                                    </div>
                                                </div>
                                                <div className="booking-item__right">
                                                    <span className="badge" style={{ background: status.bg, color: status.color }}>
                                                        {status.label}
                                                    </span>
                                                    <span className="booking-item__amount booking-item__amount--past">Rs. {booking.amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="dashboard__sidebar animate-fade-in-up stagger-3">
                        <div className="section-header">
                            <h3>Quick Actions</h3>
                        </div>

                        <div className="quick-actions mt-md">
                            <Link to="/floors" className="quick-action">
                                <div className="quick-action__icon">
                                    <Building2 size={18} />
                                </div>
                                <span>Explore Floors</span>
                                <ChevronRight size={14} />
                            </Link>
                            <button className="quick-action">
                                <div className="quick-action__icon">
                                    <QrCode size={18} />
                                </div>
                                <span>My QR Code</span>
                                <ChevronRight size={14} />
                            </button>
                            <button className="quick-action">
                                <div className="quick-action__icon" style={{ background: 'rgba(164, 139, 250, 0.12)', color: '#A78BFA' }}>
                                    <Users size={18} />
                                </div>
                                <span>Book Meeting Room</span>
                                <ChevronRight size={14} />
                            </button>
                            <button className="quick-action">
                                <div className="quick-action__icon" style={{ background: 'rgba(244, 114, 182, 0.12)', color: '#F472B6' }}>
                                    <Presentation size={18} />
                                </div>
                                <span>Book Conference</span>
                                <ChevronRight size={14} />
                            </button>
                            <button className="quick-action">
                                <div className="quick-action__icon" style={{ background: 'rgba(251, 191, 36, 0.12)', color: '#FBBF24' }}>
                                    <TrendingUp size={18} />
                                </div>
                                <span>Usage Analytics</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Entitlement Tracker */}
                        <div className="entitlement-card mt-lg">
                            <h4>Monthly Entitlements</h4>
                            <div className="divider mt-sm mb-md" />

                            <div className="entitlement">
                                <div className="entitlement__header">
                                    <span>Meeting Room</span>
                                    <span className="text-copper">1.5 / 4 hrs used</span>
                                </div>
                                <div className="entitlement__bar">
                                    <div className="entitlement__fill" style={{ width: '37.5%', background: '#A78BFA' }} />
                                </div>
                            </div>

                            <div className="entitlement mt-md">
                                <div className="entitlement__header">
                                    <span>Conference Room</span>
                                    <span className="text-copper">2 / 6 hrs used</span>
                                </div>
                                <div className="entitlement__bar">
                                    <div className="entitlement__fill" style={{ width: '33%', background: '#F472B6' }} />
                                </div>
                            </div>
                        </div>

                        {/* Floor Occupancy */}
                        <div className="floor-occupancy mt-lg">
                            <h4>Floor Availability</h4>
                            <div className="divider mt-sm mb-md" />
                            {floors.slice(0, 3).map(floor => {
                                const available = floor.seats.filter(s => s.status === 'available').length;
                                const total = floor.seats.length;
                                const percentage = Math.round((available / total) * 100);

                                return (
                                    <div key={floor.id} className="floor-occupancy__item">
                                        <div className="floor-occupancy__info">
                                            <span>{floor.name}</span>
                                            <span className={percentage > 50 ? 'text-available' : 'text-copper'}>
                                                {available}/{total} available
                                            </span>
                                        </div>
                                        <div className="floor-occupancy__bar">
                                            <div
                                                className="floor-occupancy__fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: percentage > 50 ? 'var(--status-available)' : 'var(--copper)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
