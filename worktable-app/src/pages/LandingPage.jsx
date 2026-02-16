import { Link } from 'react-router-dom';
import { Building2, Users, Clock, Wifi, Shield, Coffee, ArrowRight, MapPin, Star, ChevronRight, Monitor, DoorOpen, Crown, Presentation } from 'lucide-react';
import './LandingPage.css';

const spaceTypes = [
    {
        icon: <Monitor size={28} />,
        title: 'Open Desks',
        desc: 'Flexible hot desks in our vibrant shared workspace. Perfect for freelancers and remote professionals.',
        count: '120+',
        unit: 'seats available',
        price: '₹8,000/mo',
    },
    {
        icon: <DoorOpen size={28} />,
        title: 'Private Cabins',
        desc: '4-seater enclosed cabins with manager desk. Ideal for small teams needing dedicated space.',
        count: '42',
        unit: 'cabins across 6 floors',
        price: '₹35,000/mo',
    },
    {
        icon: <Crown size={28} />,
        title: 'Manager Cabins',
        desc: 'Premium single-occupancy offices for leadership. Corner positions with natural light.',
        count: '36',
        unit: 'executive suites',
        price: '₹15,000/mo',
    },
    {
        icon: <Presentation size={28} />,
        title: 'Conference Rooms',
        desc: '16-seater conference facilities with AV equipment. 6 complimentary hours per month.',
        count: '12',
        unit: 'rooms total',
        price: '₹3,000/hr',
    },
];

const amenities = [
    { icon: <Wifi size={20} />, label: 'High-Speed WiFi' },
    { icon: <Coffee size={20} />, label: 'Pantry & Café' },
    { icon: <Shield size={20} />, label: '24/7 Security' },
    { icon: <Clock size={20} />, label: 'Flexible Hours' },
    { icon: <Users size={20} />, label: 'Community Events' },
    { icon: <Building2 size={20} />, label: 'Prime Location' },
];

const stats = [
    { value: '816', label: 'Total Seats', suffix: '+' },
    { value: '9', label: 'Floors', suffix: '' },
    { value: '6', label: 'Available Floors', suffix: '' },
    { value: '24/7', label: 'Access', suffix: '' },
];

