import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Trigger: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">IoT Platform</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/trigger/static-files"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Static Files
                </Link>
                <Link
                  to="/trigger/create"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Create Trigger
                </Link>
                <Link
                  to="/trigger/list"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  All Triggers
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Trigger; 