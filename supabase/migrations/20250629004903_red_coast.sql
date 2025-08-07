-- Fix missing foreign key for users table reference
DO $$
BEGIN
  -- Add foreign key constraint for user_profiles if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers for tables that have updated_at column
DO $$
DECLARE
  table_name text;
  tables_with_updated_at text[] := ARRAY[
    'user_profiles', 'budgets', 'investments', 'tasks', 'goals', 
    'contacts', 'learning_paths', 'crisis_settings', 'user_preferences', 
    'ai_conversations'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_with_updated_at
  LOOP
    -- Drop trigger if exists and recreate
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', table_name, table_name);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at 
                    BEFORE UPDATE ON %s 
                    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', 
                   table_name, table_name);
  END LOOP;
END $$;

-- Add missing indexes for better performance (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, active);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON budgets(user_id, active);
CREATE INDEX IF NOT EXISTS idx_investments_user_type ON investments(user_id, investment_type);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_interactions_user_date ON interactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_active ON learning_paths(user_id, active);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_date ON quiz_sessions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_priority ON emergency_contacts(user_id, priority_order);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_category ON user_preferences(user_id, category);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated ON ai_conversations(user_id, updated_at DESC);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tasks_user_completed_priority ON tasks(user_id, completed, priority);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category_date ON expenses(user_id, category, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_type_logged ON health_logs(user_id, type, logged_at DESC);

-- Add check constraints for data validation
DO $$
BEGIN
  -- Add email validation for contacts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'contacts_email_check'
  ) THEN
    ALTER TABLE contacts 
    ADD CONSTRAINT contacts_email_check 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Add phone validation for contacts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'contacts_phone_check'
  ) THEN
    ALTER TABLE contacts 
    ADD CONSTRAINT contacts_phone_check 
    CHECK (phone IS NULL OR length(phone) >= 10);
  END IF;

  -- Add positive amount check for expenses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'expenses_amount_positive'
  ) THEN
    ALTER TABLE expenses 
    ADD CONSTRAINT expenses_amount_positive 
    CHECK (amount > 0);
  END IF;

  -- Add positive budget limit check
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'budgets_limit_positive'
  ) THEN
    ALTER TABLE budgets 
    ADD CONSTRAINT budgets_limit_positive 
    CHECK (monthly_limit > 0);
  END IF;

  -- Add progress percentage validation for learning paths
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'learning_paths_progress_check'
  ) THEN
    ALTER TABLE learning_paths 
    ADD CONSTRAINT learning_paths_progress_check 
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
  END IF;

  -- Add priority order validation for emergency contacts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'emergency_contacts_priority_check'
  ) THEN
    ALTER TABLE emergency_contacts 
    ADD CONSTRAINT emergency_contacts_priority_check 
    CHECK (priority_order > 0);
  END IF;
END $$;

-- Create performance monitoring view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id as user_id,
  up.full_name,
  up.created_at as user_created,
  (SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id) as total_tasks,
  (SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id AND t.completed = true) as completed_tasks,
  (SELECT COUNT(*) FROM health_logs hl WHERE hl.user_id = u.id) as health_logs_count,
  (SELECT COUNT(*) FROM expenses e WHERE e.user_id = u.id) as expenses_count,
  (SELECT COUNT(*) FROM contacts c WHERE c.user_id = u.id) as contacts_count,
  (SELECT COUNT(*) FROM learning_paths lp WHERE lp.user_id = u.id AND lp.active = true) as active_learning_paths,
  (SELECT MAX(logged_at) FROM health_logs hl WHERE hl.user_id = u.id) as last_health_log,
  (SELECT MAX(date) FROM expenses e WHERE e.user_id = u.id) as last_expense,
  up.updated_at as profile_updated
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- Create data archiving function for old records
CREATE OR REPLACE FUNCTION archive_old_data(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER := 0;
  cutoff_date DATE := CURRENT_DATE - INTERVAL '1 day' * days_old;
BEGIN
  -- Archive old health logs (keep last 2 years by default)
  WITH archived AS (
    DELETE FROM health_logs 
    WHERE logged_at < cutoff_date 
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Archive old interactions
  WITH archived AS (
    DELETE FROM interactions 
    WHERE date < cutoff_date 
    RETURNING *
  )
  SELECT archived_count + COUNT(*) INTO archived_count FROM archived;
  
  -- Archive old quiz sessions
  WITH archived AS (
    DELETE FROM quiz_sessions 
    WHERE completed_at < cutoff_date 
    RETURNING *
  )
  SELECT archived_count + COUNT(*) INTO archived_count FROM archived;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_tasks', (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid),
    'completed_tasks', (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND completed = true),
    'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = user_uuid),
    'health_logs_count', (SELECT COUNT(*) FROM health_logs WHERE user_id = user_uuid),
    'contacts_count', (SELECT COUNT(*) FROM contacts WHERE user_id = user_uuid),
    'learning_paths_count', (SELECT COUNT(*) FROM learning_paths WHERE user_id = user_uuid AND active = true),
    'avg_mood', (SELECT COALESCE(AVG(mood_score), 0) FROM health_logs WHERE user_id = user_uuid AND type = 'mood'),
    'last_activity', (SELECT MAX(greatest(
      COALESCE((SELECT MAX(updated_at) FROM tasks WHERE user_id = user_uuid), '1970-01-01'::timestamp),
      COALESCE((SELECT MAX(logged_at) FROM health_logs WHERE user_id = user_uuid), '1970-01-01'::timestamp),
      COALESCE((SELECT MAX(created_at) FROM expenses WHERE user_id = user_uuid), '1970-01-01'::timestamp)
    )))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add data validation function
CREATE OR REPLACE FUNCTION validate_user_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  issues JSON;
BEGIN
  SELECT json_build_object(
    'missing_profile', NOT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = user_uuid),
    'incomplete_onboarding', EXISTS(SELECT 1 FROM user_profiles WHERE user_id = user_uuid AND onboarding_completed = false),
    'no_recent_activity', NOT EXISTS(
      SELECT 1 FROM (
        SELECT user_id FROM tasks WHERE user_id = user_uuid AND updated_at > NOW() - INTERVAL '30 days'
        UNION
        SELECT user_id FROM health_logs WHERE user_id = user_uuid AND logged_at > NOW() - INTERVAL '30 days'
        UNION
        SELECT user_id FROM expenses WHERE user_id = user_uuid AND created_at > NOW() - INTERVAL '30 days'
      ) recent_activity
    ),
    'orphaned_records', EXISTS(
      SELECT 1 FROM tasks WHERE user_id = user_uuid AND parent_task_id IS NOT NULL 
      AND parent_task_id NOT IN (SELECT id FROM tasks WHERE user_id = user_uuid)
    )
  ) INTO issues;
  
  RETURN issues;
END;
$$ LANGUAGE plpgsql;

-- Create backup function for user data
CREATE OR REPLACE FUNCTION backup_user_data(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  backup_data JSON;
BEGIN
  SELECT json_build_object(
    'user_profile', (SELECT row_to_json(up) FROM user_profiles up WHERE up.user_id = user_uuid),
    'tasks', (SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM tasks t WHERE t.user_id = user_uuid),
    'health_logs', (SELECT COALESCE(json_agg(row_to_json(hl)), '[]'::json) FROM health_logs hl WHERE hl.user_id = user_uuid),
    'expenses', (SELECT COALESCE(json_agg(row_to_json(e)), '[]'::json) FROM expenses e WHERE e.user_id = user_uuid),
    'contacts', (SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) FROM contacts c WHERE c.user_id = user_uuid),
    'goals', (SELECT COALESCE(json_agg(row_to_json(g)), '[]'::json) FROM goals g WHERE g.user_id = user_uuid),
    'learning_paths', (SELECT COALESCE(json_agg(row_to_json(lp)), '[]'::json) FROM learning_paths lp WHERE lp.user_id = user_uuid),
    'preferences', (SELECT COALESCE(json_agg(row_to_json(up)), '[]'::json) FROM user_preferences up WHERE up.user_id = user_uuid),
    'backup_timestamp', NOW()
  ) INTO backup_data;
  
  RETURN backup_data;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned data
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
BEGIN
  -- Clean up tasks with invalid parent references
  WITH cleaned AS (
    UPDATE tasks 
    SET parent_task_id = NULL 
    WHERE parent_task_id IS NOT NULL 
    AND parent_task_id NOT IN (SELECT id FROM tasks)
    RETURNING *
  )
  SELECT COUNT(*) INTO cleanup_count FROM cleaned;
  
  -- Clean up flashcards with invalid learning path references
  WITH cleaned AS (
    DELETE FROM flashcards 
    WHERE learning_path_id NOT IN (SELECT id FROM learning_paths)
    RETURNING *
  )
  SELECT cleanup_count + COUNT(*) INTO cleanup_count FROM cleaned;
  
  -- Clean up quiz sessions with invalid learning path references
  WITH cleaned AS (
    DELETE FROM quiz_sessions 
    WHERE learning_path_id NOT IN (SELECT id FROM learning_paths)
    RETURNING *
  )
  SELECT cleanup_count + COUNT(*) INTO cleanup_count FROM cleaned;
  
  -- Clean up interactions with invalid contact references
  WITH cleaned AS (
    DELETE FROM interactions 
    WHERE contact_id NOT IN (SELECT id FROM contacts)
    RETURNING *
  )
  SELECT cleanup_count + COUNT(*) INTO cleanup_count FROM cleaned;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION backup_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_data() TO authenticated;