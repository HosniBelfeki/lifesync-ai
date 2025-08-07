export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  date_format: string;
  onboarding_completed: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  user_id: string;
  type: 'mood' | 'weight' | 'exercise' | 'sleep' | 'water' | 'steps' | 'symptom';
  value?: number;
  unit?: string;
  mood_score?: number;
  notes?: string;
  tags?: string[];
  logged_at: string;
  created_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  meals: any[];
  nutritional_info: Record<string, any>;
  dietary_restrictions?: string[];
  calories_target?: number;
  date_range?: string;
  ai_generated: boolean;
  created_at: string;
}

export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dosage?: string;
  frequency: string;
  times?: string[];
  start_date?: string;
  end_date?: string;
  notes?: string;
  active: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  payment_method?: string;
  tags?: string[];
  receipt_url?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
  alert_threshold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  shares?: number;
  purchase_price?: number;
  current_price?: number;
  purchase_date?: string;
  investment_type: 'stock' | 'bond' | 'etf' | 'crypto' | 'mutual_fund';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ai_priority_score?: number;
  due_date?: string;
  estimated_duration?: string;
  actual_duration?: string;
  tags?: string[];
  project_id?: string;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  milestones: any[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship_type?: string;
  birthday?: string;
  anniversary?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  last_contact_date?: string;
  contact_frequency_days: number;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;
  interaction_type: 'call' | 'text' | 'email' | 'meeting' | 'gift' | 'other';
  description?: string;
  date: string;
  mood_rating?: number;
  created_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: string;
  progress_percentage: number;
  modules: any[];
  ai_generated: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  learning_path_id: string;
  front_text: string;
  back_text: string;
  difficulty_level: number;
  last_reviewed?: string;
  next_review?: string;
  review_count: number;
  success_count: number;
  tags?: string[];
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  learning_path_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  duration?: string;
  completed_at: string;
}

export interface CrisisSettings {
  id: string;
  user_id: string;
  burnout_monitoring_enabled: boolean;
  stress_threshold: number;
  check_in_frequency_hours: number;
  auto_alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface BurnoutMetric {
  id: string;
  user_id: string;
  stress_level: number;
  energy_level: number;
  work_satisfaction: number;
  sleep_quality: number;
  social_connection: number;
  burnout_risk_score: number;
  notes?: string;
  logged_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority_order: number;
  active: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  category: string;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  conversation_id: string;
  messages: any[];
  context_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}