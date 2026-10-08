import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import CreateEventScreen from './admin/CreateEventScreen';
import { LegalPage } from './partner/LegalPage';
import PartnerDashboard from './partner/PartnerDashboard';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Root Route: http://localhost:5173/ -> Partner Portal */}
      <Route
        path="/"
        element={<PartnerDashboard onSwitchToAdmin={() => navigate('/admin')} />}
      />

      {/* Legal Routes: Privacy Policy & Terms of Service */}
      <Route path="/privacy" element={<LegalPage />} />
      <Route path="/privacy-policy" element={<LegalPage />} />
      <Route path="/terms" element={<LegalPage />} />
      <Route path="/terms-of-service" element={<LegalPage />} />

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
