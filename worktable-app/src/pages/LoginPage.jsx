import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <Link to="/" style={{ color: '#c17f59', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>← Back to Home</Link>
                <h1 style={{ color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>Welcome Back</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={form.password}
                        onChange={e => setForm({...form, password: e.target.value})}
                        style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
                    />
                    <button type="submit" style={{ background: 'linear-gradient(135deg, #c17f59, #e8a87c)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
                        Login
                    </button>
                </form>
                <p style={{ color: '#888', textAlign: 'center', marginTop: '1rem' }}>Don't have an account? <span style={{ color: '#c17f59' }}>Sign up</span></p>
            </div>
        </div>
    );
}
