import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ─── Layout Components ───────────────────────────────────────────────
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// ─── Pages ───────────────────────────────────────────────────────────
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import Forbidden from './pages/Forbidden';

// ─── Placeholder Pages (to be replaced by team members) ─────────────

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white tracking-tight">
          🏫 Smart Campus <span className="text-blue-400">Operations Hub</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Your unified platform for managing campus operations efficiently.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            Dashboard
          </a>
          <a href="/login" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 mb-8">Welcome to the Smart Campus Operations Hub.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Module A', 'Module B', 'Module C', 'Module D'].map((mod) => (
            <div key={mod} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-colors">
              <h3 className="text-lg font-semibold text-white">{mod}</h3>
              <p className="text-slate-400 text-sm mt-2">Placeholder for {mod} content.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-400">404</h1>
        <p className="text-slate-400 mt-4 text-lg">Page not found.</p>
        <a href="/" className="inline-block mt-6 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
          Go Home
        </a>
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

        {/* Admin-only routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
