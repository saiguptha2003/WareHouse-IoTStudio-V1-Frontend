import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import TriggerFiles from './pages/TriggerFiles';
import ConnectFiles from './pages/ConnectFiles';
import StaticFiles from './pages/StaticFiles';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {isAuthenticated && <Sidebar />}
      <div className={`${isAuthenticated ? 'ml-64' : ''} pt-16`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/trigger-files" />} />
          <Route
            path="/trigger-files"
            element={
              <ProtectedRoute>
                <TriggerFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connect-files"
            element={
              <ProtectedRoute>
                <ConnectFiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/static-files"
            element={
              <ProtectedRoute>
                <StaticFiles />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App