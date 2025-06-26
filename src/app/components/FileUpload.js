import { useState } from 'react';
import { parseCSV } from '../lib/utils';

export default function FileUpload({ onFilesUploaded }) {
  const [internalFile, setInternalFile] = useState(null);
  const [providerFile, setProviderFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please upload CSV files only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }
    setError('');
    if (type === 'internal') setInternalFile(file);
    else setProviderFile(file);
  };

  const handleSubmit = async () => {
    if (!internalFile || !providerFile) {
      setError('Please upload both files');
      return;
    }
    setLoading(true);
    try {
      const [internalData, providerData] = await Promise.all([
        parseCSV(internalFile),
        parseCSV(providerFile),
      ]);
      onFilesUploaded(internalData, providerData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1">Internal System Export</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'internal')}
            className="border p-2 w-full"
          />
          {internalFile && <p className="text-sm text-gray-600">{internalFile.name}</p>}
        </div>
        <div>
          <label className="block mb-1">Provider Statement</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e, 'provider')}
            className="border p-2 w-full"
          />
          {providerFile && <p className="text-sm text-gray-600">{providerFile.name}</p>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Compare Transactions'}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}