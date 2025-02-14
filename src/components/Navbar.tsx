import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
          <img
              src="images/warehouse.png"
              alt="Warehouse Logo"
              className="h-15 w-14"
            />
            <span className="text-xl font-bold text-gray-800">IoT-Studio</span>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;