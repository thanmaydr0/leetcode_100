import React, { Suspense, useEffect, useState } from 'react';
import { NavLink, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Terminal, Swords, BarChart3, MessageSquare, BookOpen, LogIn, LogOut, User, Keyboard } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Problems = React.lazy(() => import('./pages/Problems'));
const ProblemDetail = React.lazy(() => import('./pages/ProblemDetail'));
const AiTutor = React.lazy(() => import('./pages/AiTutor'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Login = React.lazy(() => import('./pages/Login'));

const navItems = [
  { to: '/', icon: Terminal, label: 'Dashboard' },
  { to: '/problems', icon: BookOpen, label: 'Problems' },
  { to: '/ai-tutor', icon: MessageSquare, label: 'AI Tutor' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function App() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    let lastKey = '';
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside inputs/textareas
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '?') {
        setShowShortcuts(prev => !prev);
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        navigate('/problems');
        // Search bar focus logic will be handled within Problems.tsx utilizing standard autoFocus or simple query param
        return;
      }

      if (lastKey === 'g' || lastKey === 'G') {
        if (e.key === 'p' || e.key === 'P') navigate('/problems');
        if (e.key === 'd' || e.key === 'D') navigate('/');
        if (e.key === 'r' || e.key === 'R') navigate('/profile');
        if (e.key === 'a' || e.key === 'A') navigate('/analytics');
        lastKey = '';
      } else {
        lastKey = e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { lastKey = ''; }, 1000); // 1s window for double key combo
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <ToastProvider>
      <div className="flex h-screen bg-forge-black font-mono text-forge-light overflow-hidden relative">
        {/* Shortcuts Modal Context */}
        {showShortcuts && (
          <div className="absolute inset-0 z-50 bg-forge-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="terminal-card max-w-md w-full animate-fadeIn border-forge-green/50 shadow-[0_0_20px_rgba(0,255,65,0.1)] relative">
              <button onClick={() => setShowShortcuts(false)} className="absolute top-2 right-4 text-forge-text hover:text-forge-light">×</button>
              <div className="flex items-center gap-2 mb-4 border-b border-forge-border/50 pb-2">
                <Keyboard className="w-5 h-5 text-forge-green" />
                <h2 className="text-sm font-bold text-forge-green glow-text-green uppercase tracking-widest">Global Shortcuts</h2>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center"><span className="text-forge-text">Show shortcuts</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">?</span></div>
                <div className="flex justify-between items-center"><span className="text-forge-text">Search Problems</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">/</span></div>
                <div className="flex justify-between items-center"><span className="text-forge-text">Go to Dashboard</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">g then d</span></div>
                <div className="flex justify-between items-center"><span className="text-forge-text">Go to Problems</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">g then p</span></div>
                <div className="flex justify-between items-center"><span className="text-forge-text">Go to Profile</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">g then r</span></div>
                <div className="flex justify-between items-center"><span className="text-forge-text">Go to Analytics</span><span className="bg-forge-dark px-2 border border-forge-border rounded-sm">g then a</span></div>
              </div>
            </div>
          </div>
        )}
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-forge-dark border-r border-forge-border flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-forge-border">
            <div className="flex items-center gap-2">
              <Swords className="w-6 h-6 text-forge-green" />
              <h1 className="text-lg font-bold text-forge-green glow-text-green tracking-wider">
                AlgoForge
              </h1>
            </div>
            <p className="text-[10px] text-forge-text mt-1 tracking-widest uppercase">
              Competitive Prep v1.0
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2 ${isActive
                    ? 'text-forge-green border-forge-green bg-forge-green/5 glow-text-green'
                    : 'text-forge-text border-transparent hover:text-forge-light hover:bg-forge-muted hover:border-forge-border'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Auth Status */}
          <div className="p-4 border-t border-forge-border">
            {user ? (
              <div className="text-xs text-forge-text space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-forge-green animate-pulse-glow" />
                  <span className="truncate">{user.email}</span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 text-forge-text hover:text-forge-red transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 text-xs text-forge-text hover:text-forge-green transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>

          {/* Status Bar */}
          <div className="status-bar text-[10px]">
            <span className="text-forge-green">●</span>
            <span>100 problems loaded</span>
          </div>
        </aside>

        {/* Main Content with Page Transitions */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div key={location.pathname} className="fade-in-up h-full">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 text-forge-green font-mono">
                  <div className="w-12 h-12 border-2 border-forge-green/20 border-t-forge-green rounded-full animate-spin shadow-glow-green" />
                  <span className="text-xs uppercase tracking-widest animate-pulse">Initializing System...</span>
                </div>
              </div>
            }>
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:id" element={<ProblemDetail />} />
                <Route path="/ai-tutor" element={<AiTutor />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
