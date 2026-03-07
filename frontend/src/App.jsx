import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// ─── Layout Components ───────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBot from './components/ChatBot';

// ─── Pages ───────────────────────────────────────────────────────────
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ScanAttendance from './pages/ScanAttendance';
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
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import ManageEvents from './pages/ManageEvents';
import EventCalendarPage from './pages/EventCalendarPage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// ─── New Public Pages ────────────────────────────────────────────────
import Home from './pages/Home';
import PublicFacilities from './pages/PublicFacilities';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import CampusMap from './pages/CampusMap';

function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">404</h1>
        <p className="text-slate-400 mt-4 text-xl">Oops! The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20 hover:-translate-y-1"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

// ─── App Router ──────────────────────────────────────────────────────

function App() {
  const location = useLocation();
  const { user } = useAuth();

  const isPrivilegedUser = ['ADMIN', 'MANAGER', 'TECHNICIAN'].includes(user?.role);
  const isFacilityRoute = location.pathname.startsWith('/facilities');
  const isBookingRoute = location.pathname.startsWith('/bookings');
  const isTicketRoute = location.pathname.startsWith('/tickets');

  const hideFooter = location.pathname === '/dashboard' || (isPrivilegedUser && (isFacilityRoute || isBookingRoute || isTicketRoute));
  const hideNavbar = location.pathname === '/dashboard' || (isPrivilegedUser && (isFacilityRoute || isBookingRoute || isTicketRoute));

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 selection:bg-blue-500/30">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
      {!hideNavbar && <Navbar />}

      <main className="grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/facilities-assets" element={<PublicFacilities />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/campus-map" element={<CampusMap />} />

          <Route path="/login" element={<Login />} />
          <Route path="/forbidden" element={<Forbidden />} />

          {/* Protected routes — requires authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'TECHNICIAN']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER', 'TECHNICIAN']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/attendance/scan" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <ScanAttendance />
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

          {/* Events routes */}
          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />
          <Route path="/events/calendar" element={
            <ProtectedRoute>
              <EventCalendarPage />
            </ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          } />

          {/* Booking routes */}
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
          <Route path="/admin/events" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ManageEvents />
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
      </main>

      {/* Global Footer */}
      {!hideFooter && <Footer />}

      {/* AI Chatbot Widget */}
      <ChatBot />
    </div>
  );
}

export default App;
