import { Routes, Route } from 'react-router-dom'

// ─── Placeholder Page Components ─────────────────────────────────────
// Replace these with actual page components as modules are developed.

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
  )
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
  )
}

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Sign In</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
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
  )
}

// ─── App Router ──────────────────────────────────────────────────────

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
