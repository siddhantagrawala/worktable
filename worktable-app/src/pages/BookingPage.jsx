import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function BookingPage() {
    const { floorId, seatId } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', date: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <h1 style={{ color: '#4ecdc4', fontSize: '3rem' }}>✓</h1>
                    <h2>Booking Confirmed!</h2>
                    <p>Floor {floorId}, Seat {seatId}</p>
                    <p style={{ color: '#888' }}>Check your email for details</p>
                    <Link to="/" style={{ color: '#c17f59', marginTop: '1rem', display: 'inline-block' }}>Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
            <Link to={`/floor/${floorId}`} style={{ color: '#c17f59', textDecoration: 'none' }}>← Back to Seat Map</Link>
            <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
                <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Complete Your Booking</h1>
                <div style={{ background: 'rgba(20,20,30,0.8)', padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                    <p style={{ color: '#888' }}>Floor {floorId}, Seat {seatId}</p>
                    <p style={{ color: '#c17f59', fontSize: '1.5rem', fontWeight: 'bold' }}>₹1,500/day</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone Number"
                        required
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <input
                        type="date"
                        required
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <button type="submit" style={{ background: 'linear-gradient(135deg, #c17f59, #e8a87c)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: '1rem' }}>
                        Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
}
