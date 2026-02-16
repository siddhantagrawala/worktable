import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ThreeDLanding from './pages/ThreeDLanding';
import FloorSelector from './pages/FloorSelector';
import SeatMap from './pages/SeatMap';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ThreeDLanding />} />
                <Route path="/floors" element={<FloorSelector />} />
                <Route path="/floor/:id" element={<SeatMap />} />
                <Route path="/booking/:floorId/:seatId" element={<BookingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
