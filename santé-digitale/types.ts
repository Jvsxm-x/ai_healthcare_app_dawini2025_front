

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active?: boolean;
  date_joined?: string;
  patient_profile?: Patient;
  is_staff: boolean ;// Linked profile
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user?: User; 
}

export interface Alert {
  id: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
  acknowledged?: boolean;
}

export interface MedicalRecord {
  _id?: string; // MongoDB ID
  id?: string | number; // Fallback
  systolic: number;
  diastolic: number;
  glucose: number;
  heart_rate: number;
  notes?: string;
  recorded_at: string; // Backend uses recorded_at
  created_at?: string;
}

// Backend Response format for Stats
export interface BackendStatsResponse {
  summary: {
    systolic: { avg: number; min: number; max: number };
    diastolic: { avg: number; min: number; max: number };
    glucose: { avg: number; min: number; max: number };
    heart_rate: { avg: number; min: number; max: number };
  };
  series: {
    timestamps: string[];
    systolic: number[];
    diastolic: number[];
    glucose: number[];
    heart_rate: number[];
  };
}

export interface MedicalStats {
  avg_systolic: number | null;
  avg_diastolic: number | null;
  avg_glucose: number | null;
  avg_heart_rate: number | null;
  total_records: number;
}

export interface Patient {
  id: number;
  user?: number;
  // Fields used in various components (some might be aliases depending on backend response)
  first_name?: string; 
  last_name?: string;
  birth_date?: string; 
  date_of_birth?: string;
  phone?: string;      
  phone_number?: string;
  
  role?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  email_verified?: boolean; // Frontend simulation
  two_factor_enabled?: boolean; // Admin setting
}

export interface PredictionResult {
  prediction: number | string;
  risk: 'Normal' | 'High';
  confidence?: number;
}

export interface Appointment {
  id: number;
  doctor: number;
  patient: number;
  appointment_date: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface MedicalDocument {
  id: number;
  title: string;
  document_type: string;
  uploaded_at: string;
  file?: string;
  file_size: number; // In bytes
  doctor_id?: number;
  doctor_name?: string;
  patient_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  ai_summary?: string;
  ai_tips?: string;
  ai_prediction_result?: string; // result from auto-prediction
}

export interface DoctorDashboardStats {
  patient_count: number;
  appointment_count: number;
}

export interface LabOrder {
  id: number;
  patient_id: number;
  patient_name: string;
  doctor_id: number;
  test_name: string;
  status: 'pending' | 'completed';
  requested_at: string;
  result_file?: string;
  ai_summary?: string;
}

export interface SystemSettings {
  systemName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  enforce2FA: boolean;
  sessionTimeout: number;
  aiConfidenceThreshold: number;
  enableBetaFeatures: boolean;
}