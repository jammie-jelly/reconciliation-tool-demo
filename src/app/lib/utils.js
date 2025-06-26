import Papa from 'papaparse';

// Parse CSV file with batch processing
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const transactions = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      chunkSize: 1000, // Process 1000 rows per batch
      chunk: (results, parser) => {
        if (!results.meta.fields.includes('transaction_reference')) {
          parser.abort();
          reject(new Error('CSV missing transaction_reference column'));
          return;
        }
        transactions.push(...results.data);
      },
      complete: () => resolve(transactions),
      error: (error) => reject(error),
    });
  });
};

// Compare transactions
export const compareTransactions = (internal, provider) => {
  const result = {
    matched: [],
    internalOnly: [],
    providerOnly: [],
    errors: [],
  };

  // Create maps for efficient lookup
  const internalMap = new Map();
  const providerMap = new Map();

  // Batch process internal transactions
  internal.forEach((tx, index) => {
    if (!tx.transaction_reference) {
      result.errors.push(`Skipped internal row ${index + 1}: missing transaction_reference`);
      return;
    }
    internalMap.set(tx.transaction_reference, tx);
  });

  // Batch process provider transactions
  provider.forEach((tx, index) => {
    if (!tx.transaction_reference) {
      result.errors.push(`Skipped provider row ${index + 1}: missing transaction_reference`);
      return;
    }
    providerMap.set(tx.transaction_reference, tx);
  });

  // Compare transactions
  for (const [ref, internalTx] of internalMap) {
    const providerTx = providerMap.get(ref);
    if (providerTx) {
      // Matched transaction
      const mismatch = {
        ...internalTx,
        amount_mismatch: internalTx.amount && providerTx.amount && internalTx.amount !== providerTx.amount,
        status_mismatch: internalTx.status && providerTx.status && internalTx.status !== providerTx.status,
      };
      result.matched.push(mismatch);
      providerMap.delete(ref); // Remove matched transaction
    } else {
      // Only in internal
      result.internalOnly.push(internalTx);
    }
  }

  // Remaining provider transactions
  for (const [, providerTx] of providerMap) {
    result.providerOnly.push(providerTx);
  }

  return result;
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};