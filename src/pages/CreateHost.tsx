import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface BrokerStatus {
  broker: {
    host: string;
    last_checked: string;
    ports: {
      mqtt: number;
      websocket: number;
    };
    status: string;
  };
}

const CreateHost: React.FC = () => {
  const [useAuthentication, setUseAuthentication] = useState(false);
  const [connectionType, setConnectionType] = useState('mqtt');
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBrokerStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Token:', token);

        const response = await fetch('http://localhost:5000/services/SelfHost/mqtt/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Please check your authentication');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch broker status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Broker Status Data:', data);
        setBrokerStatus(data);
      } catch (error) {
        console.error('Error fetching broker status:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBrokerStatus();
      const interval = setInterval(fetchBrokerStatus, 30000);
      return () => clearInterval(interval);
    } else {
      setError('No authentication token available');
    }
  }, [token]);

  return (
    <div className="flex h-full p-8">
      {/* Form Section (2/3 width) */}
      <div className="w-2/3 pr-8">
        
        <form className="space-y-6 bg-white p-8 rounded-lg shadow-lg">
          {/* Basic Configuration */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Name</label>
              <input 
                type="text" 
                className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connection Type</label>
              <select 
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="mqtt">MQTT</option>
                <option value="websocket">WebSocket</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
              <input 
                type="text" 
                className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">QoS Level</label>
              <select 
                className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="0">0 - At most once</option>
                <option value="1">1 - At least once</option>
                <option value="2">2 - Exactly once</option>
              </select>
            </div>
          </div>

          {/* Optional Parameters */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-t pt-6">Optional Parameters</h2>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={useAuthentication}
                  onChange={(e) => setUseAuthentication(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2">Use Authentication</span>
              </label>
            </div>

            {useAuthentication && (
              <div className="space-y-6 pl-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    className="w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" 
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="w-full h-12 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Host
            </button>
          </div>
        </form>
      </div>

      {/* Status Card Section (1/3 width) */}
      <div className="w-1/3 flex flex-col items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-xl font-bold mb-2">Broker Status</h2>
            <img 
              src="/images/mosquitto.ico"
              alt="Mosquitto"
              className="w-15 h-15 object-contain"
            />
          </div>
          
          {isLoading ? (
            <div className="text-center text-gray-500">Loading broker status...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : brokerStatus && brokerStatus.broker ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <div className="flex items-center">
                  {brokerStatus.broker.status === 'running' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-500">Running</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-500">Not Running</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Host:</span>
                <span>{brokerStatus.broker.host}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">MQTT Port:</span>
                <span>{brokerStatus.broker.ports.mqtt}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">WebSocket Port:</span>
                <span>{brokerStatus.broker.ports.websocket}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Last Checked:</span>
                <span>{new Date(brokerStatus.broker.last_checked).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No broker status available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateHost;