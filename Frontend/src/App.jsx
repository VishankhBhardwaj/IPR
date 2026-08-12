import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddPatentForm from './pages/AddPatentForm';
import PatentDetails from './pages/PatentDetails';
import Analysis from './pages/Analysis';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

/* ---- Small helper: check if user is authenticated ---- */
const isAuthenticated = () => !!localStorage.getItem('token');

/* ---- Protected route wrapper ---- */
const ProtectedRoute = ({ children, isAuthed }) => {
  return isAuthed ? children : <Navigate to="/auth" replace />;
};

/* ---- Admin route wrapper ---- */
const AdminRoute = ({ children, isAuthed, role }) => {
  if (!isAuthed) return <Navigate to="/auth" replace />;
  return role === 'ADMIN' ? children : <Navigate to="/" replace />;
};

function App() {
  // Simple state for Light/Dark mode.
  const [isDark, setIsDark] = useState(false);
  const [authed, setAuthed] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleAuthSuccess = () => {
    setAuthed(true);
    setUserRole(localStorage.getItem('role') || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthed(false);
    setUserRole('');
  };

  return (
    <Router>
      <div className="app-container">
        {/* Only show navbar when authenticated */}
        {authed && <Navbar isDark={isDark} toggleTheme={toggleTheme} onLogout={handleLogout} role={userRole} />}

        <main className={authed ? 'page-wrapper' : ''}>
          <Routes>
            {/* Public route */}
            <Route
              path="/auth"
              element={
                authed
                  ? <Navigate to="/" replace />
                  : <Auth onAuthSuccess={handleAuthSuccess} />
              }
            />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute isAuthed={authed}><Dashboard /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute isAuthed={authed}><Analysis /></ProtectedRoute>} />
            <Route path="/add-patent" element={<ProtectedRoute isAuthed={authed}><AddPatentForm /></ProtectedRoute>} />
            <Route path="/edit-patent/:id" element={<ProtectedRoute isAuthed={authed}><AddPatentForm /></ProtectedRoute>} />
            <Route path="/patent/:id" element={<ProtectedRoute isAuthed={authed}><PatentDetails /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute isAuthed={authed} role={userRole}><Admin /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={authed ? (userRole === 'ADMIN' ? '/admin' : '/') : '/auth'} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
