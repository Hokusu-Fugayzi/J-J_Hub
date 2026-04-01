-- JonahandJulian Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  assigned_to text not null default 'both' check (assigned_to in ('jonah', 'julian', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sprints (must be created before tasks since tasks references it)
create table sprints (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  goal text not null default '',
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  sprint_id uuid references sprints(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to text not null default 'both' check (assigned_to in ('jonah', 'julian', 'both')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notes table
create table notes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  content text not null default '',
  created_by text not null check (created_by in ('jonah', 'julian')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Calendar Events
create table events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  date date not null,
  end_date date,
  start_time time not null default '00:00',
  duration_minutes integer not null default 60,
  assigned_to text not null default 'both' check (assigned_to in ('jonah', 'julian', 'both')),
  color text not null default 'blue',
  category text not null default 'other' check (category in ('meeting', 'deadline', 'reminder', 'social', 'travel', 'other')),
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Standup Entries
create table standups (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  date date not null default current_date,
  did text not null default '',
  doing text not null default '',
  blockers text not null default '',
  created_at timestamptz not null default now()
);

-- CRM: Contacts
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  notes text not null default '',
  tags jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CRM: Deals
create table deals (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  value numeric not null default 0,
  stage text not null default 'lead' check (stage in ('lead', 'proposal', 'negotiation', 'won', 'lost')),
  contact_id uuid references contacts(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CRM: Contact Activities
create table contact_activities (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid not null references contacts(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note')),
  description text not null default '',
  date date not null default current_date,
  created_by text not null check (created_by in ('jonah', 'julian')),
  created_at timestamptz not null default now()
);

-- News Posts
create table news_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null default '',
  author text not null check (author in ('jonah', 'julian')),
  category text not null default 'update' check (category in ('announcement', 'update', 'idea', 'link')),
  pinned boolean not null default false,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mood Status
create table moods (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  emoji text not null,
  label text not null default '',
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique("user", date)
);

-- Fitness: Workout Logs
create table workout_logs (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  date date not null default current_date,
  routine_day text not null,
  exercises_completed jsonb not null default '[]',
  duration_minutes integer not null default 0,
  energy_level integer not null default 3 check (energy_level between 1 and 5),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- Fitness: Water Logs
create table water_logs (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  date date not null default current_date,
  glasses integer not null default 0,
  goal integer not null default 12,
  created_at timestamptz not null default now(),
  unique("user", date)
);

-- Fitness: Daily Check-Ins
create table daily_checkins (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  date date not null default current_date,
  weight numeric,
  sleep_hours numeric,
  soreness integer check (soreness between 1 and 5),
  worked_out boolean not null default false,
  hit_water_goal boolean not null default false,
  alcohol boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique("user", date)
);

-- Fitness: Weigh-Ins
create table weigh_ins (
  id uuid primary key default uuid_generate_v4(),
  "user" text not null check ("user" in ('jonah', 'julian')),
  date date not null default current_date,
  weight numeric not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index tasks_project_id_idx on tasks(project_id);
create index tasks_status_idx on tasks(status);
create index tasks_assigned_to_idx on tasks(assigned_to);
create index tasks_sprint_id_idx on tasks(sprint_id);
create index notes_project_id_idx on notes(project_id);
create index events_date_idx on events(date);
create index standups_date_idx on standups(date);
create index deals_stage_idx on deals(stage);
create index deals_contact_id_idx on deals(contact_id);
create index contact_activities_contact_id_idx on contact_activities(contact_id);
create index workout_logs_user_date_idx on workout_logs("user", date);
create index water_logs_user_date_idx on water_logs("user", date);
create index daily_checkins_user_date_idx on daily_checkins("user", date);
create index weigh_ins_user_date_idx on weigh_ins("user", date);
