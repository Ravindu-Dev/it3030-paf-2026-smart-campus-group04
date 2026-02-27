import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// ─── Layout Components ───────────────────────────────────────────────
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Pages ───────────────────────────────────────────────────────────
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import Forbidden from './pages/Forbidden';
import Facilities from './pages/Facilities';
import FacilityDetail from './pages/FacilityDetail';
import ManageFacilities from './pages/ManageFacilities';
import MyBookings from './pages/MyBookings';
import BookingForm from './pages/BookingForm';
import BookingDetail from './pages/BookingDetail';
import ManageBookings from './pages/ManageBookings';
import MyTickets from './pages/MyTickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import ManageTickets from './pages/ManageTickets';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// ─── Landing Page ────────────────────────────────────────────────────

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center space-y-8 relative z-10 px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <span className="text-white text-4xl font-bold">S</span>
          </div>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
          Smart Campus
          <span className="block text-blue-400 mt-1">Operations Hub</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
          Your unified platform for managing campus resources, maintenance,
          events, and operations — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center">
          {['📋 Resource Booking', '🔧 Maintenance', '📅 Events', '🔔 Notifications', '🔑 OAuth 2.0'].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full text-slate-300 text-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center pt-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:scale-105"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 hover:scale-105"
              >
                Get Started →
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">404</h1>
        <p className="text-slate-400 mt-4 text-lg">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

// ─── App Router ──────────────────────────────────────────────────────

function App() {
  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#3b82f6', secondary: '#1e293b' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
          },
        }}
      />

      {/* Global Navbar */}
      <Navbar />

      {/* Routes */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Protected routes — requires authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Facilities routes */}
        <Route path="/facilities" element={
          <ProtectedRoute>
            <Facilities />
          </ProtectedRoute>
        } />
        <Route path="/facilities/:id" element={
          <ProtectedRoute>
            <FacilityDetail />
          </ProtectedRoute>
        } />

        {/* Booking routes */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/bookings/new" element={
          <ProtectedRoute>
            <BookingForm />
          </ProtectedRoute>
        } />
        <Route path="/bookings/:id" element={
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/admin/facilities" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageFacilities />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageBookings />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />

        {/* Ticket routes */}
        <Route path="/tickets" element={
          <ProtectedRoute>
            <MyTickets />
          </ProtectedRoute>
        } />
        <Route path="/tickets/new" element={
          <ProtectedRoute>
            <CreateTicket />
          </ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        } />

        {/* Admin ticket management */}
        <Route path="/admin/tickets" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageTickets />
          </ProtectedRoute>
        } />

        {/* Manager dashboard */}
        <Route path="/manager/tickets" element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerDashboard />
          </ProtectedRoute>
        } />

        {/* Technician dashboard */}
        <Route path="/technician/dashboard" element={
          <ProtectedRoute allowedRoles={['TECHNICIAN']}>
            <TechnicianDashboard />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
