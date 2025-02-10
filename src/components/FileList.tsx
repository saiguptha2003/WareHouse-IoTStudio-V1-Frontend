import React from 'react';
import { Trash2 } from 'lucide-react';
import { FileEntry } from '../types';

interface FileListProps {
  files: FileEntry[];
  onDelete: (id: string) => void;
  onDownload?: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, onDownload }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filename
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.uuid} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {file.filename}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {file.timeStamp || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {onDownload && (
                  <button
                    onClick={() => onDownload(file.uuid)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Download
                  </button>
                )}
                <button
                  onClick={() => onDelete(file.uuid)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {files.length === 0 && (
        <div className="text-center py-8 text-gray-500">No files found</div>
      )}
    </div>
  );
};

export default FileList