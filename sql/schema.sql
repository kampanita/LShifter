-- Users managed by Supabase Auth (auth.users)
-- We create a public profile table linked to auth.users

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#6B8E23',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE shift_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT,
  name TEXT NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  default_start TIME WITHOUT TIME ZONE,
  default_end TIME WITHOUT TIME ZONE,
  default_duration INT, -- minutes
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE days_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type_id UUID REFERENCES shift_types(id),
  note TEXT,
  is_holiday BOOLEAN DEFAULT false,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  UNIQUE (profile_id, date)
);

CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) NOT NULL,
  date DATE NOT NULL,
  name TEXT
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES days_assignments(id) ON DELETE CASCADE,
  content TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Indices for performance (querying by month and profile)
CREATE INDEX idx_days_profile_month ON days_assignments (profile_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE days_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Basic Policy: Users can only see their own profile data
-- (Note: precise policies depend on specific multi-user requirements, 
-- generic "auth.uid() = user_id" pattern assumed for profiles)
