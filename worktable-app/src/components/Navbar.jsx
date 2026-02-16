import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2, LogIn, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location]);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__inner container">
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-icon">
                        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 4L36 20L20 36L4 20L20 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M12 20L20 12L28 20L20 28L12 20Z" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M20 12L28 20" stroke="#C07A5A" strokeWidth="2.5" />
                            <path d="M20 28L28 20" stroke="#C07A5A" strokeWidth="2.5" />
                        </svg>
                    </div>
                    <div className="navbar__logo-text">
                        <span className="navbar__brand">WORK <strong>TABLE</strong></span>
                        <span className="navbar__tagline">A COWORKING COMMUNITY</span>
                    </div>
                </Link>

                <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
                    <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>
                        Home
                    </Link>
                    <Link to="/floors" className={`navbar__link ${isActive('/floors') ? 'navbar__link--active' : ''}`}>
                        <Building2 size={16} />
                        Explore Floors
                    </Link>
                    <Link to="/dashboard" className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}>
                        <LayoutDashboard size={16} />
                        Dashboard
                    </Link>
                    <Link to="/login" className="btn btn-primary btn-sm navbar__cta">
                        <LogIn size={16} />
                        Sign In
                    </Link>
                </div>

                <button
                    className="navbar__toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
}
