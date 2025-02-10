import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Files, Link as LinkIcon, FileBox } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/trigger-files', label: 'Trigger Files', icon: Files },
    { path: '/connect-files', label: 'Connect Files', icon: LinkIcon },
    { path: '/static-files', label: 'Static Files', icon: FileBox },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-16">
      <div className="py-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 ${
              location.pathname === path
                ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;