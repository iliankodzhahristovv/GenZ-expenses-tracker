-- Income table schema
CREATE TABLE IF NOT EXISTS public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own income"
  ON public.income
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own income"
  ON public.income
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income"
  ON public.income
  FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income"
  ON public.income
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_user_id ON public.income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON public.income(date);
CREATE INDEX IF NOT EXISTS idx_income_deleted_at ON public.income(deleted_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_income_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_income_updated_at_trigger
  BEFORE UPDATE ON public.income
  FOR EACH ROW
  EXECUTE FUNCTION update_income_updated_at();







