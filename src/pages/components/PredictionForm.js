import React from 'react';

const PredictionForm = ({ experience, setExperience, jobRole, setJobRole, handleSubmit }) => (
  <form onSubmit={handleSubmit}>
    <div className="mb-4">
      <label
        htmlFor="experience"
        className="block text-sm font-medium text-slate-600 mb-2"
      >
        Years of Professional Experience
      </label>
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
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
      />
    </div>
    
    {/* New input field for Job Role */}
    <div className="mb-6">
      <label
        htmlFor="jobRole"
        className="block text-sm font-medium text-slate-600 mb-2"
      >
        Job Role (Optional)
      </label>
      <input
        type="text"
        id="jobRole"
        name="jobRole"
        placeholder="e.g., Software Engineer"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-900"
      />
    </div>
    
    <button
      type="submit"
      className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
    >
      Predict Salary
    </button>
  </form>
);

export default PredictionForm;
