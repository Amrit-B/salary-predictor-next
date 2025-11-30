import json
import csv
import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- CONFIGURATION ---
GENAI_API_KEY = os.getenv("GEMINI_API_KEY", "") 

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# --- LOAD ARTIFACTS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'model_weights.json')
DATA_PATH = os.path.join(BASE_DIR, 'Salary Data.csv')

model_data = None
raw_data = []

# 1. Load the Lightweight JSON Model
try:
    with open(MODEL_PATH, 'r') as f:
        model_data = json.load(f)
except FileNotFoundError:
    print("WARNING: model_weights.json not found. Run train_light.py locally first.")

# 2. Load Data for RAG
try:
    with open(DATA_PATH, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            try:
                clean_row = {
                    'Job Title': row['Job Title'],
                    'Education Level': row['Education Level'],
                    'Salary': float(row['Salary']),
                    'Years of Experience': float(row['Years of Experience'])
                }
                raw_data.append(clean_row)
            except (ValueError, KeyError):
                continue 
except FileNotFoundError:
    print("WARNING: Salary Data.csv not found.")

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

@app.get("/api/jobs")
def get_jobs():
    if not model_data: return ["Error: Model not loaded"]
    return model_data.get('job_list', [])

@app.post("/api/predict")
def predict_salary(req: PredictionRequest):
    if not model_data: 
        raise HTTPException(status_code=500, detail="Model weights missing")
    
    try:
        # 1. Get Coefficients
        intercept = model_data['intercept']
        coef = model_data['coefficients']
        mappings = model_data['mappings']

        # 2. Encode Inputs (Manual lookup)
        edu_val = mappings['education'].get(req.education_level, 0)
        job_val = mappings['job'].get(req.job_title, 0)

        # 3. Calculate: y = mx + c
        # Access nested keys safely
        w_exp = coef.get('experience', 0)
        w_edu = coef.get('education', 0)
        w_job = coef.get('job', 0)

        predicted_value = intercept + \
                         (req.years_experience * w_exp) + \
                         (edu_val * w_edu) + \
                         (job_val * w_job)

        # 4. Get Database Stats
        salaries = [r['Salary'] for r in raw_data if r['Job Title'] == req.job_title]
        
        if salaries:
            mean_salary = sum(salaries) / len(salaries)
            count = len(salaries)
        else:
            mean_salary = 0
            count = 0
        
        return {
            "predicted_salary": round(predicted_value, 2),
            "currency": "USD",
            "database_stats": {
                "mean": round(mean_salary, 2),
                "count": count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag-insights")
def get_insights(req: InsightsRequest):
    if not GENAI_API_KEY:
        return {"insights": "API Key not configured."}

    # 1. Prepare Context
    relevant_rows = [r for r in raw_data if r['Job Title'] == req.job_title]
    
    if not relevant_rows:
        context = "No specific data found in database."
    else:
        salaries = [r['Salary'] for r in relevant_rows]
        experiences = [r['Years of Experience'] for r in relevant_rows]
        
        avg_sal = sum(salaries) / len(salaries)
        max_sal = max(salaries)
        avg_exp = sum(experiences) / len(experiences)
        
        context = f"Database Data: Average Salary: ${avg_sal:,.0f}, Max Salary: ${max_sal:,.0f}, Avg Experience: {avg_exp:.1f} years."

    # 2. Create Prompt
    prompt_text = f"""
    You are a career counselor.
    User Profile: {req.job_title} with {req.years_experience} years experience.
    Predicted Salary: ${req.predicted_salary:,.2f}.
    
    Context from our real Salary Database: {context}
    
    Task:
    1. Analyze if their predicted salary is fair based on the database context.
    2. Suggest 3 specific skills they should learn to increase their salary.
    3. Keep it encouraging but realistic.
    """

    # 3. Call Gemini via REST API (Ultra Lightweight)
    # We use gemini-1.5-flash as it is standard and fast
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key={GENAI_API_KEY}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }]
    }
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        
        # Extract text safely
        if "candidates" in data and data["candidates"]:
            return {"insights": data["candidates"][0]["content"]["parts"][0]["text"]}
        else:
            # Handle API errors gracefully
            error_msg = data.get('error', {}).get('message', 'Unknown error')
            return {"insights": f"AI could not generate a response. ({error_msg})"}
            
    except Exception as e:
        return {"insights": f"Error calling Gemini: {str(e)}"}