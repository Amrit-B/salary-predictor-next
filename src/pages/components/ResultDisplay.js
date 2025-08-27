import React from 'react';

const ResultDisplay = ({ salary, message, handleGetInsights, insightsLoading }) => {
  if (!salary) return null;

  return (
    <div className="mt-8 text-center">
      <p className="text-slate-600">Predicted Annual Salary:</p>
      <p className="text-4xl font-bold text-blue-600 mt-2">{salary}</p>
      {message && <p className="text-slate-500 mt-4 text-md font-medium">{message}</p>}
      <div className="mt-6">
        <button
          onClick={handleGetInsights}
          disabled={insightsLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {insightsLoading ? 'Getting Insights...' : '✨ Get Career Insights'}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;