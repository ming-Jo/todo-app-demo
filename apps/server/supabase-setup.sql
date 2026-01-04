-- Supabase 테이블 생성 스크립트
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_id_completed ON todos(user_id, completed);

-- Row Level Security (RLS) 명시적 비활성화
-- 서버에서 user_id를 검증하므로 RLS는 비활성화합니다
-- RLS가 활성화되어 있으면 보안 에러가 발생할 수 있으므로 명시적으로 비활성화합니다
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- RLS가 이미 활성화되어 있는 경우를 대비하여 정책 삭제
DROP POLICY IF EXISTS "Enable all operations for service role" ON todos;
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거가 있으면 삭제 (재실행 시 에러 방지)
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;

-- updated_at 트리거 생성
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS 정책이 필요한 경우 (Service Role Key 사용 불가능한 경우)
-- 아래 주석을 해제하고 위의 RLS 비활성화 코드를 주석 처리하세요
-- ============================================
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
--
-- -- Service Role이 모든 작업을 수행할 수 있도록 정책 생성
-- CREATE POLICY "Enable all operations for service role"
--   ON todos
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);
--
-- 또는 사용자별 접근 제어가 필요한 경우:
--
-- -- 사용자는 자신의 todos만 조회 가능
-- CREATE POLICY "Users can view own todos"
--   ON todos FOR SELECT
--   USING (auth.uid()::text = user_id);
--
-- -- 사용자는 자신의 todos만 생성 가능
-- CREATE POLICY "Users can insert own todos"
--   ON todos FOR INSERT
--   WITH CHECK (auth.uid()::text = user_id);
--
-- -- 사용자는 자신의 todos만 수정 가능
-- CREATE POLICY "Users can update own todos"
--   ON todos FOR UPDATE
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);
--
-- -- 사용자는 자신의 todos만 삭제 가능
-- CREATE POLICY "Users can delete own todos"
--   ON todos FOR DELETE
--   USING (auth.uid()::text = user_id);

