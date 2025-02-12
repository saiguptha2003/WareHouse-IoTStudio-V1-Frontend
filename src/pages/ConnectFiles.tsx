import React, { useEffect, useState } from 'react';
import { FileEntry } from '../types';
import FileList from '../components/FileList';
import { useAuth } from '../context/AuthContext';
import { ArrowDownAZ } from 'lucide-react';

const ConnectFiles: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { token } = useAuth();
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | null;
  }>({ key: '', direction: null });

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/services/WareHouse/getConnectFilesList', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFiles(data.connect_files || []);
    } catch (error) {
      console.error('Error fetching connect files:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setFileToDelete(id);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      await fetch(`http://localhost:5000/services/WareHouse/deleteConnectFile/${fileToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/getConnectFile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'connect-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });

    if (direction === null) {
      fetchFiles(); // Reset to original order
      return;
    }

    const sortedFiles = [...files].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFiles(sortedFiles);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Connect Files</h1>
        <FileList
          files={files}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectFiles