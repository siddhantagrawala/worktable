import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const [mode, setMode] = useState('login'); // login | register
    const [showPassword, setShowPassword] = useState(false);
    const [authMethod, setAuthMethod] = useState('email'); // email | phone

    return (
        <div className="page login-page">
            <div className="login-layout">
                {/* Left — Branding */}
                <div className="login-brand">
                    <div className="login-brand__bg" />
                    <div className="login-brand__content">
                        <div className="login-brand__logo">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
                                <path d="M20 4L36 20L20 36L4 20L20 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M12 20L20 12L28 20L20 28L12 20Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <path d="M20 12L28 20" stroke="#C07A5A" strokeWidth="2.5" />
                                <path d="M20 28L28 20" stroke="#C07A5A" strokeWidth="2.5" />
                            </svg>
                        </div>
                        <h1>WORK <strong>TABLE</strong></h1>
                        <p className="login-brand__tagline">A COWORKING COMMUNITY</p>
                        <p className="login-brand__desc mt-xl">
                            Book your perfect workspace — open desks, private cabins, or conference rooms —
                            all in one premium facility.
                        </p>
                        <div className="login-brand__stats mt-2xl">
                            <div className="login-brand__stat">
                                <span className="login-brand__stat-val">816+</span>
                                <span className="login-brand__stat-label">Seats</span>
                            </div>
                            <div className="login-brand__stat">
                                <span className="login-brand__stat-val">9</span>
                                <span className="login-brand__stat-label">Floors</span>
                            </div>
                            <div className="login-brand__stat">
                                <span className="login-brand__stat-val">500+</span>
                                <span className="login-brand__stat-label">Members</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Form */}
                <div className="login-form-container">
                    <div className="login-form-card animate-fade-in-up">
                        <div className="login-form__header">
                            <h2>{mode === 'login' ? 'Welcome Back' : 'Join the Community'}</h2>
                            <p>{mode === 'login' ? 'Sign in to manage your bookings' : 'Create your account to get started'}</p>
                        </div>

                        {/* Auth Method Toggle */}
                        <div className="auth-method-toggle mt-lg">
                            <button
                                className={authMethod === 'email' ? 'active' : ''}
                                onClick={() => setAuthMethod('email')}
                            >
                                <Mail size={14} /> Email
                            </button>
                            <button
                                className={authMethod === 'phone' ? 'active' : ''}
                                onClick={() => setAuthMethod('phone')}
                            >
                                <Phone size={14} /> Phone OTP
                            </button>
                        </div>

                        <form className="login-form mt-lg" onSubmit={(e) => e.preventDefault()}>
                            {mode === 'register' && (
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <div className="input-wrapper">
                                        <User size={16} className="input-icon" />
                                        <input type="text" id="name" placeholder="John Doe" />
                                    </div>
                                </div>
                            )}

                            {authMethod === 'email' ? (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <div className="input-wrapper">
                                            <Mail size={16} className="input-icon" />
                                            <input type="email" id="email" placeholder="you@company.com" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Password</label>
                                        <div className="input-wrapper">
                                            <Lock size={16} className="input-icon" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="input-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className="input-wrapper">
                                        <Phone size={16} className="input-icon" />
                                        <input type="tel" id="phone" placeholder="+91 99999 99999" />
                                    </div>
                                </div>
                            )}

                            {mode === 'login' && authMethod === 'email' && (
                                <div className="form-row">
                                    <label className="checkbox-label">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#" className="text-copper" style={{ fontSize: '0.85rem' }}>Forgot password?</a>
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-lg mt-lg" style={{ width: '100%' }}>
                                {authMethod === 'phone' ? 'Send OTP' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                                <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="login-switch mt-xl">
                            {mode === 'login' ? (
                                <p>Don't have an account? <button onClick={() => setMode('register')} className="text-copper fw-600">Sign Up</button></p>
                            ) : (
                                <p>Already a member? <button onClick={() => setMode('login')} className="text-copper fw-600">Sign In</button></p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
