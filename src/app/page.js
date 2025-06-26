'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ReconciliationSummary from './components/ReconciliationSummary';
import { compareTransactions } from './lib/utils';

export default function Home() {
  const [result, setResult] = useState(null);

  const handleFilesUploaded = (internalData, providerData) => {
    const reconciliationResult = compareTransactions(internalData, providerData);
    setResult(reconciliationResult);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mini Reconciliation Tool</h1>
      <FileUpload onFilesUploaded={handleFilesUploaded} />
      <ReconciliationSummary result={result} />
    </div>
  );
}