import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddPatentForm from './pages/AddPatentForm';

function App() {
  // Simple state for Light/Dark mode.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <Router>
      <div className="app-container">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-patent" element={<AddPatentForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
