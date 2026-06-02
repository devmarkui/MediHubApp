export type Gender = 'male' | 'female' | 'other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Language = 'en' | 'si' | 'ta';

export type Patient = {
  id: number;
  passbook_no: string;
  phone: string;
  name: string;
  email: string | null;
  dob: string | null;
  gender: Gender | null;
  blood_group: BloodGroup | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  language: Language;
  avatar_url: string | null;
  parent_patient_id: number | null;
  member_since: string | null;
  is_active: boolean;
  created_at: string;
};

export type Doctor = {
  id: number;
  name: string;
  slug: string;
  specialization: string;
  qualifications: string;
  bio: string | null;
  avatar_url: string | null;
  consultation_fee: number;
  languages: Language[];
  is_active: boolean;
  display_order: number;
  schedules?: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    max_patients: number;
  }>;
};

export type Slot = { time: string; available: boolean };

export type Appointment = {
  id: number;
  appointment_no: string;
  patient_id: number;
  doctor_id: number;
  doctor: Doctor | null;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  consultation_fee: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_method: 'online' | 'reception' | 'package' | null;
  notes: string | null;
  created_at: string;
};

export type LabTest = {
  id: number;
  code: string;
  name: string;
  name_si: string | null;
  name_ta: string | null;
  description: string | null;
  price: number;
  category: string;
  is_active: boolean;
};

export type LabOrderItem = {
  id: number;
  lab_test_id: number;
  test: LabTest | null;
  price: number;
  result_value: string | null;
  result_unit: string | null;
  result_normal_range: string | null;
  is_abnormal: boolean;
};

export type LabOrder = {
  id: number;
  order_no: string;
  patient_id: number;
  total_amount: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  status: 'ordered' | 'sample_collected' | 'processing' | 'ready' | 'delivered';
  collection_type: 'walk_in' | 'home';
  ordered_at: string | null;
  ready_at: string | null;
  items: LabOrderItem[] | null;
};

export type ReportType = 'lab' | 'consultation' | 'prescription' | 'imaging';
export type Report = {
  id: number | string;
  patient_id: number | null;
  lab_order_id: number | null;
  appointment_id: number | null;
  report_type: ReportType;
  title: string;
  file_size_kb: number;
  released_at: string;
  // Stage 3 — 'medihub' for new reports, 'legacy' for old EMR records.
  source?: 'medihub' | 'legacy';
  download_url?: string | null;
};

export type Package = {
  id: number;
  code: string;
  name: string;
  name_si: string | null;
  name_ta: string | null;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percent: number;
  validity_days: number;
  total_visits: number;
  image_url: string | null;
  inclusions: string[];
  included_test_codes: string[];
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
};

export type PackagePurchase = {
  id: number;
  purchase_no: string;
  package: Package | null;
  amount_paid: number;
  purchased_at: string;
  expires_at: string;
  visits_used: number;
  visits_total: number;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
};

export type Payment = {
  id: number;
  payment_no: string;
  amount: number;
  currency: string;
  method: 'payhere' | 'cash' | 'card_reception';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payable_type: string;
  payable_id: number;
  paid_at: string | null;
  created_at: string;
};

export type Notification = {
  id: number;
  title: string;
  body: string;
  type: 'appointment' | 'report' | 'package' | 'promo' | 'general';
  data: Record<string, unknown> | null;
  read_at: string | null;
  sent_at: string;
  is_read: boolean;
};

export type PassbookEntry = {
  id: string;
  type: 'consultation' | 'lab' | 'package';
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  reference_no: string;
  reference_id: number;
  occurred_at: string;
};

export type AppConfig = {
  clinic_info: {
    name: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  opening_hours: {
    open_time: string;
    close_time: string;
    open_label: string;
    close_label: string;
    days_label: string;
    is_open_now: boolean;
  };
  banner: { title: string; subtitle: string; action_code: string | null };
  appointment_whatsapp: string;
  min_supported_version: string;
  force_update_version: string;
  maintenance_mode: boolean;
  support_phone: string;
  support_whatsapp: string;
  currency: string;
  terms_url: string;
  privacy_url: string;
};
