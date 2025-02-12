import React from 'react';

const IoTConnect: React.FC = () => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Welcome to IoT Connect
            </h1>
            <p className="text-gray-600">
              Select an option from the sidebar to get started with managing your IoT connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IoTConnect; 