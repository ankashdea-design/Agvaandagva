// Hand-written types matching supabase/migrations/0001_schema.sql.
// In a real deployment, replace/augment this with output from:
//   supabase gen types typescript --project-id YOUR_REF > types/database.ts

export type UserRole = "admin" | "teacher" | "parent";
export type MealStatus = "poor" | "medium" | "good";
export type MoodStatus = "sad" | "neutral" | "happy";
export type AttendanceStatus = "present" | "absent" | "sick" | "excused";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  class_id: string;
  full_name: string;
  birth_date: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface DailyReport {
  id: string;
  child_id: string;
  class_id: string;
  report_date: string;
  mood: MoodStatus | null;
  meal: MealStatus | null;
  nap_start: string | null;
  nap_end: string | null;
  hygiene_hands: boolean;
  hygiene_toilet: boolean;
  hygiene_teeth: boolean;
  highlight_note: string | null;
  extra_note: string | null;
  is_complete: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface DailyActivities {
  id: string;
  daily_report_id: string;
  drawing: boolean;
  music: boolean;
  story: boolean;
  play: boolean;
  physical: boolean;
  cognitive: boolean;
}

export interface Attendance {
  id: string;
  child_id: string;
  report_date: string;
  status: AttendanceStatus;
  marked_by: string | null;
}

export interface ChildWithReport extends Child {
  daily_report: DailyReport | null;
  daily_activities: DailyActivities | null;
  attendance: Attendance | null;
}

// Minimal Database generic to satisfy @supabase/ssr's generic client typing.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
