import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Square, Trash2, MoreVertical, X, ArrowDownAZ } from 'lucide-react';

interface ConnectionDetails {
  connection_name: string;
  connection_url: string;
  protocol: string;
  subscribe_topic: string;
}

interface Trigger {
  trigger_id: string;
  trigger_name: string;
  trigger_description: string;
  created_at: string;
  status?: 'running' | 'stopped';
  connection_details: ConnectionDetails;
  file_path?: string;
}

interface TriggerResponse {
  total_count: number;
  triggers: Trigger[];
}

interface TriggerModalProps {
  trigger: Trigger;
  onClose: () => void;
  onStart: (triggerId: string) => void;
  onStop: (triggerId: string, userId: string, connectionId: string) => void;
  onDelete: (triggerId: string) => void;
}

const TriggerModal: React.FC<TriggerModalProps> = ({ trigger, onClose, onStart, onStop, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{trigger.trigger_name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <table className="min-w-full">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500 w-1/3">Description</td>
                <td className="py-3 text-sm text-gray-900">{trigger.trigger_description}</td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Trigger ID</td>
                <td className="py-3 text-sm text-gray-900">{trigger.trigger_id}</td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Created At</td>
                <td className="py-3 text-sm text-gray-900">
                  {new Date(trigger.created_at).toLocaleString()}
                </td>
              </tr>
              {trigger.file_path && (
                <tr>
                  <td className="py-3 text-sm font-medium text-gray-500">File Name</td>
                  <td className="py-3 text-sm text-gray-900">
                    {trigger.file_path}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Status</td>
                <td className="py-3 text-sm text-gray-900">
                  <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    trigger.status === 'started' 
                      ? 'bg-green-100 text-white' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {trigger.status || 'stopped'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Connection Name</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.connection_name}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Connection URL</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.connection_url}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Protocol</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.protocol.toUpperCase()}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Subscribe Topic</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.subscribe_topic}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">Keep Alive</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.keep_alive} seconds
                </td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-gray-500">QoS</td>
                <td className="py-3 text-sm text-gray-900">
                  {trigger.connection_details.qos}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => onStart(trigger.trigger_id)}
              disabled={trigger.status === 'running'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                ${trigger.status === 'running'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Trigger
            </button>
            <button
              onClick={() => onStop(trigger.trigger_id, trigger.userid, trigger.connection_id)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Trigger
            </button>
            <button
              onClick={() => onDelete(trigger.trigger_id)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Trigger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
  trigger: Trigger;
  onClose: () => void;
  onConfirm: (triggerId: string) => void;
}> = ({ trigger, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Trigger</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete trigger "{trigger.trigger_name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(trigger.trigger_id)}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const TriggerList: React.FC = () => {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [deleteModalTrigger, setDeleteModalTrigger] = useState<Trigger | null>(null);
  const { token } = useAuth();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchTriggers = async () => {
    try {
      const response = await fetch('http://localhost:5000/Trigger/getTriggers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data: TriggerResponse = await response.json();
      setTriggers(data.triggers);
    } catch (error) {
      console.error('Error fetching triggers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleStartTrigger = async (triggerId: string) => {
    try {
      const response = await fetch('http://localhost:5000/Trigger/startConnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trigger_id: triggerId })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchTriggers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error starting trigger:', error);
    }
  };

  const handleStopTrigger = async (triggerId: string, userId: string, connectionId: string) => {
    try {
      const response = await fetch('http://localhost:5000/Trigger/stopConnection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          trigger_id: triggerId,
          connection_id: connectionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchTriggers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error stopping trigger:', error);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/deleteTrigger/${triggerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete trigger');
      }

      const data = await response.json();
      console.log(data.message);
      setDeleteModalTrigger(null);
      fetchTriggers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting trigger:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }

    const sortedTriggers = [...triggers].sort((a, b) => {
      let valueA = getNestedValue(a, field);
      let valueB = getNestedValue(b, field);
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setTriggers(sortedTriggers);
  };

  const getNestedValue = (obj: any, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value?.toString().toLowerCase() ?? '';
  };

  const SortableHeader: React.FC<{ field: string; label: string }> = ({ field, label }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div 
        className="flex items-center space-x-1 cursor-pointer hover:text-gray-700"
        onClick={() => handleSort(field)}
      >
        <span>{label}</span>
        <ArrowDownAZ 
          className={`w-4 h-4 ${
            sortField === field 
              ? 'text-green-500' 
              : 'text-gray-400'
          }`} 
        />
      </div>
    </th>
  );

  const renderTableRow = (trigger: Trigger) => (
    <tr key={trigger.trigger_id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{trigger.trigger_name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500">{trigger.trigger_description}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{trigger.connection_details.connection_name}</div>
        <div className="text-xs text-gray-500">{trigger.connection_details.subscribe_topic}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{formatDate(trigger.created_at)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
          trigger.status === 'running' || trigger.status === 'started'
            ? 'bg-green-500 text-white' 
            : 'bg-red-100 text-red-800'
        }`}>
          {trigger.status || 'stopped'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleStartTrigger(trigger.trigger_id)}
            disabled={trigger.status === 'running' || trigger.status === 'started'}
            className={`${
              trigger.status === 'running' || trigger.status === 'started'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:text-green-900'
            }`}
            title={trigger.status === 'running' || trigger.status === 'started' ? 'Trigger is already running' : 'Start trigger'}
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleStopTrigger(trigger.trigger_id, trigger.userid, trigger.connection_id)}
            disabled={!trigger.status || (trigger.status !== 'running' && trigger.status !== 'started')}
            className={`${
              trigger.status === 'running' || trigger.status === 'started'
                ? 'text-yellow-600 hover:text-yellow-900'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={trigger.status === 'running' || trigger.status === 'started' ? 'Stop trigger' : 'Trigger is not running'}
          >
            <Square className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeleteModalTrigger(trigger)}
            className="text-red-600 hover:text-red-900"
            title="Delete trigger"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTrigger(trigger)}
            className="text-gray-600 hover:text-gray-900"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="trigger_name" label="Name" />
                  <SortableHeader field="trigger_description" label="Description" />
                  <SortableHeader field="connection_details.connection_name" label="Connection" />
                  <SortableHeader field="created_at" label="Created At" />
                  <SortableHeader field="status" label="Status" />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {triggers.map((trigger) => renderTableRow(trigger))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {selectedTrigger && (
        <TriggerModal
          trigger={selectedTrigger}
          onClose={() => setSelectedTrigger(null)}
          onStart={handleStartTrigger}
          onStop={handleStopTrigger}
          onDelete={handleDeleteTrigger}
        />
      )}
      
      {deleteModalTrigger && (
        <DeleteConfirmationModal
          trigger={deleteModalTrigger}
          onClose={() => setDeleteModalTrigger(null)}
          onConfirm={handleDeleteTrigger}
        />
      )}
    </div>
  );
};

export default TriggerList; 