import React, { useEffect, useState } from 'react';
import { FileEntry } from '../types';
import FileList from '../components/FileList';
import { useAuth } from '../context/AuthContext';

const TriggerFiles: React.FC = () => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { token } = useAuth();

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/services/WareHouse/getTriggerFilesList', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFiles(data.trigger_files || []);
    } catch (error) {
      console.error('Error fetching trigger files:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/services/WareHouse/deleteTrigger/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/getTriggerFile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'trigger-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Trigger Files</h1>
        <FileList
          files={files}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default TriggerFiles