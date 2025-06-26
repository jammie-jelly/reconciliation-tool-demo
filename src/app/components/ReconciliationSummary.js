import { useState } from 'react';
import TransactionTable from './TransactionTable';

export default function ReconciliationSummary({ result }) {
  const [openCategory, setOpenCategory] = useState(null);

  if (!result) return null;

  const categories = [
    {
      title: 'Matched Transactions ✅',
      icon: '✅',
      data: result.matched,
      exportFilename: `matched_transactions_${new Date().toISOString().split('T')[0]}.csv`,
      mismatchCount: result.matched.filter(
        (tx) => tx.amount_mismatch || tx.status_mismatch
      ).length,
    },
    {
      title: 'Present only in Internal File ⚠️',
      icon: '⚠️',
      data: result.internalOnly,
      exportFilename: `internal_only_${new Date().toISOString().split('T')[0]}.csv`,
      mismatchCount: 0,
    },
    {
      title: 'Present only in Provider File ❌',
      icon: '❌',
      data: result.providerOnly,
      exportFilename: `provider_only_${new Date().toISOString().split('T')[0]}.csv`,
      mismatchCount: 0,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reconciliation Summary</h2>
      {result.errors.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-red-500">Errors</h3>
          <ul className="list-disc pl-5">
            {result.errors.map((error, index) => (
              <li key={index} className="text-red-500">{error}</li>
            ))}
          </ul>
        </div>
      )}
      {categories.map((cat) => (
        <div key={cat.title} className="mb-4 border rounded">
          <div
            className="flex justify-between items-center p-3 cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => setOpenCategory(cat.title === openCategory ? null : cat.title)}
          >
            <h3 className="text-lg font-semibold">
              {cat.icon} {cat.title} ({cat.data.length})
              {cat.mismatchCount > 0 && (
                <span className="text-red-500 ml-2">
                  ({cat.mismatchCount} mismatches)
                </span>
              )}
            </h3>
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              {cat.title === openCategory ? 'Close' : 'View Details'}
            </button>
          </div>
          {cat.title === openCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{cat.title}</h3>
                  <button
                    onClick={() => setOpenCategory(null)}
                    className="text-red-500 font-bold"
                  >
                    ✕
                  </button>
                </div>
                <TransactionTable
                  transactions={cat.data}
                  title={cat.title}
                  icon={cat.icon}
                  exportFilename={cat.exportFilename}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}