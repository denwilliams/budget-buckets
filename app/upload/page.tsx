'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    count: number;
  } | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, count: data.count });
        setFile(null);
        setTimeout(() => {
          router.push('/transactions');
        }, 2000);
      } else {
        alert(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload statement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upload Credit Card Statement</h1>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Upload a CSV file from your credit card statement</li>
            <li>The file should have columns: Date, Description, Amount</li>
            <li>
              Column names are case-insensitive (Date/date/DATE all work)
            </li>
            <li>Each row will be imported as a separate transaction</li>
            <li>
              After upload, you can assign transactions to buckets on the
              Transactions page
            </li>
          </ul>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-md"
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="text-sm text-gray-600">
              Selected file: <span className="font-medium">{file.name}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Statement'}
          </button>
        </form>

        {result && result.success && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Successfully imported {result.count} transactions!
            </p>
            <p className="text-sm text-green-600 mt-1">
              Redirecting to transactions page...
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
        <h3 className="font-semibold text-blue-900 mb-2">Sample CSV Format</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {`Date,Description,Amount
2024-01-15,Grocery Store,125.50
2024-01-16,Gas Station,45.00
2024-01-17,Restaurant,67.30`}
        </pre>
      </div>
    </div>
  );
}
