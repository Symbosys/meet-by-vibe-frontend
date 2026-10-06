import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PartnerDashboard from './partner/PartnerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import CreateEventScreen from './admin/CreateEventScreen';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Root Route: http://localhost:5173/ -> Partner Portal */}
      <Route
        path="/"
        element={<PartnerDashboard onSwitchToAdmin={() => navigate('/admin')} />}
      />

      {/* Direct Event Creation Screen (Matching Exact UI) */}
      <Route
        path="/create-event"
        element={<CreateEventScreen onBack={() => navigate('/admin')} />}
      />
      <Route
        path="/admin/events/create"
        element={<CreateEventScreen onBack={() => navigate('/admin')} />}
      />

      {/* Admin Route: http://localhost:5173/admin -> Admin Dashboard */}
      <Route
        path="/admin/*"
        element={<AdminDashboard />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
