export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  specialization?: string;
  experience?: number;
  availability?: Record<string, string[]>;
  isActive?: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  reportUrls?: string[];
  createdAt: string;
}

export interface Diagnosis {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  symptoms: string;
  aiSuggestions?: string;
  finalDiagnosis: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  diagnosisId: string;
  patientId: string;
  doctorId: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    notes?: string;
  }[];
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
}
