import os
import io
from typing import List

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv # type: ignore

import google.generativeai as genai # type: ignore
from pdfminer.high_level import extract_text # pyright: ignore[reportMissingImports]

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

class ResumeAnalysis(BaseModel):
    candidate_name: str
    years_of_experience: float
    skills: List[str]
    summary: str
    rating_score: int
    pros: List[str]
    cons: List[str]
    
app = FastAPI(title="Recruitly Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to extract text from PDF
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_bytes)
        text = extract_text(pdf_file)
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""
    
@app.post("/analyze-resume", response_model=ResumeAnalysis)
async def analyze_resume(
    file: UploadFile = File(...),
    job_title: str = Form(...),
    job_description: str = Form(...)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    file_content = await file.read()
    resume_text = extract_text_from_pdf(file_content)
    
    if not resume_text or len(resume_text) < 50:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. It might be an image scan.")

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config={"response_mime_type": "application/json"}
    )
    
    prompt = f"""
    You are an expert Technical Recruiter. 
    
    Role: {job_title}
    Job Description: {job_description}
    
    Candidate Resume:
    {resume_text}
    
    Task:
    Analyze the candidate's suitability for THIS SPECIFIC ROLE. 
    Give a 'rating_score' from 0 to 100 based strictly on how well they match the Job Description.
    
    Required JSON Structure:
    {{
        "candidate_name": "Name",
        "years_of_experience": 0.0,
        "skills": ["skill1", "skill2"],
        "summary": "Brief summary highlighting fit for the role",
        "rating_score": 0,
        "pros": ["strength1", "strength2"],
        "cons": ["weakness1", "weakness2"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        return ResumeAnalysis.model_validate_json(response.text)
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Error processing resume with AI model.")
    
@app.get("/")
def health_check():
    return {"status": "ok", "service": "Resume Parser AI"}