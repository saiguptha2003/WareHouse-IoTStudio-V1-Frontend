import React from 'react';
import { Outlet } from 'react-router-dom';
import SelfHostSidebar from '../components/SelfHostSidebar';

const SelfHost: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SelfHostSidebar />
      <div className="flex-1 ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default SelfHost; 