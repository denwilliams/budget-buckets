'use client';

import { useEffect, useState } from 'react';

interface BucketDashboard {
  id: string;
  name: string;
  size: number;
  period: string;
  totalSpent: number;
  percentageFull: number;
  percentageOfTimeElapsed: number;
  status: 'good' | 'warning' | 'critical';
  transactionCount: number;
}

export default function Dashboard() {
  const [buckets, setBuckets] = useState<BucketDashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setBuckets(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good':
        return 'On Track';
      case 'warning':
        return 'Watch';
      case 'critical':
        return 'Over Budget';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Budget Dashboard</h1>

      {buckets.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>No buckets yet. Create your first bucket to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buckets.map((bucket) => (
            <div
              key={bucket.id}
              className="bg-white rounded-lg shadow-md p-6 border-2"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">{bucket.name}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(
                    bucket.status
                  )}`}
                >
                  {getStatusText(bucket.status)}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Spent</span>
                  <span className="font-medium">
                    ${bucket.totalSpent.toFixed(2)} / ${bucket.size.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(bucket.status)}`}
                    style={{ width: `${Math.min(bucket.percentageFull, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{bucket.percentageFull.toFixed(1)}% used</span>
                  <span>
                    {bucket.percentageOfTimeElapsed.toFixed(1)}% of time elapsed
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span className="capitalize">{bucket.period}</span>
                <span>{bucket.transactionCount} transactions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
