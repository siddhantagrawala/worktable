import { Link } from 'react-router-dom';
import './FloorSelector.css';

const floors = [
    { id: 1, name: 'Startup Zone', seats: 80, price: '₹1,500', color: '#c17f59' },
    { id: 2, name: 'Creative Studio', seats: 80, price: '₹1,500', color: '#4ecdc4' },
    { id: 3, name: 'Tech Hub', seats: 80, price: '₹1,500', color: '#c17f59' },
    { id: 4, name: 'Enterprise Floor', seats: 80, price: '₹2,000', color: '#e8a87c' },
    { id: 5, name: 'Executive Suites', seats: 80, price: '₹2,000', color: '#e8a87c' },
    { id: 6, name: 'Enterprise Solutions', seats: 80, price: '₹1,800', color: '#c17f59' },
];

export default function FloorSelector() {
    return (
        <div className="floor-selector-page">
            <nav className="floor-nav">
                <Link to="/" className="back-link">← Back to Building</Link>
                <h1>Select Your Floor</h1>
            </nav>
            <div className="floor-grid">
                {floors.map(floor => (
                    <Link to={`/floor/${floor.id}`} key={floor.id} className="floor-card" style={{ '--accent': floor.color }}>
                        <div className="floor-number">{floor.id}</div>
                        <h2>{floor.name}</h2>
                        <p className="floor-seats">{floor.seats} workspaces</p>
                        <p className="floor-price">{floor.price}/day</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
