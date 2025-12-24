'use client';

import { useEffect, useState } from 'react';

interface Bucket {
  id: string;
  name: string;
  size: number;
  period: string;
}

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    period: 'monthly',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBuckets();
  }, []);

  const fetchBuckets = async () => {
    try {
      const response = await fetch('/api/buckets');
      const data = await response.json();
      setBuckets(data);
    } catch (error) {
      console.error('Failed to fetch buckets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.size) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingId) {
        await fetch(`/api/buckets/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/buckets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      setFormData({ name: '', size: '', period: 'monthly' });
      setEditingId(null);
      fetchBuckets();
    } catch (error) {
      console.error('Failed to save bucket:', error);
      alert('Failed to save bucket');
    }
  };

  const handleEdit = (bucket: Bucket) => {
    setFormData({
      name: bucket.name,
      size: bucket.size.toString(),
      period: bucket.period,
    });
    setEditingId(bucket.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bucket?')) {
      return;
    }

    try {
      await fetch(`/api/buckets/${id}`, {
        method: 'DELETE',
      });
      fetchBuckets();
    } catch (error) {
      console.error('Failed to delete bucket:', error);
      alert('Failed to delete bucket');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', size: '', period: 'monthly' });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Buckets</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Bucket' : 'Create New Bucket'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Bucket Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., Groceries, Entertainment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Budget Size ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.size}
              onChange={(e) =>
                setFormData({ ...formData, size: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Period</label>
            <select
              value={formData.period}
              onChange={(e) =>
                setFormData({ ...formData, period: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Update Bucket' : 'Create Bucket'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Size
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Period
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {buckets.map((bucket) => (
              <tr key={bucket.id}>
                <td className="px-6 py-4 text-sm">{bucket.name}</td>
                <td className="px-6 py-4 text-sm">
                  ${bucket.size.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm capitalize">
                  {bucket.period}
                </td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleEdit(bucket)}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bucket.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {buckets.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No buckets yet. Create your first bucket above!
          </div>
        )}
      </div>
    </div>
  );
}