export default function LandingPage() {
    return (
        <div className="landing">
            {/* ═══ HERO ═══ */}
            <section className="hero">
                <div className="hero__bg">
                    <div className="hero__gradient" />
                    <div className="hero__grid" />
                    <div className="hero__orb hero__orb--1" />
                    <div className="hero__orb hero__orb--2" />
                </div>

                <div className="hero__content container">
                    <div className="hero__badge animate-fade-in-up">
                        <MapPin size={14} />
                        <span>Sector 136, Noida</span>
                    </div>

                    <h1 className="hero__title animate-fade-in-up stagger-1">
                        Your Next Great<br />
                        <span className="hero__title-accent">Workspace</span> Awaits
                    </h1>

                    <p className="hero__subtitle animate-fade-in-up stagger-2">
                        Premium coworking spaces across 9 floors. Book your seat, cabin, or conference
                        room instantly — all from one app.
                    </p>

                    <div className="hero__actions animate-fade-in-up stagger-3">
                        <Link to="/floors" className="btn btn-primary btn-lg">
                            Explore Floors
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Join Community
                        </Link>
                    </div>

                    <div className="hero__stats animate-fade-in-up stagger-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="hero__stat">
                                <span className="hero__stat-value">{stat.value}{stat.suffix}</span>
                                <span className="hero__stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SPACE TYPES ═══ */}
            <section className="section spaces">
                <div className="container">
                    <div className="section__header text-center">
                        <span className="label">Workspace Options</span>
                        <h2 className="mt-sm">Find Your Perfect Space</h2>
                        <div className="divider divider-center mt-md" />
                        <p className="mt-md" style={{ maxWidth: 600, margin: '16px auto 0' }}>
                            From open desks to private executive suites — choose the workspace that fits
                            your team and your ambition.
                        </p>
                    </div>

                    <div className="spaces__grid mt-2xl">
                        {spaceTypes.map((space, i) => (
                            <div key={i} className={`space-card animate-fade-in-up stagger-${i + 1}`}>
                                <div className="space-card__icon">{space.icon}</div>
                                <div className="space-card__content">
                                    <h3>{space.title}</h3>
                                    <p>{space.desc}</p>
                                    <div className="space-card__meta">
                                        <div className="space-card__count">
                                            <span className="space-card__count-value">{space.count}</span>
                                            <span className="space-card__count-label">{space.unit}</span>
                                        </div>
                                        <div className="space-card__price">{space.price}</div>
                                    </div>
                                </div>
                                <Link to="/floors" className="space-card__link">
                                    Book Now <ChevronRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ FACILITY SHOWCASE ═══ */}
            <section className="section showcase">
                <div className="container">
                    <div className="showcase__layout">
                        <div className="showcase__text">
                            <span className="label">World-Class Facility</span>
                            <h2 className="mt-sm">Designed for<br />Productivity & Comfort</h2>
                            <div className="divider mt-md" />
                            <p className="mt-lg">
                                Our spaces are crafted by award-winning designers, featuring contemporary
                                interiors with geometric wall panels, premium furnishings, and thoughtful
                                lighting — creating an environment where your best work happens naturally.
                            </p>

                            <div className="showcase__features mt-xl">
                                {[
                                    'Ergonomic furniture & standing desks',
                                    'Sound-insulated meeting rooms',
                                    'Biophilic design with natural elements',
                                    'AV-equipped conference facilities',
                                ].map((feature, i) => (
                                    <div key={i} className="showcase__feature">
                                        <Star size={14} className="text-copper" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link to="/floors" className="btn btn-primary mt-xl">
                                Take a Virtual Tour
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        <div className="showcase__visuals">
                            <div className="showcase__card showcase__card--1">
                                <div className="showcase__card-label">Reception</div>
                                <div className="showcase__card-img" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
                                    <Building2 size={48} strokeWidth={1} />
                                    <span>Premium Welcome Area</span>
                                </div>
                            </div>
                            <div className="showcase__card showcase__card--2">
                                <div className="showcase__card-label">Lounge</div>
                                <div className="showcase__card-img" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
                                    <Coffee size={48} strokeWidth={1} />
                                    <span>Relaxation Zone</span>
                                </div>
                            </div>
                            <div className="showcase__card showcase__card--3">
                                <div className="showcase__card-label">Conference</div>
                                <div className="showcase__card-img" style={{ background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)' }}>
                                    <Presentation size={48} strokeWidth={1} />
                                    <span>Meeting Hub</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ AMENITIES ═══ */}
            <section className="section amenities-section">
                <div className="container">
                    <div className="section__header text-center">
                        <span className="label">Amenities</span>
                        <h2 className="mt-sm">Everything You Need, Built In</h2>
                        <div className="divider divider-center mt-md" />
                    </div>

                    <div className="amenities__grid mt-2xl">
                        {amenities.map((a, i) => (
                            <div key={i} className={`amenity-card animate-fade-in-up stagger-${i + 1}`}>
                                <div className="amenity-card__icon">{a.icon}</div>
                                <span>{a.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="section cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-card__bg" />
                        <div className="cta-card__content">
                            <span className="label">Ready to Get Started?</span>
                            <h2 className="mt-sm">Book Your Workspace Today</h2>
                            <p className="mt-md">
                                Join 500+ professionals already thriving at WORK TABLE.
                                Your 2-hour booking hold starts the moment you pick your seat.
                            </p>
                            <div className="cta-card__actions mt-xl">
                                <Link to="/floors" className="btn btn-primary btn-lg">
                                    Book a Seat <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="footer">
                <div className="container">
                    <div className="footer__inner">
                        <div className="footer__brand">
                            <span className="navbar__brand" style={{ fontSize: '1.3rem' }}>WORK <strong>TABLE</strong></span>
                            <span className="navbar__tagline" style={{ marginTop: 4 }}>A COWORKING COMMUNITY</span>
                            <p className="mt-md" style={{ fontSize: '0.85rem' }}>
                                Sector 136, Noida<br />
                                Uttar Pradesh, India
                            </p>
                        </div>
                        <div className="footer__links">
                            <div className="footer__col">
                                <h4>Spaces</h4>
                                <Link to="/floors">Open Desks</Link>
                                <Link to="/floors">Private Cabins</Link>
                                <Link to="/floors">Conference Rooms</Link>
                            </div>
                            <div className="footer__col">
                                <h4>Company</h4>
                                <a href="#">About Us</a>
                                <a href="#">Contact</a>
                                <a href="#">Careers</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer__bottom">
                        <span>© 2026 WORK TABLE. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
