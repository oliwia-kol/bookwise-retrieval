-- Table to store the backend API URL for dynamic discovery
CREATE TABLE public.backend_config (
  id text PRIMARY KEY DEFAULT 'default',
  api_url text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Allow anyone to read (frontend needs this)
ALTER TABLE public.backend_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read backend config"
ON public.backend_config
FOR SELECT
USING (true);

-- Allow anyone to upsert (for dev convenience - backend registers itself)
CREATE POLICY "Anyone can upsert backend config"
ON public.backend_config
FOR ALL
USING (true)
WITH CHECK (true);