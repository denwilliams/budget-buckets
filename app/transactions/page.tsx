'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  bucketId: string | null;
  bucket: {
    id: string;
    name: string;
  } | null;
}

interface Bucket {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, bucketsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/buckets'),
      ]);

      const transactionsData = await transactionsRes.json();
      const bucketsData = await bucketsRes.json();

      setTransactions(transactionsData);
      setBuckets(bucketsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBucket = async (transactionId: string, bucketId: string) => {
    try {
      await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucketId: bucketId || null }),
      });

      fetchData();
    } catch (error) {
      console.error('Failed to assign bucket:', error);
      alert('Failed to assign bucket');
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'unassigned') return !t.bucketId;
    return t.bucketId === filter;
  });

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>

      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Transactions</option>
          <option value="unassigned">Unassigned</option>
          {buckets.map((bucket) => (
            <option key={bucket.id} value={bucket.id}>
              {bucket.name}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-600">
          Showing {filteredTransactions.length} of {transactions.length}{' '}
          transactions
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          <p>No transactions yet. Upload a statement to get started!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Bucket
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <select
                      value={transaction.bucketId || ''}
                      onChange={(e) =>
                        handleAssignBucket(transaction.id, e.target.value)
                      }
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      <option value="">Unassigned</option>
                      {buckets.map((bucket) => (
                        <option key={bucket.id} value={bucket.id}>
                          {bucket.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No transactions match the current filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
