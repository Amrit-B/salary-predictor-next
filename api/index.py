import json
import csv
import os
import requests
import math
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
GENAI_KEY = os.getenv("GEMINI_API_KEY")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

weight_path = os.path.join(os.path.dirname(BASE_DIR), 'model_weights.json')
data_path = os.path.join(os.path.dirname(BASE_DIR), 'Salary Data.csv')

if not os.path.exists(weight_path): weight_path = os.path.join(BASE_DIR, 'model_weights.json')
if not os.path.exists(data_path): data_path = os.path.join(BASE_DIR, 'Salary Data.csv')

with open(weight_path, 'r') as f:
    model = json.load(f)

raw_data = []
with open(data_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['Salary'] and row['Salary'].strip():
            raw_data.append({
                'title': row['Job Title'],
                'salary': float(row['Salary']),
                'edu': row['Education Level']
            })

class Inputs(BaseModel):
    years_experience: float
    education_level: str
    job_title: str

class InsightsRequest(BaseModel):
    job_title: str
    predicted_salary: float
    years_experience: float

@app.get("/api/jobs")
def get_jobs():
    return model.get('job_list', [])

@app.post("/api/predict")
def predict(req: Inputs):
    c = model['coefficients']
    m = model['mappings']
    defaults = model['defaults']

    edu_score = m['education'].get(req.education_level, defaults['education'])
    job_score = m['job'].get(req.job_title, defaults['job'])

    log_val = model['intercept'] + \
              (req.years_experience * c['experience'] * 4.0) + \
              (edu_score * c['education']) + \
              (job_score * c['job'])

    pred_salary = math.exp(log_val)

    matches = [r['salary'] for r in raw_data if r['title'] == req.job_title]
    avg_salary = sum(matches) / len(matches) if matches else 0

    return {
        "predicted_salary": round(pred_salary, 2),
        "database_stats": {"mean": round(avg_salary, 2), "count": len(matches)}
    }

@app.post("/api/rag-insights")
def insights(req: InsightsRequest):
    if not GENAI_KEY:
        return {"insights": "Configuration Error: GEMINI_API_KEY is missing."}

    matches = [r for r in raw_data if r['title'] == req.job_title]
    
    if matches:
        sals = [r['salary'] for r in matches]
        context = f"Database stats for {req.job_title}: Avg ${sum(sals)/len(sals):,.0f}, Range ${min(sals):,.0f}-${max(sals):,.0f}."
    else:
        context = "No historical data found for this specific role."

    prompt = f"""
    Act as a career strategist.
    User: {req.job_title} ({req.years_experience} YOE).
    Prediction: ${req.predicted_salary:,.0f}.
    Market Context: {context}

    Give 3 concise bullet points:
    1. Salary Fairness Verdict
    2. One Key Skill to learn to boost this number
    3. One Strategic Move for the next 12 months
    """

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={GENAI_KEY}"
    
    try:
        response = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
        
        if response.status_code == 200:
            return {"insights": response.json()["candidates"][0]["content"]["parts"][0]["text"]}
        else:
            print(f"Gemini API Error: {response.status_code} - {response.text}")
            return {"insights": f"AI unavailable (Error {response.status_code}). Please check server logs."}
            
    except Exception as e:
        print(f"Connection Error: {e}")
        return {"insights": "AI service connection failed."}