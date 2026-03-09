-- AlgoForge Database Schema Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. PROBLEMS TABLE (global, read-only for users)
-- ============================================
CREATE TYPE difficulty_enum AS ENUM ('Easy', 'Medium', 'Hard');

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  difficulty difficulty_enum NOT NULL,
  category TEXT NOT NULL,
  pattern TEXT DEFAULT '',
  importance_note TEXT DEFAULT '',
  is_starred BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 2. USER PROGRESS TABLE
-- ============================================
CREATE TYPE progress_status AS ENUM ('unsolved', 'attempted', 'solved');

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  status progress_status DEFAULT 'unsolved',
  language TEXT CHECK (language IN ('python', 'cpp')) DEFAULT 'python',
  notes TEXT DEFAULT '',
  solved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. AI SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES problems(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================

-- Problems: readable by everyone (public data)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Problems are publicly readable"
  ON problems FOR SELECT
  USING (true);

-- User Progress: users only see/modify their own
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- AI Sessions: users only see/modify their own
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON ai_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON ai_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON ai_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON ai_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_problem ON user_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_problem ON ai_sessions(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
