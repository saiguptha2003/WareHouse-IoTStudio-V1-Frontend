import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ConnectionForm {
  connection_name: string;
  connection_discription: string;
  protocol: string;
  connection_url: string;
  port: number;
  subscribe_topic: string;
  qos: number;
  keep_alive: number;
  authenticated_broker: boolean;
  username: string;
  password: string;
  typeof_connection: string;
  response_parameters: string[];
}

const inputStyles = "mt-1 block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3";
const selectStyles = "mt-1 block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3";

const CreateConnection: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ConnectionForm>({
    connection_name: '',
    connection_discription: '',
    protocol: 'mqtt',
    connection_url: '',
    port: 1883,
    subscribe_topic: '',
    qos: 0,
    keep_alive: 30,
    authenticated_broker: false,
    username: '',
    password: '',
    typeof_connection: 'online',
    response_parameters: []
  });

  const [parameter, setParameter] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/services/IotConnect/createServiceConnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          created_at: Date.now().toString(),
          ping_status: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Connection created:', data);
        navigate('/connect/view');
      } else {
        console.error('Failed to create connection');
      }
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addParameter = () => {
    if (parameter.trim()) {
      setFormData(prev => ({
        ...prev,
        response_parameters: [...prev.response_parameters, parameter.trim()]
      }));
      setParameter('');
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
                  <input
                    type="text"
                    name="connection_name"
                    value={formData.connection_name}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protocol</label>
                  <select
                    name="protocol"
                    value={formData.protocol}
                    onChange={handleChange}
                    className={selectStyles}
                  >
                    <option value="mqtt">MQTT</option>
                    <option value="http">HTTP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection URL</label>
                  <input
                    type="text"
                    name="connection_url"
                    value={formData.connection_url}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscribe Topic</label>
                  <input
                    type="text"
                    name="subscribe_topic"
                    value={formData.subscribe_topic}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">QoS</label>
                  <select
                    name="qos"
                    value={formData.qos}
                    onChange={handleChange}
                    className={selectStyles}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keep Alive (seconds)</label>
                  <input
                    type="number"
                    name="keep_alive"
                    value={formData.keep_alive}
                    onChange={handleChange}
                    className={inputStyles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
                  <select
                    name="typeof_connection"
                    value={formData.typeof_connection}
                    onChange={handleChange}
                    className={selectStyles}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="authenticated_broker"
                    checked={formData.authenticated_broker}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-400 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Authenticated Broker
                  </label>
                </div>

                {formData.authenticated_broker && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="connection_discription"
                  value={formData.connection_discription}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputStyles} min-h-[60px]`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response Parameters</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={parameter}
                    onChange={(e) => setParameter(e.target.value)}
                    className={inputStyles}
                    placeholder="Add parameter"
                  />
                  <button
                    type="button"
                    onClick={addParameter}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.response_parameters.map((param, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {param}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            response_parameters: prev.response_parameters.filter((_, i) => i !== index)
                          }));
                        }}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center w-full">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create Connection
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateConnection; 