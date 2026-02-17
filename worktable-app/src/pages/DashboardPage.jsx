import { Link } from 'react-router-dom';

const bookings = [
    { id: 1, floor: 1, seat: 15, date: '2026-02-20', status: 'confirmed' },
    { id: 2, floor: 2, seat: 42, date: '2026-02-21', status: 'pending' },
];

export default function DashboardPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
            <Link to="/" style={{ color: '#c17f59', textDecoration: 'none' }}>← Back to Home</Link>
            <h1 style={{ color: '#fff', margin: '2rem 0' }}>My Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(20,20,30,0.8)', padding: '1.5rem', borderRadius: '12px' }}>
                    <p style={{ color: '#888', margin: 0 }}>Total Bookings</p>
                    <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>12</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.8)', padding: '1.5rem', borderRadius: '12px' }}>
                    <p style={{ color: '#888', margin: 0 }}>Active Sessions</p>
                    <p style={{ color: '#4ecdc4', fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>2</p>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.8)', padding: '1.5rem', borderRadius: '12px' }}>
                    <p style={{ color: '#888', margin: 0 }}>Hours Booked</p>
                    <p style={{ color: '#c17f59', fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>48</p>
                </div>
            </div>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Recent Bookings</h2>
            <div style={{ background: 'rgba(20,20,30,0.8)', borderRadius: '12px', overflow: 'hidden' }}>
                {bookings.map(booking => (
                    <div key={booking.id} style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#fff', margin: 0 }}>Floor {booking.floor}, Seat {booking.seat}</p>
                            <p style={{ color: '#888', margin: '0.25rem 0 0' }}>{booking.date}</p>
                        </div>
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: booking.status === 'confirmed' ? 'rgba(78,205,196,0.2)' : 'rgba(193,127,89,0.2)', color: booking.status === 'confirmed' ? '#4ecdc4' : '#c17f59' }}>
                            {booking.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
