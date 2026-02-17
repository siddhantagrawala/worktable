import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function SeatMap() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [seats] = useState(() => {
        const arr = [];
        for (let i = 1; i <= 80; i++) {
            arr.push({ id: i, status: Math.random() > 0.6 ? 'occupied' : 'available' });
        }
        return arr;
    });

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '2rem' }}>
            <Link to="/floors" style={{ color: '#c17f59', textDecoration: 'none' }}>← Back to Floors</Link>
            <h1 style={{ color: '#fff', marginTop: '1rem' }}>Floor {id} - Select Seat</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px', maxWidth: '600px', margin: '2rem 0' }}>
                {seats.map(seat => (
                    <div
                        key={seat.id}
                        onClick={() => seat.status === 'available' && setSelected(seat.id)}
                        style={{
                            width: '50px',
                            height: '50px',
                            background: seat.status === 'occupied' ? 'rgba(255,100,100,0.3)' : selected === seat.id ? '#c17f59' : 'rgba(78,205,196,0.3)',
                            border: `1px solid ${seat.status === 'occupied' ? '#ff6b6b' : selected === seat.id ? '#c17f59' : '#4ecdc4'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            cursor: seat.status === 'available' ? 'pointer' : 'not-allowed',
                            fontSize: '0.8rem'
                        }}
                    >
                        {seat.id}
                    </div>
                ))}
            </div>
            {selected && (
                <button
                    onClick={() => navigate(`/booking/${id}/${selected}`)}
                    style={{
                        background: 'linear-gradient(135deg, #c17f59, #e8a87c)',
                        color: '#fff',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Book Seat {selected}
                </button>
            )}
        </div>
    );
}
