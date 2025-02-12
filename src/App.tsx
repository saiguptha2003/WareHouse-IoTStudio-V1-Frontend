import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import TriggerFiles from './pages/TriggerFiles';
import ConnectFiles from './pages/ConnectFiles';
import StaticFiles from './pages/StaticFiles';
import CustomizedSection from './pages/CustomizedSectionPage';
import CreateTrigger from './pages/CreateTrigger';
import TriggerList from './pages/TriggerList';
import Dashboard from './pages/Dashboard';
import Trigger from './pages/Trigger';
import TriggerSidebar from './components/TriggerSidebar';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isTriggerRoute = location.pathname.startsWith('/trigger');

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {isAuthenticated && !isDashboard && !isTriggerRoute && <Sidebar />}
      {isAuthenticated && isTriggerRoute && <TriggerSidebar />}
      <div className={`${isAuthenticated && (isTriggerRoute || !isDashboard) ? 'ml-64' : ''} pt-16`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Warehouse routes */}
          <Route path="/warehouse">
            <Route path="trigger-files" element={
              <ProtectedRoute>
                <TriggerFiles />
              </ProtectedRoute>
            } />
            <Route path="connect-files" element={
              <ProtectedRoute>
                <ConnectFiles />
              </ProtectedRoute>
            } />
            <Route path="static-files" element={
              <ProtectedRoute>
                <StaticFiles />
              </ProtectedRoute>
            } />
            <Route path="customized-section/:sectionId" element={<CustomizedSection />} />
          </Route>

          {/* Trigger routes */}
          <Route path="/trigger">
            <Route index element={
              <ProtectedRoute>
                <TriggerList />
              </ProtectedRoute>
            } />
            <Route path="create" element={
              <ProtectedRoute>
                <CreateTrigger />
              </ProtectedRoute>
            } />
            <Route path="list" element={
              <ProtectedRoute>
                <TriggerList />
              </ProtectedRoute>
            } />
          </Route>
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