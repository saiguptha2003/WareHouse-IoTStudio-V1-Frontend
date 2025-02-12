import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wifi, WifiOff, Trash2, Edit, MoreVertical, X, ArrowDownAZ, TestTube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface IoTConnection {
  authenticated_broker: boolean;
  connection_discription: string;
  connection_id: string;
  connection_name: string;
  connection_url: string;
  created_at: string;
  keep_alive: number;
  password: string;
  ping_status: boolean;
  port: number;
  protocol: string;
  qos: number;
  response_parameters: string[];
  subscribe_topic: string;
  typeof_connection: string;
  username: string;
}

type SortConfig = {
  key: keyof IoTConnection | null;
  direction: 'asc' | 'desc';
};

const IoTConnections: React.FC = () => {
  const { token } = useAuth();
  const [connections, setConnections] = useState<IoTConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState<IoTConnection | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, [token]);

  const fetchConnections = async () => {
    try {
      const response = await fetch('http://localhost:5000/services/IotConnect/getAllIoTConnections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      } else {
        console.error('Failed to fetch connections');
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/services/IotConnect/deleteServiceConnect/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setConnections(connections.filter(conn => conn.connection_id !== connectionId));
        setShowDeleteModal(false);
        setSelectedConnection(null);
      } else {
        console.error('Failed to delete connection');
      }
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const handleSort = (key: keyof IoTConnection) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedConnections = React.useMemo(() => {
    if (!sortConfig.key) return connections;

    return [...connections].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [connections, sortConfig]);

  const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof IoTConnection;
  }> = ({ label, sortKey }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center space-x-1 hover:text-gray-700"
      >
        <span>{label}</span>
        <ArrowDownAZ 
          className={`h-4 w-4 transition-colors ${
            sortConfig.key === sortKey 
              ? 'text-green-500' 
              : 'text-gray-400'
          }`}
        />
      </button>
    </th>
  );

  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !selectedConnection) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Connection</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete connection "{selectedConnection.connection_name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(selectedConnection.connection_id)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ConnectionDetailsModal = () => {
    if (!showDetailsModal || !selectedConnection) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Connection Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(selectedConnection).map(([key, value]) => (
              <div key={key} className="col-span-2 sm:col-span-1">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {key.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="text-sm text-gray-900">
                  {Array.isArray(value) ? value.join(', ') : 
                   typeof value === 'boolean' ? value.toString() : 
                   value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableHeader label="Connection Name" sortKey="connection_name" />
                    <SortableHeader label="Connection URL" sortKey="connection_url" />
                    <SortableHeader label="Port" sortKey="port" />
                    <SortableHeader label="Subscribe Topic" sortKey="subscribe_topic" />
                    <SortableHeader label="Created At" sortKey="created_at" />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedConnections.map((connection) => (
                    <tr key={connection.connection_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {connection.connection_name}
                          </span>
                          {connection.ping_status ? (
                            <Wifi className="ml-2 h-4 w-4 text-green-500" />
                          ) : (
                            <WifiOff className="ml-2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.connection_url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.port}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {connection.subscribe_topic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(connection.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowDetailsModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/test-space/${connection.connection_id}`)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Test Connection"
                          >
                            <TestTube className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal />
      <ConnectionDetailsModal />
    </div>
  );
};

export default IoTConnections; 