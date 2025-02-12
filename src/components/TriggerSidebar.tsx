import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, List, Trash2, LayoutDashboard } from "lucide-react";

const TriggerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const triggerNavItems = [
    { path: "/trigger/create", label: "Create Trigger", icon: Plus },
    { path: "/trigger/list", label: "All Triggers", icon: List },
  ];

  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed left-0 top-16 flex flex-col">
      {/* Dashboard Button */}
      <div className="py-3 border-b border-gray-200">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full text-left px-8 py-3 flex items-center space-x-3 font-bold text-gray-700 hover:bg-gray-50"
        >
          <LayoutDashboard className="w-5 h-5 mr-2" />
          Dashboard
        </button>
      </div>

      {/* Trigger Nav Items */}
      <div className="py-4">
        {triggerNavItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 font-medium ${
              location.pathname === path 
                ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TriggerSidebar; 