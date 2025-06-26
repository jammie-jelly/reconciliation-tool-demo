import { useState, useMemo } from 'react';
import { exportToCSV } from '../lib/utils';

export default function TransactionTable({ transactions, title, icon, exportFilename }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Filter transactions by precise substring match
  const filteredTransactions = useMemo(() => {
    if (!search) return transactions;
    return transactions.filter((tx) =>
      tx.transaction_reference.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, transactions]);

  // Paginate filtered transactions
  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, page]);

  // Debounced search handler
  let debounceTimeout;
  const handleSearch = (value) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setSearch(value);
      setPage(1); // Reset to first page on search
    }, 300);
  };

  if (!transactions.length) return null;

  const headers = Object.keys(transactions[0]).filter(
    (key) => !key.endsWith('_mismatch')
  );

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">
          {icon} {title} ({filteredTransactions.length})
        </h3>
        <button
          onClick={() => exportToCSV(filteredTransactions, exportFilename)}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Export as CSV
        </button>
      </div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Search by Transaction Reference"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border p-2 w-full"
        />
        <button
          onClick={() => {
            handleSearch('');
            setSearch('');
          }}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Clear
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header) => (
                <th key={header} className="border px-4 py-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((tx, index) => (
              <tr
                key={index}
                className={tx.amount_mismatch || tx.status_mismatch ? 'bg-red-100' : ''}
              >
                {headers.map((header) => (
                  <td key={header} className="border px-4 py-2">
                    {tx[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredTransactions.length > rowsPerPage && (
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.ceil(filteredTransactions.length / rowsPerPage)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * rowsPerPage >= filteredTransactions.length}
            className="px-3 py-1 bg-gray-200 rounded disabled:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}