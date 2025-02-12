import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Connection {
  connection_id: string;
  connection_name: string;
  connection_discription: string;
  connection_url: string;
  protocol: string;
  subscribe_topic: string;
}

const CreateTrigger: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [triggerData, setTriggerData] = useState({
    name: '',
    description: '',
    connection_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch('http://localhost:5000/services/IotConnect/getAllIoTConnections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }

      const data: Connection[] = await response.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/Trigger/createTrigger', {
        method: 'POST',
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          trigger_name: triggerData.name.trim(),
          trigger_discription: triggerData.description.trim(),
          connection_id: triggerData.connection_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trigger');
      }

      navigate('/trigger/list');
    } catch (error) {
      setError('Failed to create trigger');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="p-8">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Trigger Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={triggerData.name}
                onChange={(e) => setTriggerData({...triggerData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors duration-200"
                placeholder="Enter trigger name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                required
                value={triggerData.description}
                onChange={(e) => setTriggerData({...triggerData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors duration-200"
                placeholder="Enter trigger description"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="connection" className="block text-sm font-medium text-gray-700">
                Connection *
              </label>
              <select
                id="connection"
                required
                value={triggerData.connection_id}
                onChange={(e) => setTriggerData({...triggerData, connection_id: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors duration-200"
              >
                <option value="">Select a connection</option>
                {connections.map((connection) => (
                  <option key={connection.connection_id} value={connection.connection_id}>
                    {connection.connection_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Trigger'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrigger; 