from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

class RawTestResult(BaseModel):
    test_name: str
    raw_value: str
    unit: Optional[str] = None

class PatientReport(BaseModel):
    patient_id: str
    patient_name: str
    mrn: str
    recorded_age: Optional[int] = None
    biological_sex: Optional[str] = None
    is_age_missing: bool = False
    is_sex_missing: bool = False
    date_of_issuance: Optional[str] = None
    file_name: str
    raw_results: List[RawTestResult] = []

class ReportMetadata(BaseModel):
    patient_id: str
    patient_name: str
    mrn: str
    file_name: str
    recorded_age: Optional[int] = None
    biological_sex: Optional[str] = None
    is_age_missing: bool = False
    is_sex_missing: bool = False

class ClassifiedTestResult(BaseModel):
    reported_test: str
    canonical_test: str
    reported_value: Any
    reported_unit: Optional[str] = None
    converted_value: Optional[float] = None
    converted_unit: Optional[str] = None
    conversion_applied: bool = False
    conversion_note: Optional[str] = None
    applicable_min: Optional[float] = None
    applicable_max: Optional[float] = None
    expected_range_display: str
    status: str  # NORMAL, LOW, HIGH, URGENT_LOW, URGENT_HIGH, CANNOT_BE_CLASSIFIED
    is_urgent: bool = False
    urgent_trigger: Optional[str] = None
    is_boundary_value: bool = False
    source_file: str
    status_reason: str

class AnalysisRequest(BaseModel):
    patient_id: str
    override_age: Optional[int] = None
    override_sex: Optional[str] = None

class AnalysisResponse(BaseModel):
    patient_id: str
    patient_name: str
    mrn: str
    demographics: Dict[str, Any]
    demographics_missing: bool = False
    demographics_prompt: Optional[str] = None
    has_urgent_values: bool = False
    urgent_warning: Optional[str] = None
    results: List[ClassifiedTestResult] = []
    layman_summary: str
    doctor_questions: List[str] = []
    disclaimer: str
    provider_used: str = "deterministic"

class ChatRequest(BaseModel):
    active_patient_id: str
    query: str

class ChatResponse(BaseModel):
    active_patient_id: str
    allowed: bool
    response: str
    reason: Optional[str] = None
    provider_used: str = "deterministic"
