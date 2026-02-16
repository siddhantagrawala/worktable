import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CreditCard, Calendar, CheckCircle2, Shield, QrCode, Download, Monitor, DoorOpen, Crown, Users, Presentation, AlertCircle, Info } from 'lucide-react';
import { getFloorById, SEAT_TYPE_INFO, SEAT_TYPES } from '../data/floors';
import './BookingPage.css';

const typeIcons = {
    [SEAT_TYPES.OPEN]: Monitor,
    [SEAT_TYPES.CABIN]: DoorOpen,
    [SEAT_TYPES.MANAGER]: Crown,
    [SEAT_TYPES.MEETING]: Users,
    [SEAT_TYPES.CONFERENCE]: Presentation,
};

// Generate time slots
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
        slots.push({
            value: `${hour.toString().padStart(2, '0')}:00`,
            label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        });
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

export default function BookingPage() {
    const { floorId, seatId } = useParams();
    const navigate = useNavigate();
    const floor = getFloorById(floorId);
    const seat = floor?.seats.find(s => s.id === seatId);

    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmed
    const [holdTime, setHoldTime] = useState(7200); // 2 hours in seconds
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStartTime, setSelectedStartTime] = useState('09:00');
    const [selectedEndTime, setSelectedEndTime] = useState('18:00');
    const [selectedDuration, setSelectedDuration] = useState('day');
    const [hoursOption, setHoursOption] = useState(4);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [errors, setErrors] = useState({});

    // Hold timer countdown
    useEffect(() => {
        if (step === 3) return;
        const timer = setInterval(() => {
            setHoldTime(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [step]);

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    // Validate booking details
    const validateStep1 = () => {
        const newErrors = {};

        if (!selectedDate) {
            newErrors.date = 'Please select a booking date';
        } else {
            const selectedDateObj = new Date(selectedDate);
            const todayObj = new Date(today);
            if (selectedDateObj < todayObj) {
                newErrors.date = 'Cannot book for past dates';
            }
        }

        if (SEAT_TYPE_INFO[seat?.type]?.pricePerHour) {
            // For hourly bookings, validate time
            if (!selectedStartTime || !selectedEndTime) {
                newErrors.time = 'Please select start and end time';
            } else if (selectedStartTime >= selectedEndTime) {
                newErrors.time = 'End time must be after start time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (!floor || !seat) {
        return (
            <div className="page flex-center" style={{ flexDirection: 'column', gap: 16 }}>
                <h2>Seat not found</h2>
                <Link to="/floors" className="btn btn-primary">Back to Floors</Link>
            </div>
        );
    }

    const info = SEAT_TYPE_INFO[seat.type];
    const Icon = typeIcons[seat.type];
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const holdPercentage = (holdTime / 7200) * 100;
    const bookingId = `WT-${Date.now().toString(36).toUpperCase()}`;

    // Calculate pricing based on selection
    const pricing = useMemo(() => {
        const result = {
            basePrice: 0,
            hours: 0,
            subtotal: 0,
            tax: 0,
            total: 0,
            durationLabel: '',
        };

        if (info.pricePerMonth) {
            // Monthly or daily pricing
            if (selectedDuration === 'day') {
                result.basePrice = info.pricePerDay || 0;
                result.durationLabel = 'Day Pass';
            } else {
                result.basePrice = info.pricePerMonth;
                result.durationLabel = 'Monthly';
            }
        } else if (info.pricePerHour) {
            // Hourly pricing
            const startHour = parseInt(selectedStartTime.split(':')[0]);
            const endHour = parseInt(selectedEndTime.split(':')[0]);
            result.hours = endHour - startHour;
            result.basePrice = info.pricePerHour;
            result.durationLabel = `${result.hours} Hour${result.hours > 1 ? 's' : ''}`;
        }

        result.subtotal = result.basePrice;
        result.tax = Math.round(result.subtotal * 0.18); // 18% GST
        result.total = result.subtotal + result.tax;

        return result;
    }, [info, selectedDuration, selectedStartTime, selectedEndTime]);

    const handleContinue = () => {
        if (step === 1) {
            if (validateStep1()) {
                setStep(2);
            }
        } else if (step === 2) {
            if (!termsAccepted) {
                setErrors({ ...errors, terms: 'Please accept the terms and conditions' });
                return;
            }
            setStep(3);
        }
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="page booking-page">
            <div className="container">
                {step < 3 && (
                    <Link to={`/floor/${floorId}`} className="seat-map__back">
                        <ArrowLeft size={18} />
                        Back to Floor Map
                    </Link>
                )}

                {/* Hold Timer Bar */}
                {step < 3 && (
                    <div className="hold-timer animate-fade-in-up">
                        <div className="hold-timer__bar">
                            <div className="hold-timer__fill" style={{ width: `${holdPercentage}%` }} />
                        </div>
                        <div className="hold-timer__info">
                            <Clock size={14} />
                            <span>Booking hold expires in <strong>{formatTime(holdTime)}</strong></span>
                        </div>
                    </div>
                )}

                {/* Steps Indicator */}
                <div className="booking-steps animate-fade-in-up stagger-1">
                    {['Seat Details', 'Payment', 'Confirmed'].map((label, i) => (
                        <div key={i} className={`booking-step ${step > i ? 'booking-step--done' : ''} ${step === i + 1 ? 'booking-step--active' : ''}`}>
                            <div className="booking-step__number">
                                {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
                            </div>
                            <span className="booking-step__label">{label}</span>
                        </div>
                    ))}
                </div>

                <div className="booking-layout">
                    {/* Main Content */}
                    <div className="booking-main animate-fade-in-up stagger-2">
                        {step === 1 && (
                            <div className="booking-card">
                                <h2>Confirm Your Seat</h2>
                                <div className="divider mt-md mb-lg" />

                                <div className="booking-seat-preview">
                                    <div className="booking-seat-preview__icon" style={{ color: info.color }}>
                                        <Icon size={36} />
                                    </div>
                                    <div className="booking-seat-preview__info">
                                        <h3>{seat.label}</h3>
                                        <p>{info.label} - {floor.name}</p>
                                        <p className="text-muted">{info.description}</p>
                                    </div>
                                </div>

                                <div className="booking-form mt-xl">
                                    {/* Date Picker */}
                                    <div className="form-group">
                                        <label>
                                            <Calendar size={14} /> Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setErrors({ ...errors, date: null });
                                            }}
                                            min={today}
                                        />
                                        {errors.date && (
                                            <div className="form-error">
                                                <AlertCircle size={14} /> {errors.date}
                                            </div>
                                        )}
                                    </div>

                                    {/* For hourly seats - Time Picker */}
                                    {info.pricePerHour && (
                                        <div className="form-group">
                                            <label>
                                                <Clock size={14} /> Select Time
                                            </label>
                                            <div className="time-picker">
                                                <select
                                                    value={selectedStartTime}
                                                    onChange={(e) => {
                                                        setSelectedStartTime(e.target.value);
                                                        setErrors({ ...errors, time: null });
                                                    }}
                                                >
                                                    {TIME_SLOTS.slice(0, -1).map(slot => (
                                                        <option key={slot.value} value={slot.value}>
                                                            {slot.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="time-picker__separator">to</span>
                                                <select
                                                    value={selectedEndTime}
                                                    onChange={(e) => {
                                                        setSelectedEndTime(e.target.value);
                                                        setErrors({ ...errors, time: null });
                                                    }}
                                                >
                                                    {TIME_SLOTS.slice(1).map(slot => (
                                                        <option key={slot.value} value={slot.value}>
                                                            {slot.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.time && (
                                                <div className="form-error">
                                                    <AlertCircle size={14} /> {errors.time}
                                                </div>
                                            )}
                                            <p className="form-hint">
                                                <Info size={12} /> {info.includedHours} hrs/month included for members
                                            </p>
                                        </div>
                                    )}

                                    {/* For seats with monthly/daily pricing */}
                                    {info.pricePerMonth && (
                                        <div className="form-group">
                                            <label>Duration</label>
                                            <div className="duration-options">
                                                <button
                                                    className={`duration-option ${selectedDuration === 'day' ? 'active' : ''}`}
                                                    onClick={() => setSelectedDuration('day')}
                                                >
                                                    <span className="duration-option__label">Day Pass</span>
                                                    <span className="duration-option__price">Rs. {info.pricePerDay?.toLocaleString()}</span>
                                                </button>
                                                <button
                                                    className={`duration-option ${selectedDuration === 'month' ? 'active' : ''}`}
                                                    onClick={() => setSelectedDuration('month')}
                                                >
                                                    <span className="duration-option__label">Monthly</span>
                                                    <span className="duration-option__price">Rs. {info.pricePerMonth?.toLocaleString()}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* For hourly seats - Hours selection */}
                                    {info.pricePerHour && (
                                        <div className="form-group">
                                            <label>Duration</label>
                                            <div className="hours-options">
                                                {[1, 2, 3, 4].map(hours => (
                                                    <button
                                                        key={hours}
                                                        className={`hours-option ${hoursOption === hours ? 'active' : ''}`}
                                                        onClick={() => setHoursOption(hours)}
                                                    >
                                                        <span className="hours-option__label">{hours} Hour{hours > 1 ? 's' : ''}</span>
                                                        <span className="hours-option__price">Rs. {(info.pricePerHour * hours).toLocaleString()}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button className="btn btn-primary btn-lg mt-xl" style={{ width: '100%' }} onClick={handleContinue}>
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="booking-card">
                                <h2>Payment</h2>
                                <div className="divider mt-md mb-lg" />

                                <div className="payment-methods">
                                    <label>Choose Payment Method</label>
                                    {[
                                        { id: 'upi', label: 'UPI (GPay / PhonePe / Paytm)', icon: '1' },
                                        { id: 'card', label: 'Credit / Debit Card', icon: '2' },
                                        { id: 'netbanking', label: 'Net Banking', icon: '3' },
                                        { id: 'wallet', label: 'Wallet', icon: '4' },
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                                            onClick={() => setPaymentMethod(method.id)}
                                        >
                                            <span className="payment-method__icon">{method.icon}</span>
                                            <span>{method.label}</span>
                                            <div className={`payment-method__radio ${paymentMethod === method.id ? 'active' : ''}`} />
                                        </button>
                                    ))}
                                </div>

                                {/* Terms and Conditions */}
                                <div className="terms-acceptance mt-lg">
                                    <label className="terms-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => {
                                                setTermsAccepted(e.target.checked);
                                                setErrors({ ...errors, terms: null });
                                            }}
                                        />
                                        <span className="terms-checkbox__mark">
                                            {termsAccepted && <CheckCircle2 size={14} />}
                                        </span>
                                        <span className="terms-checkbox__text">
                                            I agree to the <a href="#terms">Terms and Conditions</a> and <a href="#privacy">Privacy Policy</a>
                                        </span>
                                    </label>
                                    {errors.terms && (
                                        <div className="form-error">
                                            <AlertCircle size={14} /> {errors.terms}
                                        </div>
                                    )}
                                </div>

                                <div className="payment-secure mt-md">
                                    <Shield size={14} />
                                    <span>256-bit SSL encrypted. Your payment is secure.</span>
                                </div>

                                <button className="btn btn-primary btn-lg mt-xl" style={{ width: '100%' }} onClick={handleContinue}>
                                    <CreditCard size={18} />
                                    Pay Rs. {pricing.total.toLocaleString()}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="booking-card booking-card--confirmed">
                                <div className="confirmed-animation">
                                    <div className="confirmed-check">
                                        <CheckCircle2 size={64} />
                                    </div>
                                </div>

                                <h2 className="text-center mt-lg">Booking Confirmed!</h2>
                                <p className="text-center mt-sm">Your workspace is reserved and ready.</p>

                                <div className="confirmed-details mt-xl">
                                    <div className="confirmed-qr">
                                        <QrCode size={80} strokeWidth={1} />
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>Scan for entry</span>
                                    </div>

                                    <div className="confirmed-info">
                                        <div className="confirmed-row">
                                            <span className="text-muted">Booking ID</span>
                                            <span className="fw-600">{bookingId}</span>
                                        </div>
                                        <div className="confirmed-row">
                                            <span className="text-muted">Seat</span>
                                            <span>{seat.label} - {info.label}</span>
                                        </div>
                                        <div className="confirmed-row">
                                            <span className="text-muted">Floor</span>
                                            <span>{floor.name}</span>
                                        </div>
                                        <div className="confirmed-row">
                                            <span className="text-muted">Date</span>
                                            <span>{selectedDate || today}</span>
                                        </div>
                                        {info.pricePerHour && (
                                            <div className="confirmed-row">
                                                <span className="text-muted">Time</span>
                                                <span>{selectedStartTime} - {selectedEndTime}</span>
                                            </div>
                                        )}
                                        <div className="confirmed-row">
                                            <span className="text-muted">Amount Paid</span>
                                            <span className="text-copper fw-600">Rs. {pricing.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="confirmed-actions mt-xl">
                                    <button className="btn btn-secondary">
                                        <Download size={16} /> Download Receipt
                                    </button>
                                    <button className="btn btn-primary" onClick={handleGoToDashboard}>
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    {step < 3 && (
                        <div className="booking-sidebar animate-fade-in-up stagger-3">
                            <div className="booking-summary">
                                <h4>Booking Summary</h4>
                                <div className="divider mt-sm mb-md" />

                                <div className="summary-row">
                                    <span>Workspace</span>
                                    <span className="fw-600">{seat.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Type</span>
                                    <span>{info.label}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Floor</span>
                                    <span>{floor.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Capacity</span>
                                    <span>{info.capacity}</span>
                                </div>
                                {selectedDate && (
                                    <div className="summary-row">
                                        <span>Date</span>
                                        <span>{selectedDate}</span>
                                    </div>
                                )}
                                {info.pricePerHour && selectedStartTime && selectedEndTime && (
                                    <div className="summary-row">
                                        <span>Time</span>
                                        <span>{selectedStartTime} - {selectedEndTime}</span>
                                    </div>
                                )}
                                {info.pricePerMonth && (
                                    <div className="summary-row">
                                        <span>Duration</span>
                                        <span>{pricing.durationLabel}</span>
                                    </div>
                                )}

                                {/* Pricing Breakdown */}
                                <div className="pricing-breakdown mt-lg">
                                    <h5>Price Breakdown</h5>
                                    <div className="pricing-row">
                                        <span>Base Price ({pricing.durationLabel || '1'})</span>
                                        <span>Rs. {pricing.basePrice.toLocaleString()}</span>
                                    </div>
                                    {info.pricePerHour && (
                                        <div className="pricing-row">
                                            <span>Hours</span>
                                            <span>{pricing.hours} hr(s)</span>
                                        </div>
                                    )}
                                    <div className="pricing-row">
                                        <span>Subtotal</span>
                                        <span>Rs. {pricing.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="pricing-row pricing-row--tax">
                                        <span>GST (18%)</span>
                                        <span>Rs. {pricing.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="pricing-row pricing-row--total">
                                        <span>Total</span>
                                        <span>Rs. {pricing.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="summary-total">
                                    <span>Total</span>
                                    <span className="summary-total__amount">Rs. {pricing.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
