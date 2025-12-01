import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Clock, BrainCircuit, Search, Sparkles, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = '/api';

export default function SalaryPredictor() {
  const [formData, setFormData] = useState({
    job_title: '',
    years_experience: 2,
    education_level: "Bachelor's"
  });
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [insights, setInsights] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs`)
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        if (data && data.length > 0) {
          setFormData(prev => ({...prev, job_title: data[0]}));
        }
      })
      .catch(err => console.error("Backend offline? Ensure server is running.", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setInsights('');

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Prediction failed");
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    if (!result) return;
    setRagLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/rag-insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: formData.job_title,
          years_experience: formData.years_experience,
          predicted_salary: result.predicted_salary
        })
      });

      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error(error);
      setInsights("Could not generate insights at this time.");
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 pt-10">
          <div className="flex justify-center items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Salary Predictor & Career RAG
            </h1>
          </div>
          <p className="text-slate-500">
            Powered by Scikit-Learn (Random Forest) and Gemini AI
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          
          {/* LEFT: Input Panel */}
          <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 border-b pb-2">
              <Search className="w-5 h-5 text-blue-600" />
              Your Profile
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Briefcase className="w-4 h-4 inline mr-2 text-slate-400" />
                  Job Title
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.job_title}
                  onChange={e => setFormData({...formData, job_title: e.target.value})}
                >
                  {jobs.map((job, idx) => (
                    <option key={idx} value={job}>{job}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-2 text-slate-400" />
                  Experience (Years)
                </label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.years_experience}
                  onChange={e => setFormData({...formData, years_experience: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <GraduationCap className="w-4 h-4 inline mr-2 text-slate-400" />
                  Education
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.education_level}
                  onChange={e => setFormData({...formData, education_level: e.target.value})}
                >
                  <option value="Bachelor's">Bachelor&apos;s Degree</option>
                  <option value="Master's">Master&apos;s Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Calculating...</span>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" /> Predict Salary
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Results Panel */}
          <div className="md:col-span-8 space-y-6">
            {!result && !loading && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-white p-12 rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <BrainCircuit className="w-16 h-16 mb-4 opacity-10" />
                <p>Select your role and experience to see the magic.</p>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                
                {/* Stats Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500">
                  <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                    Estimated Compensation
                  </h3>
                  <div className="flex flex-wrap items-baseline gap-3 mb-6">
                    <span className="text-5xl font-extrabold text-slate-900">
                      ${result.predicted_salary.toLocaleString()}
                    </span>
                    <span className="text-lg text-slate-500 font-medium">/ year</span>
                  </div>

                  {result.database_stats && (
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Dataset Average</p>
                        <p className="font-semibold text-slate-700">
                          ${result.database_stats.mean.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Data Points</p>
                        <p className="font-semibold text-slate-700">
                          {result.database_stats.count} records
                        </p>
                      </div>
                    </div>
                  )}

                  {/* RAG Trigger */}
                  {!insights && (
                    <button
                      onClick={handleGetInsights}
                      disabled={ragLoading}
                      className="mt-6 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                    >
                      {ragLoading ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {ragLoading ? 'Asking Gemini...' : 'Ask AI for Career Insights'}
                    </button>
                  )}
                </div>

                {/* AI Insights Result */}
                {insights && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Gemini Career Analysis
                    </h3>
                    <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                      <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}