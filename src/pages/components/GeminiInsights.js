import React from 'react';

const GeminiInsights = ({ insights, isLoading, error }) => {
  if (!isLoading && !insights && !error) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-slate-700 text-center mb-4">
        ✨ AI Career Insights
      </h2>
      {isLoading && <div className="loader"></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {insights && (
        <div className="bg-slate-50 p-4 rounded-lg text-slate-900 whitespace-pre-wrap text-sm">
          {insights}
        </div>
      )}
    </div>
  );
};

export default GeminiInsights;