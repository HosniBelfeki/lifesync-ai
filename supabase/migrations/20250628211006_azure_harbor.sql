/*
  # LifeSync AI - Comprehensive Database Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `health_logs` - Health tracking data (mood, symptoms, medications)
    - `meal_plans` - AI-generated meal plans and nutrition tracking
    - `medications` - Medication schedules and reminders
    - `expenses` - Financial transactions and expense tracking
    - `budgets` - Budget categories and limits
    - `investments` - Investment portfolio tracking
    - `tasks` - Task management with AI prioritization
    - `goals` - Goal setting and progress tracking
    - `contacts` - Relationship management
    - `interactions` - Contact interaction history
    - `learning_paths` - Personalized learning roadmaps
    - `flashcards` - Learning flashcard system
    - `quiz_sessions` - Spaced repetition quiz tracking
    - `crisis_settings` - Crisis prevention configuration
    - `burnout_metrics` - Burnout detection data
    - `emergency_contacts` - Emergency contact information
    - `user_preferences` - User preferences and settings
    - `ai_conversations` - AI chat history and context

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Secure data isolation per user

  3. Features
    - Comprehensive life management modules
    - AI-powered insights and recommendations
    - Real-time data synchronization
    - Privacy-first architecture
*/

-- User Profiles (Extended)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  date_format text DEFAULT 'MM/DD/YYYY',
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health Monitor Module
CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('mood', 'weight', 'exercise', 'sleep', 'water', 'steps', 'symptom')),
  value numeric,
  unit text,
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 5),
  notes text,
  tags text[],
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  meals jsonb NOT NULL DEFAULT '[]',
  nutritional_info jsonb DEFAULT '{}',
  dietary_restrictions text[],
  calories_target integer,
  date_range daterange,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text NOT NULL,
  times time[],
  start_date date,
  end_date date,
  notes text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Finance Tracker Module
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  category text NOT NULL,
  subcategory text,
  description text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  payment_method text,
  tags text[],
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  monthly_limit numeric(10,2) NOT NULL,
  current_spent numeric(10,2) DEFAULT 0,
  alert_threshold numeric(3,2) DEFAULT 0.8,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text NOT NULL,
  shares numeric(10,4),
  purchase_price numeric(10,2),
  current_price numeric(10,2),
  purchase_date date,
  investment_type text CHECK (investment_type IN ('stock', 'bond', 'etf', 'crypto', 'mutual_fund')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Productivity Tools Module
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  ai_priority_score integer,
  due_date timestamptz,
  estimated_duration interval,
  actual_duration interval,
  tags text[],
  project_id uuid,
  parent_task_id uuid REFERENCES tasks(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  target_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  milestones jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relationship Manager Module
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  relationship_type text,
  birthday date,
  anniversary date,
  address text,
  notes text,
  tags text[],
  last_contact_date date,
  contact_frequency_days integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('call', 'text', 'email', 'meeting', 'gift', 'other')),
  description text,
  date date DEFAULT CURRENT_DATE,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Learning Assistant Module
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration interval,
  progress_percentage numeric(5,2) DEFAULT 0,
  modules jsonb DEFAULT '[]',
  ai_generated boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  difficulty_level integer DEFAULT 1,
  last_reviewed timestamptz,
  next_review timestamptz,
  review_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  tags text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id uuid REFERENCES learning_paths(id) ON DELETE CASCADE,
  score numeric(5,2),
  total_questions integer,
  correct_answers integer,
  duration interval,
  completed_at timestamptz DEFAULT now()
);

-- Crisis Prevention Module
CREATE TABLE IF NOT EXISTS crisis_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  burnout_monitoring_enabled boolean DEFAULT true,
  stress_threshold integer DEFAULT 7,
  check_in_frequency_hours integer DEFAULT 24,
  auto_alerts_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS burnout_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  work_satisfaction integer CHECK (work_satisfaction >= 1 AND work_satisfaction <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  social_connection integer CHECK (social_connection >= 1 AND social_connection <= 10),
  burnout_risk_score numeric(5,2),
  notes text,
  logged_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  email text,
  priority_order integer DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Preferences and AI Context
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  context_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their own profile" ON user_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health logs" ON health_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meal plans" ON meal_plans
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications" ON medications
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own expenses" ON expenses
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets" ON budgets
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own investments" ON investments
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals" ON goals
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts" ON contacts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interactions" ON interactions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own learning paths" ON learning_paths
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own flashcards" ON flashcards
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quiz sessions" ON quiz_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own crisis settings" ON crisis_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own burnout metrics" ON burnout_metrics
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own emergency contacts" ON emergency_contacts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI conversations" ON ai_conversations
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_logs_user_type_date ON health_logs(user_id, type, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_contacts_user_last_contact ON contacts(user_id, last_contact_date);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_burnout_metrics_user_date ON burnout_metrics(user_id, logged_at DESC);