import pickle
import pandas as pd
import numpy as np
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# --- CONFIGURATION ---

GENAI_API_KEY = os.getenv("GEMINI_API_KEY", "") 

if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD ARTIFACTS ---
try:
    with open('salary_model.pkl', 'rb') as f:
        artifacts = pickle.load(f)
    
    model = artifacts['model']
    le_education = artifacts['le_education']
    le_job = artifacts['le_job']
    job_list = artifacts['job_list']
    
    # Load raw data for RAG context
    raw_df = pd.read_csv('Salary Data.csv')
    
    print("Model and Data loaded successfully.")
except FileNotFoundError:
    print("CRITICAL: salary_model.pkl not found. Run train_model.py first.")

# --- DATA MODELS ---
class PredictionRequest(BaseModel):
    years_experience: float
    education_level: str
    job_title: str

class InsightsRequest(BaseModel):
    job_title: str
    predicted_salary: float
    years_experience: float

# --- ROUTES ---

@app.get("/jobs")
def get_jobs():
    """Returns list of available job titles for the dropdown"""
    return sorted(job_list)

@app.post("/predict")
def predict_salary(req: PredictionRequest):
    try:
        # 1. Encode Inputs
        # Handle case where job title isn't in training set (fallback)
        try:
            job_encoded = le_job.transform([req.job_title])[0]
        except ValueError:
            # Simple fallback: use median code or specific 'unknown' logic

            job_encoded = le_job.transform([le_job.classes_[0]])[0] 

        try:
            edu_encoded = le_education.transform([req.education_level])[0]
        except ValueError:
             edu_encoded = le_education.transform(["Bachelor's"])[0]

        # 2. Predict
        features = np.array([[req.years_experience, edu_encoded, job_encoded]])
        prediction = model.predict(features)[0]

        # 3. Get Database Stats for this job (Context for frontend)
        job_stats = raw_df[raw_df['Job Title'] == req.job_title]['Salary'].describe()
        
        return {
            "predicted_salary": round(prediction, 2),
            "currency": "USD",
            "database_stats": {
                "mean": round(job_stats['mean'], 2) if not job_stats.empty else 0,
                "count": int(job_stats['count']) if not job_stats.empty else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag-insights")
def get_insights(req: InsightsRequest):
    """
    RAG Implementation:
    1. Retrieve: Get stats and requirements for this specific job from our CSV.
    2. Augment: Create a prompt with this specific data.
    3. Generate: Send to Gemini.
    """
    if not GENAI_API_KEY:
        return {"insights": "API Key not configured. Please set GEMINI_API_KEY in server.py."}

    # 1. Retrieval (Pandas as our 'Vector DB' equivalent for this size)
    relevant_rows = raw_df[raw_df['Job Title'] == req.job_title]
    
    if relevant_rows.empty:
        context = "No specific data found in database."
    else:
        avg_sal = relevant_rows['Salary'].mean()
        max_sal = relevant_rows['Salary'].max()
        avg_exp = relevant_rows['Years of Experience'].mean()
        context = f"Database Data: Average Salary: ${avg_sal:,.0f}, Max Salary: ${max_sal:,.0f}, Avg Experience: {avg_exp:.1f} years."

    # 2. Augment Prompt
    prompt = f"""
    You are a career counselor.
    User Profile: {req.job_title} with {req.years_experience} years experience.
    Predicted Salary: ${req.predicted_salary:,.2f}.
    
    Context from our real Salary Database: {context}
    
    Task:
    1. Analyze if their predicted salary is fair based on the database context.
    2. Suggest 3 specific skills they should learn to increase their salary.
    3. Keep it encouraging but realistic.
    """

    # 3. Generate
    try:
        gemini_model = genai.GenerativeModel('gemini-pro')
        response = gemini_model.generate_content(prompt)
        return {"insights": response.text}
    except Exception as e:
        return {"insights": f"Error generating insights: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)