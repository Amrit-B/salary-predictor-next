import React, { useState } from 'react';

const Header = () => (
  <div className="text-center">
    <h1 className="text-3xl font-bold text-gray-800">
      Career Insights AI
    </h1>
    <p className="mt-2 text-md text-gray-500">
      Predict your salary and get AI-powered career advice.
    </p>
  </div>
);

const PredictionForm = ({ experience, setExperience, jobRole, setJobRole, handleSubmit, isPredicting }) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
        Years of Experience
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="number"
          id="experience"
          name="experience"
          step="0.1"
          min="0"
          placeholder="e.g., 5.5"
          required
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>
    </div>
    
    <div>
      <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">
        Job Role
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <input
          type="text"
          id="jobRole"
          name="jobRole"
          placeholder="e.g., Software Engineer, Janitor, CEO"
          required
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>
    </div>
    
    <button
      type="submit"
      disabled={isPredicting}
      className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isPredicting && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isPredicting ? 'Analyzing Role...' : 'Predict Salary'}
    </button>
  </form>
);

const ResultDisplay = ({ salary, message, handleGetInsights, insightsLoading }) => (
  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
    <p className="text-sm font-medium text-gray-500">Predicted Salary</p>
    <p className="text-4xl font-bold text-gray-800 my-2">
      {salary}
    </p>
    <p className="text-md text-gray-600 h-6">{message}</p>
    
    <button
        onClick={handleGetInsights}
        disabled={insightsLoading}
        className="mt-6 inline-flex items-center justify-center w-full sm-w-auto px-6 py-2.5 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${insightsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        {insightsLoading ? 'Generating...' : 'Get Career Insights'}
    </button>
  </div>
);

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
        <div className="bg-slate-50 p-4 rounded-lg text-slate-800 whitespace-pre-wrap text-sm">
          {insights}
        </div>
      )}
    </div>
  );
};

const localFallback = { base: 64790.69, slope: 11481.40 };

function App() {
  const [experience, setExperience] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [predictedSalary, setPredictedSalary] = useState(null);
  const [message, setMessage] = useState('');
  const [geminiInsights, setGeminiInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredictSalary = async (e) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictedSalary(null);
    setGeminiInsights('');
    setInsightsError('');

    const exp = parseFloat(experience);
    if (isNaN(exp) || exp < 0) {
      setPredictedSalary('Invalid Input');
      setMessage('Please enter a valid number of years.');
      setIsPredicting(false);
      return;
    }

    let modifier = localFallback;

    try {
      const response = await fetch('/api/get-salary-model', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobRole }),
      });

      if (!response.ok) {
          console.error("API error, using fallback model.");
      } else {
          modifier = await response.json();
      }

    } catch (error) {
      console.error("Could not get AI modifiers, using fallback.", error);
    }

    const salary = modifier.base + (modifier.slope * exp);
    
    const formattedSalary =
      '$' +
      salary.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    setPredictedSalary(formattedSalary);

    if (exp > 40) {
      setMessage('Incredible experience!');
    } else if (exp > 10) {
      setMessage('A true senior professional!');
    } else if (exp > 2) {
      setMessage('Solid mid-level experience!');
    } else {
      setMessage('Just getting started on your journey!');
    }
    setIsPredicting(false);
  };

  const handleGetInsights = async () => {
    setInsightsLoading(true);
    setGeminiInsights('');
    setInsightsError('');

    try {
      const response = await fetch('/api/get-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: parseFloat(experience),
          salary: predictedSalary,
          jobRole: jobRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'The server responded with an error.'
        );
      }

      const data = await response.json();
      setGeminiInsights(data.insights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsightsError(`Sorry, an error occurred: ${error.message}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-100 flex items-center justify-center p-4 font-sans">
      <main className="w-full max-w-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8 transition-all duration-300">
        <Header />
        <div className="mt-8">
          <PredictionForm
            experience={experience}
            setExperience={setExperience}
            jobRole={jobRole}
            setJobRole={setJobRole}
            handleSubmit={handlePredictSalary}
            isPredicting={isPredicting}
          />
        </div>

        {predictedSalary && (
          <div className="mt-8">
            <ResultDisplay
              salary={predictedSalary}
              message={message}
              handleGetInsights={handleGetInsights}
              insightsLoading={insightsLoading}
            />
          </div>
        )}

        <GeminiInsights
          insights={geminiInsights}
          isLoading={insightsLoading}
          error={insightsError}
        />
      </main>
    </div>
  );
}

export default App;
