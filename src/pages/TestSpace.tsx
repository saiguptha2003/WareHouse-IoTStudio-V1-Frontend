import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Square, Wifi, WifiOff, Table, Code, Clock, MoreVertical, ChevronUp, ChevronDown, Download, LineChart } from 'lucide-react';
import { Client } from 'paho-mqtt';
import * as XLSX from 'xlsx';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IoTConnection {
  connection_id: string;
  connection_name: string;
  connection_url: string;
  subscribe_topic: string;
  ping_status: boolean;
  port: number;
}

interface ReceivedData {
  timestamp: string;
  data: any;
  topic: string;
}

type ViewMode = 'table' | 'json' | 'raw' | 'chart';

const TestSpace: React.FC = () => {
  const { token } = useAuth();
  const [connections, setConnections] = useState<IoTConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<IoTConnection | null>(null);
  const [receivedData, setReceivedData] = useState<ReceivedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

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

  const handleConnectionChange = (connectionId: string) => {
    if (isConnected) {
      handleStopConnection();
    }
    const connection = connections.find(conn => conn.connection_id === connectionId);
    setSelectedConnection(connection || null);
    setReceivedData([]);
    setError(null);
  };

  const handleStartConnection = () => {
    if (!selectedConnection) return;

    setLoading(true);
    try {
      setError(null);
      setReceivedData([]);
      const clientId = `mqttjs_${Math.random().toString(16).substr(2, 8)}`;
      
      let wsUrl = selectedConnection.connection_url;
      if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
        wsUrl = `ws://${wsUrl}`;
      }
      
      const cleanUrl = wsUrl.replace(/^(ws|wss):\/\//, '');

      console.log('Creating MQTT client with:', {
        url: cleanUrl,
        port: selectedConnection.port,
        clientId
      });

      const mqttClient = new Client(
        cleanUrl,
        Number(selectedConnection.port),
        clientId
      );

      mqttClient.onMessageArrived = (message) => {
        console.log('Raw message received:', message);
        console.log('Topic:', message.destinationName);
        console.log('Payload:', message.payloadString);
        
        try {
          let messageData;
          try {
            messageData = JSON.parse(message.payloadString);
          } catch {
            messageData = message.payloadString;
          }

          const newData: ReceivedData = {
            timestamp: new Date().toISOString(),
            topic: message.destinationName,
            data: messageData
          };

          console.log('Processed message:', newData);
          
          setReceivedData(prevData => {
            const updatedData = [newData, ...prevData].slice(0, 100);
            console.log('Updated received data:', updatedData);
            return updatedData;
          });
        } catch (error) {
          console.error('Error processing message:', error);
          setError('Error processing message: ' + error);
        }
      };

      mqttClient.onConnectionLost = (responseObject) => {
        console.error('Connection lost:', responseObject.errorMessage);
        setError('Connection lost: ' + responseObject.errorMessage);
        setIsConnected(false);
        setLoading(false);
      };

      const connectOptions = {
        onSuccess: () => {
          console.log('Connected successfully to:', cleanUrl);
          try {
            // Subscribe to all topics
            mqttClient.subscribe('#', { qos: 0 });
            console.log('Subscribed to all topics (#)');
            
            // Also subscribe to specific topic if provided
            if (selectedConnection.subscribe_topic) {
              mqttClient.subscribe(selectedConnection.subscribe_topic, { qos: 0 });
              console.log('Subscribed to specific topic:', selectedConnection.subscribe_topic);
            }
            
            setIsConnected(true);
            setLoading(false);
          } catch (err) {
            console.error('Subscription error:', err);
            setError('Subscription failed: ' + err);
            setLoading(false);
          }
        },
        onFailure: (err) => {
          console.error('Connection failed:', err);
          setError('Connection failed: ' + err.errorMessage);
          setLoading(false);
        },
        useSSL: wsUrl.startsWith('wss://'),
        timeout: 3,
        keepAliveInterval: 60,
        reconnect: true,
        mqttVersion: 4,
        cleanSession: true
      };

      console.log('Attempting connection with options:', connectOptions);
      mqttClient.connect(connectOptions);
      setClient(mqttClient);
    } catch (err: any) {
      console.error('Error creating MQTT client:', err);
      setError('Error creating MQTT client: ' + (err.message || err));
      setLoading(false);
    }
  };

  const handleStopConnection = () => {
    if (client && client.isConnected()) {
      client.disconnect();
      setClient(null);
      setReceivedData([]);
    }
    setIsConnected(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-').replace(',', '');
  };

  const formatChartTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  useEffect(() => {
    if (viewMode === 'chart' && !selectedMetric && receivedData.length > 0) {
      const numericFields = getNumericFields();
      if (numericFields.length > 0) {
        setSelectedMetric(numericFields[0]);
      }
    }
  }, [receivedData, viewMode, selectedMetric]);

  const getNumericFields = () => {
    const fields = new Set<string>();
    if (receivedData.length > 0 && receivedData[0].data) {
      const firstItem = receivedData[0].data;
      Object.entries(firstItem).forEach(([key, value]) => {
        if (typeof value === 'number') {
          fields.add(key);
        }
      });
    }
    return Array.from(fields);
  };

  const renderDataView = () => {
    if (!receivedData.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data received yet
        </div>
      );
    }

    switch (viewMode) {
      case 'chart':
        const numericFields = getNumericFields();
        
        if (numericFields.length === 0) {
          return (
            <div className="text-center py-8 text-gray-500">
              No numeric data available for charting
            </div>
          );
        }

        // If no metric is selected and we have numeric fields, select the first one
        if (!selectedMetric && numericFields.length > 0) {
          setSelectedMetric(numericFields[0]);
        }

        // Prepare chart data
        const chartData = [...receivedData]
          .reverse()
          .slice(0, 30)
          .map(item => {
            let value = null;
            try {
              if (item.data && typeof item.data === 'object') {
                value = Number(item.data[selectedMetric]);
                if (isNaN(value)) value = null;
              }
            } catch (e) {
              console.error('Error processing value:', e);
            }
            
            return {
              name: formatChartTime(item.timestamp),
              value: value
            };
          })
          .filter(item => item.value !== null);

        return (
          <div className="w-full h-full" style={{ minHeight: '500px' }}>
            <div className="mb-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select metric to chart...</option>
                {numericFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            {selectedMetric && chartData.length > 0 && (
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                  <RechartsLineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 20,
                      bottom: 30
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name={selectedMetric}
                      stroke="#8884d8"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case 'table':
        // Get all unique column names from the data
        const columns = new Set<string>();
        receivedData.slice(0, 7).forEach(item => {
          if (typeof item.data === 'object' && item.data !== null) {
            Object.keys(item.data).forEach(key => columns.add(key));
          }
        });
        const columnArray = Array.from(columns);

        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrival Time
                </th>
                {columnArray.map((column) => (
                  <th 
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receivedData.slice(0, 7).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(item.timestamp)}
                  </td>
                  {columnArray.map((column) => (
                    <td key={column} className="px-6 py-4 text-sm text-gray-500">
                      {typeof item.data === 'object' && item.data !== null
                        ? column === 'timestamp' || column === 'status'
                          ? item.data[column]
                          : JSON.stringify(item.data[column])
                        : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'json':
        return (
          <pre className="p-4 bg-gray-50 rounded-lg overflow-auto">
            {JSON.stringify(receivedData.slice(0, 10), null, 2)}
          </pre>
        );

      case 'raw':
        return (
          <div className="space-y-2">
            {receivedData.slice(0, 10).map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()} - {item.topic}
                </div>
                <div className="mt-1 text-sm">
                  {typeof item.data === 'object' 
                    ? JSON.stringify(item.data) 
                    : item.data}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  const getFileName = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const connectionName = selectedConnection?.connection_name.replace(/[^a-zA-Z0-9-_]/g, '_') || 'mqtt';
    return `${connectionName}_${timestamp}`;
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(receivedData.map(item => ({
      timestamp: item.timestamp,
      data: item.data
    })), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getFileName()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    if (receivedData.length === 0) return;

    try {
      // Prepare data for Excel
      const excelData = receivedData.map(item => {
        const baseData = {
          'Arrival Time': formatTime(item.timestamp)
        };

        // If data is an object, spread its properties
        if (typeof item.data === 'object' && item.data !== null) {
          const processedData = {};
          Object.entries(item.data).forEach(([key, value]) => {
            // Don't stringify timestamp and status values
            if (key === 'timestamp' || key === 'status') {
              processedData[key] = value;
            } else {
              processedData[key] = typeof value === 'object' ? JSON.stringify(value) : value;
            }
          });
          return {
            ...baseData,
            ...processedData
          };
        }

        return baseData;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'MQTT Data');

      // Generate Excel file
      XLSX.writeFile(workbook, `${getFileName()}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      setError('Error generating Excel file: ' + error);
    }
  };

  const downloadText = () => {
    let textContent = '';
    receivedData.forEach(item => {
      textContent += `Arrival Time: ${formatTime(item.timestamp)}\n`;
      if (typeof item.data === 'object' && item.data !== null) {
        Object.entries(item.data).forEach(([key, value]) => {
          // Don't stringify timestamp and status values
          if (key === 'timestamp' || key === 'status') {
            textContent += `${key}: ${value}\n`;
          } else {
            textContent += `${key}: ${JSON.stringify(value)}\n`;
          }
        });
      } else {
        textContent += `Data: ${item.data}\n`;
      }
      textContent += '------------------------\n';
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${getFileName()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto h-full">
        <div className="bg-white shadow-lg rounded-lg p-6 h-full flex flex-col">
          {/* Connection Selector */}
          <div className="mb-6 flex-none">
            <label htmlFor="connection" className="block text-sm font-medium text-gray-700 mb-2">
              Select Connection
            </label>
            <select
              id="connection"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => handleConnectionChange(e.target.value)}
              value={selectedConnection?.connection_id || ''}
            >
              <option value="">Select a connection...</option>
              {connections.map((connection) => (
                <option key={connection.connection_id} value={connection.connection_id}>
                  {`${connection.connection_name} - ${connection.connection_url}:${connection.port}`}
                </option>
              ))}
            </select>
          </div>

          {/* Updated Connection Status */}
          {selectedConnection && (
            <div className="mb-6 flex-none">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <div className="flex items-center">
                        {isConnected ? (
                          <>
                            <Wifi className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-green-500">Connected</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-gray-500">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">Messages:</span>
                      <span className="text-sm text-gray-600">{receivedData.length}</span>
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {showDetails ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    {loading && <LoadingSpinner />}
                    {error && <span className="text-red-500 text-sm">{error}</span>}
                    <button
                      onClick={handleStartConnection}
                      disabled={isConnected}
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium shadow-sm
                        ${isConnected 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </button>
                    <button
                      onClick={handleStopConnection}
                      disabled={!isConnected}
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium shadow-sm
                        ${!isConnected 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </button>
                    {isConnected && (
                      <div className="relative inline-block">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={downloadJSON}
                            className="px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
                            title="Download JSON"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            JSON
                          </button>
                          <button
                            onClick={downloadExcel}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                            title="Download Excel"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                          </button>
                          <button
                            onClick={downloadText}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                            title="Download Text"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Text
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expandable Details */}
                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">URL:</span>
                        <span className="text-sm text-gray-600 ml-2">{selectedConnection.connection_url}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Port:</span>
                        <span className="text-sm text-gray-600 ml-2">{selectedConnection.port}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Topic:</span>
                        <span className="text-sm text-gray-600 ml-2">{selectedConnection.subscribe_topic || '#'}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Client ID:</span>
                        <span className="text-sm text-gray-600 ml-2">{client?.clientId || 'Not connected'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Display Section with View Controls */}
          {selectedConnection && (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex justify-between items-center mb-4 flex-none">
                <h3 className="text-lg font-medium text-gray-900">
                  Received Data ({receivedData.length} messages)
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Table View"
                  >
                    <Table className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`p-2 rounded-md ${viewMode === 'json' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="JSON View"
                  >
                    <Code className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`p-2 rounded-md ${viewMode === 'raw' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Raw View"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('chart')}
                    className={`p-2 rounded-md ${viewMode === 'chart' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                    title="Chart View"
                  >
                    <LineChart className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
                <div className="h-full p-4">
                  {renderDataView()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSpace; 