
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
}

export interface AuthResponse {
  refresh: string;
  access: string;
  user?: User; // Optional based on backend implementation
}

export interface Alert {
  id: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_read: boolean;
  created_at: string;
}

export interface MedicalRecord {
  id: number;
  systolic: number;
  diastolic: number;
  glucose: number;
  heart_rate: number;
  notes: string;
  created_at: string;
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
  user_id?: number; // Link to user
  first_name?: string; // Computed from user
  last_name?: string; // Computed from user
  date_of_birth: string;
  phone_number: string;
  address: string;
  emergency_contact: string;
  medical_history: string;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionResult {
  prediction: number | string;
  confidence: number;
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
