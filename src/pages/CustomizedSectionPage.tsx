import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileEntry } from '../types';
import FileList from '../components/FileList';
import { useAuth } from '../context/AuthContext';
import { Upload } from 'lucide-react';

const CustomizedSection: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { token } = useAuth();

  const fetchFiles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/customizedSection/${sectionId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await fetch(`http://localhost:5000/services/WareHouse/customizedSection/${sectionId}/file/${fileId}`, {
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

  const handleDownload = async (fileId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/customizedSection/${sectionId}/file/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`http://localhost:5000/services/WareHouse/customizedSection/${sectionId}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchFiles();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [sectionId]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Customized Section Files</h1>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
            <input
              type="file"
              className="hidden"
              accept=".xls,.xlsx,.pdf,.pkl,.docs,.txt,.sh,.bat"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        <FileList
          onDownload={handleDownload}
          files={files}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default CustomizedSection;
