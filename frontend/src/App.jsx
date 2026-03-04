import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/ui';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Parking from './pages/Parking';
import Gym from './pages/Gym';
import Healthcare from './pages/Healthcare';
import AQI from './pages/AQI';
import Support from './pages/Support';
import Maintenance from './pages/Maintenance';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// Protected Route wrapper
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

      {/* Protected — all roles */}
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/parking" element={<Protected><Parking /></Protected>} />
      <Route path="/gym" element={<Protected><Gym /></Protected>} />
      <Route path="/healthcare" element={<Protected><Healthcare /></Protected>} />
      <Route path="/aqi" element={<Protected><AQI /></Protected>} />
      <Route path="/support" element={<Protected><Support /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />

      {/* Maintenance + Admin */}
      <Route path="/maintenance" element={<Protected roles={['maintenance', 'admin']}><Maintenance /></Protected>} />

      {/* Admin only */}
      <Route path="/admin" element={<Protected roles={['admin']}><Admin /></Protected>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
